const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET ;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Server is up and running');
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
	try {
		const { name, email, password, role = 'student', cgpa, resume } = req.body;// this line extracts the fields from the request body
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required.' });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already registered.' });
		}

		const hashed = await bcrypt.hash(password, 10);// hash the password with a salt round of 10

		const user = new User({ name, email, password: hashed, role, cgpa, resume });
		await user.save();

		const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });// create a JWT token valid for 7 days for the new user

		return res.status(201).json({      // respond with success status and user info to the client
			message: 'Registration successful',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				cgpa: user.cgpa,
				resume: user.resume,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });

		return res.json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				cgpa: user.cgpa,
				resume: user.resume,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Server error' });
	}
});

mongoose.connect(mongoUri)
	.then(() => {
		console.log('Connected to MongoDB');
		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err);
		process.exit(1);
	});
