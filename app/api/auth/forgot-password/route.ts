import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToDatabase } from '@/database/mongoose'
import { transporter } from '@/lib/nodemailer'
import { getClientIp, hitRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
	try {
		const { email } = await request.json()
		if (!email || typeof email !== 'string') {
			return NextResponse.json({ message: 'Email is required' }, { status: 400 })
		}

		// Rate limiting (per-IP and per-email)
		const clientIp = getClientIp(request)
		// Defaults: X requests per minute (IP), Y per hour (email)
		const IP_LIMIT = Number(process.env.FORGOT_PW_IP_LIMIT_PER_MIN || 10) // safe default
		const EMAIL_LIMIT = Number(process.env.FORGOT_PW_EMAIL_LIMIT_PER_HOUR || 5)

		const ipCheck = hitRateLimit('fp:ip', clientIp, IP_LIMIT, 60_000)
		if (ipCheck.limited) {
			console.warn(`Rate limit (IP) exceeded: ip=${clientIp}`)
			return new NextResponse(
				JSON.stringify({ message: 'Too many requests. Please try again later.' }),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Retry-After': String(ipCheck.resetAfterSeconds || 60),
					},
				}
			)
		}

		const emailCheck = hitRateLimit('fp:email', email.toLowerCase(), EMAIL_LIMIT, 60 * 60_000)
		if (emailCheck.limited) {
			console.warn(`Rate limit (email) exceeded: email=${email}`)
			return new NextResponse(
				JSON.stringify({ message: 'Too many requests. Please try again later.' }),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Retry-After': String(emailCheck.resetAfterSeconds || 300),
					},
				}
			)
		}

		const mongoose = await connectToDatabase()
		const db = mongoose.connection.db
		if (!db) throw new Error('MongoDB connection not found')

		// Always generate a token, but only store it if user exists (to avoid user enumeration)
		const token = crypto.randomBytes(32).toString('hex')
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
		const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

		const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email })

		if (user) {
			await db.collection('user').updateOne(
				{ _id: user._id },
				{
					$set: {
						resetTokenHash: tokenHash,
						resetTokenExpiry: new Date(expiresAt),
					},
				}
			)

			const baseUrl =
				process.env.NEXT_PUBLIC_BASE_URL ||
				'http://localhost:3000'
			const resetUrl = `${baseUrl}/reset-password?token=${token}`

			const mailOptions = {
				from: `"NexusTrade" <${process.env.NODEMAILER_EMAIL || 'noreply@example.com'}>`,
				to: email,
				subject: 'Reset your NexusTrade password',
				text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
				html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
			}

			await transporter.sendMail(mailOptions)
		}

		return NextResponse.json(
			{ message: 'If an account exists, a reset link will be sent.' },
			{ status: 200 }
		)
	} catch (e) {
		console.error('forgot-password error:', e)
		// Return generic response to prevent user enumeration
		return NextResponse.json(
			{ message: 'If an account exists, a reset link will be sent.' },
			{ status: 200 }
		)
	}
}


