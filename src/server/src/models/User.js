import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			minlength: 3,
			maxlength: 30
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true
		},
		password: {
			type: String,
			required: true,
			minlength: 6
		},
		avatar: {
			type: String,
			default: ''
		}
	},
	{
		timestamps: true
	}
)

userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
