import express from 'express'
import {
	createMessage,
	fetchMessages,
	getMessage,
	removeMessage,
	updateEmotion
} from '../controllers/chatController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Protected routes (require authentication)
router.post('/', protect, createMessage)
router.get('/', fetchMessages)
router.get('/:messageId', getMessage)
router.put('/:messageId/emotion', protect, updateEmotion)
router.delete('/:messageId', protect, removeMessage)

export default router
