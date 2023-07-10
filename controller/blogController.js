const Blogs = require('../model/blogModel');
const User = require('../model/userModel')
const mongoose = require('mongoose');


const postBlog = async (req, res) => {
	try {
		const { title, content, authorId } = req.body;

		// Check if the author exists
		const author = await User.findById(authorId);
		if (!author) {
			return res.status(404).json({ message: 'Author not found' });
		}

		// Create a new blog instance
		const blog = new Blogs({ title, content, author: authorId });

		// Save the blog to the database
		await blog.save();

		res.status(201).json({ message: 'Blog posted successfully', blog });
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}
const getBlogs = async (req, res) => {
	try {
		const blogs = await Blogs.find().populate('author').sort({ createdAt: -1 });
		const blogCount = await Blogs.countDocuments();

		res.status(200).json({ count: blogCount, blogs });

		res.status(200).json(blogs);
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}

const getBlog = async (req, res) => {
	try {
		const blogId = req.params.id;

		const blog = await Blogs.findById(blogId).populate('author');

		if (!blog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		res.status(200).json(blog);
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}

const updateBlog = async (req, res) => {
	try {
		const blogId = req.params.id;
		const update = req.body;

		// Find the blog by ID and update the specified field/object
		const updatedBlog = await Blogs.findByIdAndUpdate(blogId, update, { new: true });

		if (!updatedBlog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		res.status(200).json(updatedBlog);
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}
const deleteBlog = async (req, res) => {
	try {
		const blogId = req.params.id;

		// Find the blog by ID and delete it
		const deletedBlog = await Blogs.findByIdAndDelete(blogId);

		if (!deletedBlog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		res.status(200).json({ message: 'Blog deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}

module.exports = {
	postBlog,
	getBlogs,
	getBlog,
	updateBlog,
	deleteBlog
}