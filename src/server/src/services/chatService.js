import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

const createError = (message, statusCode = 400) => {
	const error = new Error(message)
	error.statusCode = statusCode
	return error
}

export const sendMessage = async ({ senderId, content, emotion = 'neutral', room = 'general', chatId = null }) => {
	if (!senderId || !content) {
		throw createError('Sender ID and content are required')
	}

	if (!content.trim()) {
		throw createError('Message content cannot be empty')
	}

	// Validate emotion
	const validEmotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'love']
	if (!validEmotions.includes(emotion)) {
		throw createError('Invalid emotion type')
	}

	// Verify user exists
	const user = await User.findById(senderId)
	if (!user) {
		throw createError('User not found', 404)
	}

	const messageData = {
		sender: senderId,
		content: content.trim(),
		emotion,
		room
	}

	if (chatId) {
		messageData.chat = chatId
	}

	const message = await Message.create(messageData)

	if (chatId) {
		const chat = await Chat.findById(chatId)
		if (!chat) {
			throw createError('Chat not found', 404)
		}

		chat.messages.push(message._id)
		if (!chat.members.includes(senderId)) {
			chat.members.push(senderId)
		}

		await chat.save()
	}

	// Populate sender information
	const populatedMessage = await message.populate('sender', 'username email avatar')

	return {
		_id: populatedMessage._id,
		sender: {
			_id: populatedMessage.sender._id,
			username: populatedMessage.sender.username,
			email: populatedMessage.sender.email,
			avatar: populatedMessage.sender.avatar
		},
		content: populatedMessage.content,
		chat: populatedMessage.chat,
		emotion: populatedMessage.emotion,
		room: populatedMessage.room,
		createdAt: populatedMessage.createdAt,
		updatedAt: populatedMessage.updatedAt
	}
}

export const getOrCreateChat = async (userId, otherUserId) => {
	if (!userId || !otherUserId) {
		throw createError('Both participants are required')
	}

	const existingChat = await Chat.findOne({
		members: { $all: [userId, otherUserId] },
		$expr: { $eq: [{ $size: '$members' }, 2] }
	})

	if (existingChat) {
		return existingChat
	}

	const chat = await Chat.create({
		members: [userId, otherUserId]
	})

	return chat
}

export const getChatsForUser = async userId => {
	const chats = await Chat.find({ members: userId })
		.populate('members', 'username email avatar')

	return chats.map(chat => ({
		_id: chat._id,
		title: chat.title || null,
		members: chat.members,
		createdAt: chat.createdAt,
		updatedAt: chat.updatedAt
	}))
}

export const getMessages = async (room = 'general', limit = 50, skip = 0, chatId = null) => {
	const query = chatId ? { chat: chatId } : { room }

	const messages = await Message.find(query)
		.populate('sender', 'username email avatar')
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip(skip)

	return messages.reverse().map(msg => ({
		_id: msg._id,
		sender: {
			_id: msg.sender._id,
			username: msg.sender.username,
			email: msg.sender.email,
			avatar: msg.sender.avatar
		},
		content: msg.content,
		chat: msg.chat,
		emotion: msg.emotion,
		room: msg.room,
		createdAt: msg.createdAt,
		updatedAt: msg.updatedAt
	}))
}

export const getMessageById = async messageId => {
	const message = await Message.findById(messageId).populate('sender', 'username email avatar')

	if (!message) {
		throw createError('Message not found', 404)
	}

	return {
		_id: message._id,
		sender: {
			_id: message.sender._id,
			username: message.sender.username,
			email: message.sender.email,
			avatar: message.sender.avatar
		},
		content: message.content,
		emotion: message.emotion,
		room: message.room,
		createdAt: message.createdAt,
		updatedAt: message.updatedAt
	}
}

export const deleteMessage = async (messageId, userId) => {
	const message = await Message.findById(messageId)

	if (!message) {
		throw createError('Message not found', 404)
	}

	if (message.sender.toString() !== userId) {
		throw createError('You can only delete your own messages', 403)
	}

	await Message.findByIdAndDelete(messageId)

	return { message: 'Message deleted successfully' }
}

export const updateMessageEmotion = async (messageId, emotion) => {
	const validEmotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'love']
	if (!validEmotions.includes(emotion)) {
		throw createError('Invalid emotion type')
	}

	const message = await Message.findByIdAndUpdate(
		messageId,
		{ emotion },
		{ new: true }
	).populate('sender', 'username email avatar')

	if (!message) {
		throw createError('Message not found', 404)
	}

	return {
		_id: message._id,
		sender: {
			_id: message.sender._id,
			username: message.sender.username,
			email: message.sender.email,
			avatar: message.sender.avatar
		},
		content: message.content,
		emotion: message.emotion,
		room: message.room,
		createdAt: message.createdAt,
		updatedAt: message.updatedAt
	}
}
