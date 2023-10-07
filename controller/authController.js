const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../model/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	})
}
const createAndSendToken = (user, statusCode, res) => {
	const token = signToken(user._id)

	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		// secure: false,
		httpOnly: true
	}
	res.cookie('jwt', token, cookieOptions)
	// remove the password from out
	user.password = undefined;
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
	res.status(statusCode).json({
		status: 'success',
		token,
		user
	})
}

exports.signUp = catchAsync(async (req, res, next) => {
	const { name, email, photo, password, confirmPassword, passwordChangedAt, role } = req.body
	const newUser = await User.create({ name, email, photo, password, confirmPassword, passwordChangedAt, role })

	createAndSendToken(newUser, 201, res)
});
exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body
	// check if the email exists
	if (!email || !password) {
		next(new AppError('Please provide email and password', 400))
	}
	// check if the email and passwor are correct
	const user = await User.findOne({ email }).select('+password')

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}
	// check if everything is okay and send a token then
	createAndSendToken(user, 200, res)
})
exports.protect = catchAsync(async (req, res, next) => {
	let token;
	// Get the token and check if it is valid
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]
	}
	// console.log('...', token)
	if (!token) {
		return next(new AppError('You are not logged in, Please login to get all tours', 401))
	}
	// Verification
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
	// console.log(decoded)
	// Check if user stilll exists
	const currentUser = await User.findById(decoded.id)
	if (!currentUser) {
		return next(new AppError('The user belonging to the token doesnot exist', 401))
	}
	// Check if user changed password after token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('User recently changed password, please login again', 401))
	}
	// Grant access to protected route
	req.user = currentUser;
	next()
})
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles in an array
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You donot have permission to perform this action', 403))
		}
		next()
	}
	
}
exports.forgotPassword = catchAsync(async (req, res, next) => {
	// Get User Posted on email
	const user = await User.findOne({ email: req.body.email })
	if (!user) {
		return next(new AppError('There is no user with that email address', 404))
	}
	// Generate random reset token
	const resetToken = user.createPasswordResetToken()
	await user.save({ validateBeforeSave: false })
	// send it to the user's email
	const resetURL = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`
	const message = `Forgot your password? Submit a PATCH with a new password and password confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this message!`

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (Valid for 10 minutes',
			message: message
		})
		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!'
		})
	}
	catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false })

		return next(new AppError('Something went wrong, Please try again later', 500))
	}
})
exports.resetPassword = async (req, res, next) => {
	// get a user based on a token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex')
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() }
	})
	// if the token has not expired, and there is a user, set a new parssword
	if (!user) {
		return next(new AppError('Token is invalid/expired', 400))
	}
	user.password = req.body.password
	user.confirmPassword = req.body.confirmPassword
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	// update the changedPasswordAt property for the user

	// Log the user in, send the JWT to the client
	createAndSendToken(user, 200, res);
}
exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user.id).select('+password');

	// 2) Check if POSTed current password is correct
	// if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
	//   return next(new AppError('Your current password is wrong.', 401));
	// }
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong.', 401));
	}

	// 3) If so, update password
	user.password = req.body.password;
	user.confirmPassword = req.body.confirmPassword;
	await user.save();
	// User.findByIdAndUpdate will NOT work as intended!

	// 4) Log user in, send JWT
	createAndSendToken(user, 200, res);
});