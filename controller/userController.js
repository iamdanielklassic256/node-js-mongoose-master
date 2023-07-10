const User = require('../model/userModel');
const mongoose = require('mongoose');

const registerUser = async (req, res) => {
	try {
		const { name, email } = req.body;

		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: 'User already exists' });
		}

		// Create a new user instance
		const user = new User({ name, email });

		// Save the user to the database
		await user.save();

		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		const userCount = await User.countDocuments();

		res.status(200).json({ count: userCount, users });
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
};

const getUser = async (req, res) => {
	try {
		const userId = req.params.id;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}
const updateUser = async (req, res) => {
	try {
		const userId = req.params.id;
		const update = req.body;

		// Find the user by ID and update the specified field
		const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}

const deleteUser = async (req, res) => {
	try {
		const userId = req.params.id;

		// Find the user by ID and delete it
		const deletedUser = await User.findByIdAndDelete(userId);

		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong', error });
	}
}

module.exports = {
	registerUser,
	getAllUsers,
	getUser,
	updateUser,
	deleteUser
};
