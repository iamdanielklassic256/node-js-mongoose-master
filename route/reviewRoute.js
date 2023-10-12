const express = require('express');
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserId, getReview } = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(protect)

router
	.route('/')
	.get(getAllReviews)
	.post(protect, restrictTo('user'), setTourUserId, createReview)


router
	.route('/:id')
	.get(getReview)
	.patch(restrictTo("super-admin", "user"), updateReview)
	.delete(restrictTo("super-admin", "user"), deleteReview)
// router
// 	.route('/:id')
// 	.get(getTour)
// 	.patch(updateTour)
// 	.delete(protect, restrictTo('admin', 'super-admin'), deleteTour)



module.exports = router;