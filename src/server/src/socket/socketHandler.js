import jwt from 'jsonwebtoken'
import { getAuthenticatedUser } from '../services/authService.js'
import { sendMessage } from '../services/chatService.js'

const authenticateSocket = async token => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
		const user = await getAuthenticatedUser(decoded.id)
		return user
	} catch (error) {
		return null
	}
}

const parseCookieHeader = cookieHeader => {
	if (!cookieHeader) return {}

	return cookieHeader.split(';').reduce((cookies, part) => {
		const [key, value] = part.split('=')
		if (key && value) {
			cookies[key.trim()] = decodeURIComponent(value.trim())
		}
		return cookies
	}, {})
}

export const initializeSocket = io => {
	io.use(async (socket, next) => {
		try {
			const cookies = parseCookieHeader(socket.handshake.headers.cookie)
			const token =
				socket.handshake.auth.token ||
				socket.handshake.headers.authorization?.split('Bearer ')[1] ||
				cookies.accessToken

			if (!token) {
				console.log('Socket auth: no token provided, connecting as guest')
				socket.user = { _id: 'guest', username: 'Guest' }
				return next()
			}

			const user = await authenticateSocket(token)
			if (!user) {
				console.log('Socket auth: invalid token, connecting as guest')
				socket.user = { _id: 'guest', username: 'Guest' }
				return next()
			}

			socket.user = user
			next()
		} catch (error) {
			console.log('Socket auth error, connecting as guest:', error.message)
			socket.user = { _id: 'guest', username: 'Guest' }
			next()
		}
	})

	io.on('connection', socket => {
		console.log(`User ${socket.user.username} connected: ${socket.id}`)

		// User joins a chat room
		socket.on('joinRoom', ({ room = 'general' }) => {
			socket.join(room)
			socket.room = room
			socket.chatId = room

			// Notify others that user joined
			socket.to(room).emit('userJoined', {
				username: socket.user.username,
				userId: socket.user._id,
				message: `${socket.user.username} joined the chat`
			})

			console.log(`${socket.user.username} joined room: ${room}`)
		})

		// Send a message
		socket.on('sendMessage', async ({ content, emotion = 'neutral' }) => {
			try {
				if (socket.user._id === 'guest') {
					const message = {
						_id: `guest-${Date.now()}`,
						sender: {
							_id: 'guest',
							username: socket.user.username
						},
						content: content.trim(),
						emotion,
						room: socket.room || 'general',
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					}

					io.to(socket.room || 'general').emit('messageReceived', message)
					console.log(`Guest message sent by ${socket.user.username}: ${content}`)
					return
				}

				const message = await sendMessage({
					senderId: socket.user._id,
					content,
					emotion,
					room: socket.room || 'general',
					chatId: socket.chatId || null
				})

				io.to(socket.room || 'general').emit('messageReceived', message)

				console.log(`Message sent by ${socket.user.username}: ${content}`)
			} catch (error) {
				socket.emit('error', { message: error.message })
			}
		})

		// Emotion event - broadcast to all users in the room
		socket.on('emotion', ({ emotion, messageId }) => {
			const emotionData = {
				username: socket.user.username,
				userId: socket.user._id,
				emotion,
				messageId,
				timestamp: new Date()
			}

			// Broadcast the emotion to all users in the room
			io.to(socket.room || 'general').emit('emotionReceived', emotionData)

			console.log(`${socket.user.username} reacted with emotion: ${emotion}`)
		})

		// User typing indicator
		socket.on('typing', ({ isTyping }) => {
			socket.to(socket.room || 'general').emit('userTyping', {
				username: socket.user.username,
				isTyping
			})
		})

		// User leaves room
		socket.on('leaveRoom', ({ room }) => {
			socket.leave(room)

			socket.to(room).emit('userLeft', {
				username: socket.user.username,
				userId: socket.user._id,
				message: `${socket.user.username} left the chat`
			})

			console.log(`${socket.user.username} left room: ${room}`)
		})

		// Disconnect event
		socket.on('disconnect', () => {
			console.log(`User ${socket.user.username} disconnected: ${socket.id}`)

			// Notify others in the room
			socket.to(socket.room || 'general').emit('userLeft', {
				username: socket.user.username,
				userId: socket.user._id,
				message: `${socket.user.username} disconnected`
			})
		})

		// Error handler
		socket.on('error', error => {
			console.error(`Socket error from ${socket.user.username}:`, error)
		})
	})
}
