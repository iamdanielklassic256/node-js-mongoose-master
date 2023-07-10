require('dotenv').config()
const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConfig')
const registerRoute = require('./route/registerRoute')
const blogRoute = require('./route/blogRoute')
// connect to mongoDB
connectDB();



// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(express.json());

// middleware for cookie   
app.use(cookieParser());




// routes
app.use('/api', registerRoute)
app.use('/api/blogs', blogRoute)


mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB successfully');
	app.listen(
		PORT, () => console.log(`Server running on port ${PORT}`)
	);

})