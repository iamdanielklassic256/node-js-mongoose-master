const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator');


const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		trim: true,
		// validate: [validator.isAlpha, 'Tour name must contain only character']
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
		default: 4.5,
		min: [1, 'Rating must be above 1.0'],
		max: [5, 'Rating must be below 5.0'],
		set: val => Math.round(val * 10) /10 // 4.66666, -> 46.666 -> 47 -> 4.7
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
	},
	startLocation: {
		// GeoJSON
		type: {
			type: String,
			default: 'Point',
			enum: ['Point']
		},
		coordinates: [Number],
		address: String,
		description: String
	},
	location: [
		{
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
			day: Number
		}
	],
	guides: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User'
		}
	]
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	}
})
tourSchema.index({ price: 1, ratings: -1})
// tourSchema.index({ price: 1})
tourSchema.index({ slug: 1})
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationweeks').get(function () {
	return this.duration / 7
})
// Virtual populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
  });
  
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
tourSchema.pre(/^find/, async function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordResetExpires -passwordResetToken -passwordChangedAt'
	})
	next()
})
tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} miliseconds`)
	console.log(docs)
	next()
})

// AGGREGATE MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
// 	this.pipeline().unshift({ $match: { $secretTour: { $ne: true } } })
// 	console.log(this.pipeline())
// 	next()
// })
module.exports = mongoose.model('Tour', tourSchema);