const Tour = require('../model/tourModel')
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const factory = require('./handlerFactory')

exports.aliasTopTour = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingAverage, price'
	req.query.fields = 'name, price, ratingAverage, sumaary, difficulty'
	next();
}
exports.createTour = factory.createOne(Tour)
// get all tours 
exports.getAllTours = factory.getAll(Tour)
// get a single tour by id
exports.getTour = factory.getOne(Tour, { path: 'reviews' })
// updating the tour by id
exports.updateTour = factory.updateOne(Tour)
// delete a tour by id
exports.deleteTour = factory.deleteOne(Tour)

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
//route('/tours-within/:distance/center/:latlng/units/:unit'
//route('/tours-within/446445/center/-40,50/unit/mi'
exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',')
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		next(new AppError('Please provide latitute and longitude in the format lat,lng', 400))
	}
	console.log(distance, lat, lng)

	const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })
	res.status(200).json({
		status: 'sucesss',
		results: tours.length,
		data: {
			data: tours
		}
	})

})
	exports.getDistances = catchAsync(async (req, res, next) => {
		const { latlng, unit } = req.params;
		const [lat, lng] = latlng.split(',')

		const multiplier = unit === 'mi' ? 0.000621371 : 0.001

		if (!lat || !lng) {
			next(new AppError('Please provide latitute and longitude in the format lat,lng', 400))
		}
		const distances = await Tour.aggregate([
			{
				$geoNear: {
					near: 	{
						type: 'Point',
						coordinates: [lng * 1, lat * 1]
					},
					distanceField: 'distance',
					distanceMultiplier: multiplier
				},
				$project: {
					distance: 1,
					name: 1
				}
			}
		])
		res.status(200).json({
			status: 'sucesss',
			data: {
				data: distances
			}
		})
	})