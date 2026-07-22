import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		content: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1000
		},
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Chat',
			required: false
		},
		emotion: {
			type: String,
			enum: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'love'],
			default: 'neutral'
		},
		room: {
			type: String,
			default: 'general'
		}
	},
	{
		timestamps: true
	}
)

const Message = mongoose.model('Message', messageSchema)

export default Message
