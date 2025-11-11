import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToDatabase } from '@/database/mongoose'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const token = searchParams.get('token') || ''
	if (!token) return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 400 })

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
		if (typeof nextPassword !== 'string' || nextPassword.length < 8) {
			return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
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

		const userId = (user as any).id || String((user as any)._id)

		// Hash the new password
		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(nextPassword, saltRounds)

		// Attempt to update Better Auth email/password record
		// Common collection name pattern: "email_password" with userId reference
		await db.collection('email_password').updateOne(
			{ userId },
			{ $set: { passwordHash: hashedPassword, hashedPassword } }
		)

		// Clear reset token fields on user
		await db.collection('user').updateOne(
			{ _id: (user as any)._id },
			{ $unset: { resetTokenHash: '', resetTokenExpiry: '' } }
		)

		return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 })
	} catch (e) {
		console.error('reset-password POST error:', e)
		return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 })
	}
}


