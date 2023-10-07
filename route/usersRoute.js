const express = require('express');
const { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe } = require('../controller/userController');
const { protect } = require('../controller/authController');
const router = express.Router()

router.patch('/update-me', protect, updateMe)
router.delete('/delete-me', protect, deleteMe)

router
	.route('/')
	.get(getAllUsers)

router
	.route('/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser)


module.exports = router;