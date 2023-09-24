const express = require('express');
const router = express.Router();
const { createTour, getAllTours, getTour, updateTour, deleteTour, aliasTopTour, getTourStats, getMonthlyPlan } = require('../controller/tourController');

// router.param('id', checkId)

router.route('/top-cheap').get(aliasTopTour, getAllTours)
router.route('/statistics').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router
	.route('/')
	.get(getAllTours)
	.post(createTour)


router
	.route('/:id')
	.get(getTour)
	.patch(updateTour)
.delete(deleteTour)

module.exports = router;