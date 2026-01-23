const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: String,
	email: { type: String, unique: true },
	password: String,
	role: { type: String, enum: ['student', 'admin'], default: 'student' },
	cgpa: Number,
	resume: String,
});

const User = mongoose.model('users', userSchema);
module.exports = User;
