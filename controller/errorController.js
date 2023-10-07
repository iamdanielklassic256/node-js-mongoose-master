const AppError = require("../utils/appError")

const handleCastErrorDb = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`
	return new AppError(message, 400)
}
 
const handleDuplicateFieldsDb = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
	console.log(value)

	const message = `Duplicate field value: ${value}: Please use another value`
	return new AppError(message, 400)
}
const handleFieldValidation = (err) => {
	const errors = Object.values(err.errors).map(el => el.message)
	const message = `Invalid input data ${errors.join('. ')}`
	return new AppError(message, 400)
}
const handleJWTError = () => new AppError('Invalid Token, Please login again', 401)
const handleTokenExpiredError = () => new AppError('You have expired Token!, Please login again', 401)

 
const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	})
}
const sendErrorProduction = (err, res) => {
	// Operational error to the client
	if(err.isOperational){
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		})
	}
	// Programming error / unknown error: dont want to 	leak error details to the client
	else{
		// 1. Log error
		console.log('ERROR', err)
		// 2. Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!'
		})
	}
}

exports.errorController = async (err, req, res, next) => {
	err.statusCode = err.statusCode || 500
	err.status = err.status || 'error'

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res)
	}
	else if (process.env.NODE_ENV === 'production') {
		let error = {...err}
		if(error.name === 'CastError') error = handleCastErrorDb(error)
		if(error.name === 11000) error = handleDuplicateFieldsDb(error)
		if(error.name === 'ValidationError') error = handleFieldValidation(error)
		if(error.name === 'JsonWebTokenError') error = handleJWTError()
		if(error.name === 'TokenExpiredError') error = handleTokenExpiredError()
		sendErrorProduction(error, res)
	}


}