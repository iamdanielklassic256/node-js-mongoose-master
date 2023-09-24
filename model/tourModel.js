const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator');


const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a number'],
		unique: true,
		trim: true,
		validate: [validator.isAlpha, 'Tour name must contain only character']
	},
	slug: {
		type: String
	},
	start: Date,
	duration: {
		type: Number,
		required: [true, 'A tour must have duration'],
	},
	maxGroupSize: {
		type: Number
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'It must either easy, medium or difficult'
		}
	},
	ratingsAverage: {
		type: Number,
		default: 4.5
	},
	ratingsQuantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function (valv) {
				return valv < this.price
			},
			message: 'Discount price ({VALUE}) should be below the normal price'
		}
	},
	summary: {
		type: String,
		trim: true,
		required: true
	},
	description: {
		type: String,
		trim: true
	},
	imageCover: {
		type: String,
		required: [true, 'A tour must have a cover image']
	},
	images: [String],
	createdAt: {
		type: Date,
		default: Date.now()
	},
	startDates: [Date],
	secretTour: {
		type: Boolean,
		default: false
	}
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
})
tourSchema.virtual('durationweeks').get(function () {
	return this.duration / 7
})
// DOCUMENT MIDDLEWARE -run before .save() and .create() commads
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

// tourSchema.post('save', function(docs, next){
// 	console.log(docs)
// 	next()
// })
// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } })
	this.start = Date.now()
	next()
})
tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} miliseconds`)
	console.log(docs)
	next()
})
// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({ $match: { $secretTour: { $ne: true } } })
	console.log(this.pipeline())
	next()
})
module.exports = mongoose.model('Tour', tourSchema);