const APIFeatures = require("../utils/apiFeatures")
const AppError = require("../utils/appError")
const { catchAsync } = require("../utils/catchAsync")

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
	const docId = req.params.id
	const doc = await Model.findByIdAndDelete(docId, req.body, {
		new: true,
		runValidators: true
	})
	if (!doc) {
		return next(new AppError('No document found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: null
	})
})
exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
	const docId = req.params.id
	const doc = await Model.findByIdAndUpdate(docId, req.body, {
		new: true,
		runValidators: true
	})
	if (!doc) {
		return next(new AppError('No doc found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: {
			data: doc
		}
	})
})
exports.createOne = (Model) => catchAsync(async (req, res, next) => {
	const doc = await Model.create(req.body)
	res.status(201).json({
		status: 'success',
		data: {
			data: doc
		}
	})
})
exports.getOne = (Model, PopOptions) => catchAsync(async (req, res, next) => {
	let query = Model.findById(req.params.id);
	if (PopOptions) query = query.populate(PopOptions);
	const doc = await query
	// .populate({
	// 	path: 'guides',
	// 	select: '-__v -passwordResetExpires -passwordResetToken -passwordChangedAt'
	// })
	// const tour = Tour.findOne({_id: req.params.id})

	if (!doc) {
		return next(new AppError('No document found with that ID', 404))
	}
	res.status(201).json({
		status: 'success',
		data: {
			data: doc
		}
	})
})
exports.getAll = (Model) => catchAsync(async (req, res, next) => {
	// to allow for nested get reviews on tours(hack)
	let filter = {}
	if (req.params.tourId) filter = { tour: req.params.tourId }
	// EXECUTE QUERY
	const features = new APIFeatures(Model.find(filter), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	const doc = await features.query;
	// send response
	res.status(201).json({
		status: 'success',
		results: doc.length,
		data: {
			doc
		}
	})
})