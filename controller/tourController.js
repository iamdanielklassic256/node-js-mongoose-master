const Tour = require('../model/tourModel')
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

exports.aliasTopTour = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingAverage, price'
	req.query.fields = 'name, price, ratingAverage, sumaary, difficulty'
	next();
}
exports.createTour = catchAsync(async (req, res, next) => {
	const newTour = await Tour.create(req.body)
	res.status(201).json({
		status: 'success',
		data: {
			tour: newTour
		}
	})
})
// get all tours 
exports.getAllTours = catchAsync(async (req, res, next) => {
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
})
// get a single tour by id
exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id)
		.populate('reviews')
		// .populate({
		// 	path: 'guides',
		// 	select: '-__v -passwordResetExpires -passwordResetToken -passwordChangedAt'
		// })
	// const tour = Tour.findOne({_id: req.params.id})

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: {
			tour
		}
	})
})
// updating the tour by id
exports.updateTour = catchAsync(async (req, res, next) => {
	const tourId = req.params.id
	const tour = await Tour.findByIdAndUpdate(tourId, req.body, {
		new: true,
		runValidators: true
	})
	if (!tour) {
		return next(new AppError('No tour found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: {
			tour: tour
		}
	})
})
// delete a tour by id
exports.deleteTour = catchAsync(async (req, res, next) => {
	const tourId = req.params.id
	const tour = await Tour.findByIdAndDelete(tourId, req.body, {
		new: true,
		runValidators: true
	})
	if (!tour) {
		return next(new AppError('No tour found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: null
	})
})
exports.getTourStats = catchAsync(async (req, res, next) => {
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
})
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
})