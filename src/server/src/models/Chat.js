import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			minlength: 3,
			maxlength: 20
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true
			}
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Message'
			}
		]
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

const Chat = mongoose.model('Chat', chatSchema)

export default Chat
