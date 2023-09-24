const Tour = require('../model/tourModel')
const APIFeatures = require('../utils/apiFeatures')



exports.aliasTopTour = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingAverage, price'
	req.query.fields = 'name, price, ratingAverage, sumaary, difficulty'
	next();
}
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
			message: err.message
		})
	}
}
// get all tours 
exports.getAllTours = async (req, res) => {
	try {
		// EXECUTE QUERY
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const Tours = await features.query;
		// send response
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
exports.getTourStats = async (req, res) => {
	try {
		const stats = await Tour.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } }
			},
			{
				$group: {
					_id: '$difficulty',
					numTours: { $sum: 1 },
					numRatings: { $sum: '$ratingsQuantity' },
					avgRating: { $avg: '$ratingsAverage' },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
				}
			},
			{
				$sort: { avgPrice: 1 }
			},
			// {
			// 	$match: {
			// 		_id: {$ne: 'easy'}
			// 	}
			// }
		]).exec();
		console.log('statssss....', stats); // Add this line
		res.status(201).json({
			status: 'success',
			data: stats
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}
exports.getMonthlyPlan = async (req, res) => {
	try {
		const year = req.params.year * 1;

		const plan = await Tour.aggregate([
			{
				$unwind: '$startDates'
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					}
				}
			},
			{
				$group: {
					_id: { $month: '$startDates' },
					numTourStarts: { $sum: 1 },
					tours: { $push: '$name' }
				}
			},
			{
				$addFields: { month: '$_id' }
			},
			{
				$project: {
					_id: 0
				}
			},
			{
				$sort: {
					numTourStarts: -1
				}
			},
			// {
			// 	$limit: 6
			// }
		])
		console.log('monthly plan....', plan); // Add this line
		res.status(201).json({
			status: 'success',
			data: plan
		})
	}
	catch (err) {
		res.status(400).json({
			status: 'failed',
			message: err
		})
	}
}