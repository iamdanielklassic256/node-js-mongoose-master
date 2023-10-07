const express = require('express');
const { getAllReviews, createReview } = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');

const router = express.Router({ mergeParams: true });



router
	.route('/')
	.get(getAllReviews)
	.post(protect, restrictTo('user'), createReview)

// router
// 	.route('/:id')
// 	.get(getTour)
// 	.patch(updateTour)
// 	.delete(protect, restrictTo('admin', 'super-admin'), deleteTour)



module.exports = router;