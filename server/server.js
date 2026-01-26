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
		const { name, email, password, role = 'student', usn, companyName } = req.body;// this line extracts the fields from the request body
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required.' });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already registered.' });
		}

		const hashed = await bcrypt.hash(password, 10);// hash the password with a salt round of 10

		const userData = { 
			name, 
			email, 
			password: hashed, 
			role 
		};

		if (role === 'student' && req.body.usn) {
			userData.studentProfile = { usn: req.body.usn };
		}
		if (role === 'admin' && req.body.companyName) {
			userData.recruiterProfile = { companyName: req.body.companyName };
		}

		const user = new User(userData);
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
				studentProfile: user.studentProfile,
				recruiterProfile: user.recruiterProfile,
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
				studentProfile: user.studentProfile,
				recruiterProfile: user.recruiterProfile,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// GET User by ID
app.get('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePhoto: user.profilePhoto,
                studentProfile: user.studentProfile,
                recruiterProfile: user.recruiterProfile,
            },
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

//profile update
app.put('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;

        // First, fetch the existing user to preserve data
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateQuery = {};

        // 1. SAFE UPDATE: Use Dot Notation for nested objects
        // Only update fields that are explicitly provided in the request
        
        if (updates.studentProfile) {
            for (const key in updates.studentProfile) {
                // Only set if the value is explicitly provided (not undefined)
                if (updates.studentProfile[key] !== undefined) {
                    updateQuery[`studentProfile.${key}`] = updates.studentProfile[key];
                }
            }
        }

        // 2. Handle Recruiter Profile similarly
        if (updates.recruiterProfile) {
            for (const key in updates.recruiterProfile) {
                if (updates.recruiterProfile[key] !== undefined) {
                    updateQuery[`recruiterProfile.${key}`] = updates.recruiterProfile[key];
                }
            }
        }

        // 3. Handle root level fields (name, email, phoneNumber, etc.)
        for (const key in updates) {
            if (key !== 'studentProfile' && key !== 'recruiterProfile') {
                if (updates[key] !== undefined) {
                    updateQuery[key] = updates[key];
                }
            }
        }

        console.log('Update Query:', JSON.stringify(updateQuery, null, 2)); // Debug log

        // 4. Execute the update using $set with overwrite: false
        const user = await User.findByIdAndUpdate(
            userId, 
            { $set: updateQuery },
            { new: true, runValidators: true, overwrite: false }
        );

        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePhoto: user.profilePhoto,
                studentProfile: user.studentProfile,
                recruiterProfile: user.recruiterProfile,
            },
        });

    } catch (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ message: 'Server error updating profile' });
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
