const express = require('express');
const { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } = require('../controller/userController');
const { protect, restrictTo } = require('../controller/authController');
const router = express.Router()

router.use(protect)

router.get('/me', getMe, getUser)
router.patch('/update-me', updateMe)
router.delete('/delete-me', deleteMe)


router.use(restrictTo("super-admin"))
router
	.route('/')
	.get(getAllUsers)

router
	.route('/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser)





module.exports = router;