import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToDatabase } from '@/database/mongoose'
import { transporter } from '@/lib/nodemailer'

export async function POST(request: Request) {
	try {
		const { email } = await request.json()
		if (!email || typeof email !== 'string') {
			return NextResponse.json({ message: 'Email is required' }, { status: 400 })
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
				process.env.NEXT_PUBLIC_APP_URL ||
				process.env.BETTER_AUTH_URL ||
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


