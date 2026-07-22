import {
	deleteMessage,
	getMessageById,
	getMessages,
	getOrCreateChat,
	getChatsForUser,
	sendMessage,
	updateMessageEmotion
} from '../services/chatService.js'

export const createMessage = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const { content, emotion = 'neutral', room = 'general', chatId = null } = req.body

		const message = await sendMessage({
			senderId: req.user._id,
			content,
			emotion,
			room,
			chatId
		})

		res.status(201).json(message)
	} catch (error) {
		next(error)
	}
}

export const fetchMessages = async (req, res, next) => {
	try {
		const { room = 'general', limit = 50, skip = 0, chatId = null } = req.query

		const messages = await getMessages(
			room,
			parseInt(limit),
			parseInt(skip),
			chatId || null
		)

		res.status(200).json({ messages, count: messages.length })
	} catch (error) {
		next(error)
	}
}

export const createChat = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const { userId } = req.body
		if (!userId) {
			res.status(400)
			throw new Error('Target userId is required')
		}

		const chat = await getOrCreateChat(req.user._id, userId)
		res.status(201).json(chat)
	} catch (error) {
		next(error)
	}
}

export const getChats = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const chats = await getChatsForUser(req.user._id)
		res.status(200).json({ chats })
	} catch (error) {
		next(error)
	}
}

export const fetchChatMessages = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const { chatId } = req.params
		const { limit = 50, skip = 0 } = req.query

		const messages = await getMessages(null, parseInt(limit), parseInt(skip), chatId)
		res.status(200).json({ messages, count: messages.length })
	} catch (error) {
		next(error)
	}
}

export const getMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params

		const message = await getMessageById(messageId)

		res.status(200).json(message)
	} catch (error) {
		next(error)
	}
}

export const updateEmotion = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const { messageId } = req.params
		const { emotion } = req.body

		// Verify user owns the message
		const message = await getMessageById(messageId)
		if (message.sender._id !== req.user._id.toString()) {
			res.status(403)
			throw new Error('You can only update your own message emotions')
		}

		const updatedMessage = await updateMessageEmotion(messageId, emotion)

		res.status(200).json(updatedMessage)
	} catch (error) {
		next(error)
	}
}

export const removeMessage = async (req, res, next) => {
	try {
		if (!req.user) {
			res.status(401)
			throw new Error('You are not authorized')
		}

		const { messageId } = req.params

		await deleteMessage(messageId, req.user._id)

		res.status(200).json({ message: 'Message deleted successfully' })
	} catch (error) {
		next(error)
	}
}
