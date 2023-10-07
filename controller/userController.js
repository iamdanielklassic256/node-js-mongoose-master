const User = require('../model/userModel')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const { catchAsync } = require('../utils/catchAsync')

const filterObj = (obj, ...allowedFields) => {
	const newObj = {}
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]
	})
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
	// Execute the query to find all users
	const users = await User.find();
  
	// Send the users as a response
	res.status(200).json({
	  status: 'success',
	  data: {
		users,
	  },
	});
  });

exports.updateMe = catchAsync(async (req, res, next) => {
	// Create error if user post a new password data
	if (req.body.password || req.body.confirmPassword) {
		return next(new AppError('This is not for password update, Pleaseuse updatePassword route', 400))
	}
	// filter out the unwanted fields name that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email')
	// Update the user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true, runValidators: true
	})

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}

	})
})
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false })
	res.status(204).json({
		status: 'success',
		data: null
	})
})

exports.getUser = async (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'Aint defined'
	})
}
exports.updateUser = async (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'Aint defined'
	})
}
exports.deleteUser = async (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'Aint defined'
	})
}
