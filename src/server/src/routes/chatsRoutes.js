import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import {
	createChat,
	getChats,
	fetchChatMessages
} from '../controllers/chatController.js'

const router = express.Router()

router.post('/', protect, createChat)
router.get('/', protect, getChats)
router.get('/:chatId/messages', protect, fetchChatMessages)

export default router
