const express = require('express');
const router = express.Router();
const { createTour, getAllTours, getTour, updateTour, deleteTour, aliasTopTour, getTourStats, getMonthlyPlan } = require('../controller/tourController');
const { protect, restrictTo } = require('../controller/authController');
const { getAllReviews, createReview } = require('../controller/reviewController');
const reviewRoute = require('./reviewRoute')

// router.param('id', checkId)
// review section
// router
// 	.route('/:tourId/reviews')
// 	.post(protect, createReview)
router.use('/:tourId/reviews', reviewRoute)

router.route('/top-cheap').get(aliasTopTour, getAllTours)
router.route('/statistics').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router
	.route('/')
	.get(protect, getAllTours)
	.post(createTour)

// router
// 	.route('/reviews')
// 	.get(getAllReviews)
// 	.post(createReview)

router
	.route('/:id')
	.get(getTour)
	.patch(updateTour)
	.delete(protect, restrictTo('admin', 'super-admin'), deleteTour)



module.exports = router;