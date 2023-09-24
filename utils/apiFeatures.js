class APIFeatures {
	constructor(query, queryString) {
		this.query = query
		this.queryString = queryString
	}
	filter() {
		// 1). FILTERING
		const queryObj = { ...this.queryString }
		const excludedFields = ['page', 'sort', 'limit', 'fields']
		excludedFields.forEach(el => delete queryObj[el])
		// console.log(req.query, queryObj)

		// 2). ADVANCED FILTERING
		let queryStr = JSON.stringify(queryObj)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
		// console.log(JSON.parse(queryStr))
		this.query = this.query.find(JSON.parse(queryStr))
		return this;

		// let query = await Tour.find(JSON.parse(queryStr))
	}
	sort() {
		// 2). SORTING
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ')
			console.log('sortyby', sortBy)
			this.query = this.query.sort(sortBy)
			// sort('price ratingsAverage')
		}
		else {
			this.query = this.query.sort('-createdAt')
		}
		return this;
	}
	limitFields() {
		// 2). FIELDS LIMITING
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ')
			this.query = this.query.select(fields)
		}
		else {
			this.query = this.query.select('-_v')
		}
		return this
	}
	paginate() {
		// PAGINATION
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit
		//page=2&limit=10 1-10 page 1 11-20 page 2
		this.query = this.query.skip(skip).limit(limit)
		// if (this.queryString.page) {
		// 	const numOfTours = await Tour.countDocuments()
		// 	if (skip >= numOfTours) {
		// 		throw new Error('This page doesnot exist')
		// 	}
		// }
		return this;
	}
}
module.exports = APIFeatures;