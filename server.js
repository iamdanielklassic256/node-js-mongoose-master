require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit')
const corsOptions = require('./config/corsOptions')
const app = express();
const AppError = require('./utils/appError')
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp')
const connectDB = require('./config/dbConfig')
const tour = require('./route/tourRoute')
const user = require('./route/authRoute')
const users = require('./route/usersRoute')
const review = require('./route/reviewRoute')
const { errorController } = require('./controller/errorController');


// set security headers
app.use(helmet())


// connect to mongoDB
connectDB();

const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, // 60 minutes
	message: "Too many request from this IP!, Please try again in an hour!"
})
app.use('/api', limiter)


// Cross Origin Resource Sharing
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against no SQL query injection
app.use(mongoSanitize()); // To remove data using these defaults:
// Data Sanitization against XSS
app.use(xss())
// Prevent Parameter Parameter
app.use(hpp({
	whitelist: [
		'duration',
		'ratingsQuantity',
		'ratingsAverage',
		'maxGroupSize',
		'difficulty',
		'price'
	]
}))

// app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
// 	req.requestTime = new Date.now().toISOString()
// 	next()
// });
// middleware for cookie   
app.use(cookieParser());


// routes
app.use('/auth', user)
app.use('/api/users', users)
app.use('/api/tours', tour)
app.use('/api/tours/reviews', review)


app.all('*', (req, res, next) => {
	next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404))
})
app.use(errorController)
mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB successfully');
	const server = app.listen(
		PORT, () => console.log(`Server running on port ${PORT}`)
	);

	process.on('unhandledRejection', err => {
		console.log(err.name, err.message)
		console.log('UNHANDLED REJECTION! shutting down....')
		server.close(() => {
			process.exit(1)
		})
	})
})