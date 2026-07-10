import jwt from 'jsonwebtoken'
import { getAuthenticatedUser } from '../services/authService.js'

export const protect = async (req, res, next) => {
	try {
		const token = req.cookies.accessToken || req.headers.authorization?.split('Bearer ')[1]

		if (!token) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
		req.user = await getAuthenticatedUser(decoded.id)
		next()
	} catch (error) {
		next(error)
	}
}
