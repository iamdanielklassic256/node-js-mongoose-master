const express = require('express');
const router = express.Router();
const {
	registerUser,
	getAllUsers,
	getUser,
	updateUser,
	deleteUser
} = require('../controller/userController');


router.post('/user/register', registerUser)
router.get('/users', getAllUsers)
router.get('/users/:id', getUser)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

module.exports = router;