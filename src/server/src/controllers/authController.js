import {
	getAuthenticatedUser,
	loginUser,
	refreshUserToken,
	registerUser
} from '../services/authService.js'

const setAuthCookies = (res, tokens) => {
	const secure = process.env.NODE_ENV === 'production'

	res.cookie('refreshToken', tokens.refreshToken, {
		maxAge: 30 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: 'lax',
		secure
	})

	res.cookie('accessToken', tokens.accessToken, {
		maxAge: 15 * 60 * 1000,
		httpOnly: true,
		sameSite: 'lax',
		secure
	})
}

export const register = async (req, res, next) => {
	try {
		const { user, tokens } = await registerUser(req.body)
		setAuthCookies(res, tokens)

		res.status(201).json({ user })
	} catch (error) {
		next(error)
	}
}

export const login = async (req, res, next) => {
	try {
		const { user, tokens } = await loginUser(req.body)
		setAuthCookies(res, tokens)

		res.status(200).json({ user })
	} catch (error) {
		next(error)
	}
}

export const refreshToken = async (req, res, next) => {
	try {
		const { user, tokens } = await refreshUserToken(req.cookies.refreshToken)
		setAuthCookies(res, tokens)

		res.json(user)
	} catch (error) {
		next(error)
	}
}

export const checkAuth = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const user = await getAuthenticatedUser(req.user._id)
		res.json(user)
	} catch (error) {
		next(error)
	}
}

export const logout = async (req, res, next) => {
	try {
		res.clearCookie('refreshToken')
		res.clearCookie('accessToken')
		res.status(200).json({ message: 'You have successfully logged out' })
	} catch (error) {
		next(error)
	}
}
