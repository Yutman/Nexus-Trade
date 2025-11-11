export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
// Must contain at least one letter and one number; length separately enforced by MIN/MAX
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

export function validatePassword(password: string): { valid: boolean; message?: string } {
	if (typeof password !== 'string') {
		return { valid: false, message: 'Password must be a string' }
	}
	if (password.length < PASSWORD_MIN_LENGTH) {
		return { valid: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }
	}
	if (password.length > PASSWORD_MAX_LENGTH) {
		return { valid: false, message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters` }
	}
	if (!PASSWORD_REGEX.test(password)) {
		return { valid: false, message: 'Password must include at least 1 letter and 1 number' }
	}
	return { valid: true }
}


