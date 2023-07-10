const express = require('express');
const router = express.Router();
const {
	postBlog,
	getBlogs,
	getBlog,
	updateBlog,
	deleteBlog

} = require('../controller/blogController');


router.post('/', postBlog)
router.get('/all', getBlogs)
router.get('/:id', getBlog)
router.patch('/:id', updateBlog)
router.delete('/:id', deleteBlog)

module.exports = router;