import User from '../models/User.js'

export const getUsers = async (req, res, next) => {
	try {
		const users = await User.find({ _id: { $ne: req.user._id } }).select('username email avatar')
		res.status(200).json({ users })
	} catch (error) {
		next(error)
	}
}
