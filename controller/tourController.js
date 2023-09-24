const Tour = require('../model/tourModel')

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body)
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}
// get all tours 
exports.getAllTours = async (req, res) => {
	try {
		// BUILD QUERY
		// 1). FILTERING
		const queryObj = { ...req.query }
		const excludedFields = ['page', 'sort', 'limit', 'fields']
		excludedFields.forEach(el => delete queryObj[el])

		// console.log(req.query, queryObj)

		// 2). ADVANCED FILTERING
		let queryStr = JSON.stringify(queryObj)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
		console.log(JSON.parse(queryStr))
		// pagination
		// page=2&limit=10, 1-10, pag1, 11-20, pag2....
		// console.log(req.query)
		// { duration: { $gte: '5' }, difficulty: 'easy' } 
		// { duration: { gte: '5' }, difficulty: 'easy' } 

		const query = await Tour.find(JSON.parse(queryStr))
		// const Tours = await Tour.find({
		// 	difficulty: 'easy',
		// 	duration: 3
		// })
		// const Tours = await Tour.find()
		// const Tours = await Tour.find().where('duration').equals(3).where('difficulty').equals('easy')



		const Tours = await query;

		res.status(201).json({
			status: 'success',
			results: Tours.length,
			data: {
				Tours
			}
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err.message
		})
	}
}
// get a single tour by id
exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id)
		// const tour = Tour.findOne({_id: req.params.id})
		res.status(201).json({
			status: 'success',
			data: {
				tour
			}
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}
// updating the tour by id
exports.updateTour = async (req, res) => {
	try {
		const tourId = req.params.id
		const tour = await Tour.findByIdAndUpdate(tourId, req.body, {
			new: true,
			runValidators: true
		})
		res.status(201).json({
			status: 'success',
			data: {
				tour: tour
			}
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}
// delete a tour by id
exports.deleteTour = async (req, res) => {
	try {
		const tourId = req.params.id
		const tour = await Tour.findByIdAndDelete(tourId, req.body, {
			new: true,
			runValidators: true
		})
		res.status(201).json({
			status: 'success',
			data: null
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}