import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { generateTokens } from '../utils/generateTokens.js'

const createError = (message, statusCode = 400) => {
	const error = new Error(message)
	error.statusCode = statusCode
	return error
}

export const registerUser = async ({ username, email, password }) => {
	if (!username || !email || !password) {
		throw createError('Username, email and password are required')
	}

	const existingUser = await User.findOne({
		$or: [{ email }, { username }]
	})

	if (existingUser) {
		throw createError('User with this email or username already exists', 409)
	}

	const hashedPassword = await bcrypt.hash(password, 10)
	const user = await User.create({ username, email, password: hashedPassword })
	const tokens = generateTokens(user._id)

	return {
		user: {
			_id: user._id,
			username: user.username,
			email: user.email,
			avatar: user.avatar
		},
		tokens
	}
}

export const loginUser = async ({ email, password }) => {
	if (!email || !password) {
		throw createError('Email and password are required')
	}

	const user = await User.findOne({ email })

	if (!user) {
		throw createError('Invalid email or password', 401)
	}

	const isPasswordValid = await user.comparePassword(password)

	if (!isPasswordValid) {
		throw createError('Invalid email or password', 401)
	}

	const tokens = generateTokens(user._id)

	return {
		user: {
			_id: user._id,
			username: user.username,
			email: user.email,
			avatar: user.avatar
		},
		tokens
	}
}

export const refreshUserToken = async refreshToken => {
	if (!refreshToken) {
		throw createError('You are not authorized. Please log in again', 401)
	}

	const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET)
	const user = await User.findById(decoded.id).select('-password')

	if (!user) {
		throw createError('You are not authorized. Please log in again', 401)
	}

	const tokens = generateTokens(user._id)

	return {
		user: {
			_id: user._id,
			username: user.username,
			email: user.email,
			avatar: user.avatar
		},
		tokens
	}
}

export const getAuthenticatedUser = async userId => {
	const user = await User.findById(userId).select('-password')

	if (!user) {
		throw createError('User not found', 404)
	}

	return user
}
