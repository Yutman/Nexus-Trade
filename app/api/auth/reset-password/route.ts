import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToDatabase } from '@/database/mongoose'
import bcrypt from 'bcryptjs'
import { getClientIp, hitRateLimit } from '@/lib/rate-limit'
import { PASSWORD_MAX_LENGTH, validatePassword } from '@/lib/validation/password'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const token = searchParams.get('token') || ''
	if (!token) return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 400 })
	
	const clientIp = getClientIp(request)
	const IP_LIMIT = Number(process.env.RESET_PW_GET_IP_LIMIT_PER_MIN || 20)
	const ipCheck = hitRateLimit('rp:get:ip', clientIp, IP_LIMIT, 60_000)
	if (ipCheck.limited) {
		console.warn(`Rate limit (reset GET IP) exceeded: ip=${clientIp}`)
		return new NextResponse(JSON.stringify({ valid: false, message: 'Too many requests. Please try again later.' }), {
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Retry-After': String(ipCheck.resetAfterSeconds || 60),
			},
		})
	}
	try {
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

		const mongoose = await connectToDatabase()
		const db = mongoose.connection.db
		if (!db) throw new Error('MongoDB connection not found')

		const user = await db.collection('user').findOne({
			resetTokenHash: tokenHash,
			resetTokenExpiry: { $gt: new Date() },
		})

		if (!user) {
			return NextResponse.json({ valid: false, message: 'Token is invalid or expired' }, { status: 400 })
		}

		return NextResponse.json({ valid: true }, { status: 200 })
	} catch (e) {
		console.error('reset-password GET error:', e)
		return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 400 })
	}
}

export async function POST(request: Request) {
	try {
		const { token, password, newPassword } = await request.json()
		const nextPassword = newPassword || password
		if (!token || !nextPassword) {
			return NextResponse.json({ message: 'Token and password are required' }, { status: 400 })
		}

		// Rate limit by IP and token (fixed window)
		const clientIp = getClientIp(request)
		const IP_LIMIT = Number(process.env.RESET_PW_IP_LIMIT_PER_MIN || 10)
		const TOKEN_LIMIT = Number(process.env.RESET_PW_TOKEN_LIMIT_PER_MIN || 10)

		const ipCheck = hitRateLimit('rp:ip', clientIp, IP_LIMIT, 60_000)
		if (ipCheck.limited) {
			console.warn(`Rate limit (reset POST IP) exceeded: ip=${clientIp}`)
			return new NextResponse(JSON.stringify({ message: 'Too many requests. Please try again later.' }), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(ipCheck.resetAfterSeconds || 60),
				},
			})
		}

		const tokenLimiter = hitRateLimit('rp:token', token, TOKEN_LIMIT, 60_000)
		if (tokenLimiter.limited) {
			console.warn(`Rate limit (reset POST token) exceeded.`)
			return new NextResponse(JSON.stringify({ message: 'Too many requests. Please try again later.' }), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(tokenLimiter.resetAfterSeconds || 60),
				},
			})
		}

		if (nextPassword.length > PASSWORD_MAX_LENGTH) {
      return NextResponse.json({ message: 'Password must not exceed 128 characters' }, { status: 400 })
}
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

		const mongoose = await connectToDatabase()
		const db = mongoose.connection.db
		if (!db) throw new Error('MongoDB connection not found')

		const user = await db.collection('user').findOne({
			resetTokenHash: tokenHash,
			resetTokenExpiry: { $gt: new Date() },
		})

		if (!user) {
			return NextResponse.json({ message: 'Token is invalid or expired' }, { status: 400 })
		}

		// Max attempts enforcement
		const MAX_ATTEMPTS = Number(process.env.RESET_PW_MAX_ATTEMPTS || 5)
		const attempts = Number((user as any).resetTokenAttempts || 0)
		if (attempts >= MAX_ATTEMPTS) {
			await db.collection('user').updateOne(
				{ _id: (user as any)._id },
				{ $unset: { resetTokenHash: '', resetTokenExpiry: '', resetTokenAttempts: '' } }
			)
			return NextResponse.json({ message: 'Token is invalid or expired' }, { status: 400 })
		}

		// Enforce password policy and count as failed attempt on bad input
		const validation = validatePassword(nextPassword)
		if (!validation.valid) {
			const updated = await db.collection('user').findOneAndUpdate(
				{ _id: (user as any)._id },
				{ $inc: { resetTokenAttempts: 1 } },
				{ returnDocument: 'after' }
			)
			const newAttempts = Number((updated.value as any)?.resetTokenAttempts || attempts + 1)
			if (newAttempts >= MAX_ATTEMPTS) {
				await db.collection('user').updateOne(
					{ _id: (user as any)._id },
					{ $unset: { resetTokenHash: '', resetTokenExpiry: '', resetTokenAttempts: '' } }
				)
			}
			return NextResponse.json({ message: validation.message || 'Invalid password' }, { status: 400 })
		}

		const userId = (user as any).id || String((user as any)._id)

		// Hash the new password
		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(nextPassword, saltRounds)

		// Attempt to update Better Auth email/password record
		// Common collection name pattern: "email_password" with userId reference
		const epResult = await db.collection('email_password').updateOne(
			{ userId },
			{ $set: { passwordHash: hashedPassword, hashedPassword } }
		)

		if (!epResult.acknowledged || epResult.matchedCount === 0) {
			console.error('email_password record not found for userId:', userId)
			return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 })
		}

		// Clear reset token fields on user
		await db.collection('user').updateOne(
			{ _id: (user as any)._id },
			{ $unset: { resetTokenHash: '', resetTokenExpiry: '', resetTokenAttempts: '' } }
		)

		return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 })
	} catch (e) {
		console.error('reset-password POST error:', e)
		return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 })
	}
}


