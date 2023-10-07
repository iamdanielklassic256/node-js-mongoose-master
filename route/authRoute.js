const express = require('express')
const { signUp, login, resetPassword, forgotPassword, updatePassword, protect } = require('../controller/authController')
const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)
router.patch('/update-password', protect, updatePassword)

// router.patch('/update-', protect, updatePassword)



// router
// .route('/')
// .get(getAllUsers)
// .post(createUser)

// router
// .route('/:id')
// .get(getUser)
// .patch(updateUser)
// .delete(deleteUser)


module.exports = router;