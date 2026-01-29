const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Job = require('./models/Job');

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

// =====================
// JOB ROUTES
// =====================

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// =====================
// STUDENT ROUTES (For Recruiters)
// =====================

// GET: Get all students (For recruiters to browse)
app.get('/api/students', authenticateToken, async (req, res) => {
    try {
        // Check if user is a recruiter (admin)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only recruiters can view student list' });
        }

        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        const formattedStudents = students.map(student => ({
            _id: student._id,
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
            profilePhoto: student.profilePhoto,
            studentProfile: student.studentProfile,
            createdAt: student.createdAt
        }));

        return res.json({ students: formattedStudents });
    } catch (err) {
        console.error('Error fetching students:', err);
        return res.status(500).json({ message: 'Server error fetching students' });
    }
});

// GET: Get a single student by ID (For recruiters)
app.get('/api/students/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only recruiters can view student details' });
        }

        const student = await User.findOne({ _id: req.params.id, role: 'student' })
            .select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json({
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber,
                profilePhoto: student.profilePhoto,
                studentProfile: student.studentProfile,
                createdAt: student.createdAt
            }
        });
    } catch (err) {
        console.error('Error fetching student:', err);
        return res.status(500).json({ message: 'Server error fetching student' });
    }
});

// CREATE: Post a new job (Recruiter only)
app.post('/api/jobs', authenticateToken, async (req, res) => {
    try {
        // Check if user is a recruiter (admin)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only recruiters can post jobs' });
        }

        const { title, company, logo, location, salary, type, experience, description, skills, postedBy } = req.body;

        // Validation
        if (!title || !company || !location || !salary || !description) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const job = new Job({
            title,
            company,
            logo: logo || '🏢',
            location,
            salary,
            type: type || 'Full-time',
            experience: experience || '0-2 years',
            description,
            skills: skills || [],
            postedBy: postedBy || req.user.id,
            applicants: [],
            isActive: true
        });

        await job.save();

        return res.status(201).json({
            message: 'Job posted successfully',
            job
        });
    } catch (err) {
        console.error('Error creating job:', err);
        return res.status(500).json({ message: 'Server error creating job' });
    }
});

// READ: Get all active jobs (for students)
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true })
            .populate('postedBy', 'name email recruiterProfile')
            .sort({ createdAt: -1 });

        // Format jobs with applicant count
        const formattedJobs = jobs.map(job => ({
            id: job._id,
            _id: job._id,
            title: job.title,
            company: job.company,
            logo: job.logo,
            location: job.location,
            salary: job.salary,
            type: job.type,
            experience: job.experience,
            description: job.description,
            skills: job.skills,
            postedBy: job.postedBy,
            applicants: job.applicants.length,
            isActive: job.isActive,
            isNew: job.isNew,
            createdAt: job.createdAt,
            postedDate: getRelativeTime(job.createdAt)
        }));

        return res.json({ jobs: formattedJobs });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        return res.status(500).json({ message: 'Server error fetching jobs' });
    }
});

// READ: Get jobs posted by a specific recruiter
app.get('/api/jobs/recruiter/:recruiterId', authenticateToken, async (req, res) => {
    try {
        const { recruiterId } = req.params;

        const jobs = await Job.find({ postedBy: recruiterId })
            .populate('applicants', 'name email studentProfile')
            .sort({ createdAt: -1 });

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            _id: job._id,
            title: job.title,
            company: job.company,
            logo: job.logo,
            location: job.location,
            salary: job.salary,
            type: job.type,
            experience: job.experience,
            description: job.description,
            skills: job.skills,
            applicants: job.applicants,
            applicantCount: job.applicants.length,
            isActive: job.isActive,
            isNew: job.isNew,
            createdAt: job.createdAt,
            postedDate: getRelativeTime(job.createdAt)
        }));

        return res.json({ jobs: formattedJobs });
    } catch (err) {
        console.error('Error fetching recruiter jobs:', err);
        return res.status(500).json({ message: 'Server error fetching jobs' });
    }
});

// READ: Get a single job by ID
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email recruiterProfile')
            .populate('applicants', 'name email studentProfile');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        return res.json({
            job: {
                id: job._id,
                _id: job._id,
                title: job.title,
                company: job.company,
                logo: job.logo,
                location: job.location,
                salary: job.salary,
                type: job.type,
                experience: job.experience,
                description: job.description,
                skills: job.skills,
                postedBy: job.postedBy,
                applicants: job.applicants,
                applicantCount: job.applicants.length,
                isActive: job.isActive,
                isNew: job.isNew,
                createdAt: job.createdAt,
                postedDate: getRelativeTime(job.createdAt)
            }
        });
    } catch (err) {
        console.error('Error fetching job:', err);
        return res.status(500).json({ message: 'Server error fetching job' });
    }
});

// UPDATE: Update a job (Recruiter only)
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        const updates = req.body;
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.json({
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (err) {
        console.error('Error updating job:', err);
        return res.status(500).json({ message: 'Server error updating job' });
    }
});

// DELETE: Delete a job (Recruiter only)
app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);

        return res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error('Error deleting job:', err);
        return res.status(500).json({ message: 'Server error deleting job' });
    }
});

// APPLY: Student applies to a job
app.post('/api/jobs/:id/apply', authenticateToken, async (req, res) => {
    try {
        // Check if user is a student
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can apply to jobs' });
        }

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.isActive) {
            return res.status(400).json({ message: 'This job is no longer accepting applications' });
        }

        // Check if already applied
        if (job.applicants.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Add student to applicants
        job.applicants.push(req.user.id);
        await job.save();

        return res.json({
            message: 'Application submitted successfully',
            job: {
                id: job._id,
                title: job.title,
                company: job.company
            }
        });
    } catch (err) {
        console.error('Error applying to job:', err);
        return res.status(500).json({ message: 'Server error applying to job' });
    }
});

// GET: Get jobs a student has applied to
app.get('/api/applications/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find all jobs where student is in applicants array
        const jobs = await Job.find({ applicants: studentId })
            .populate('postedBy', 'name email recruiterProfile')
            .sort({ createdAt: -1 });

        const applications = jobs.map(job => ({
            id: job._id,
            jobId: job._id,
            title: job.title,
            company: job.company,
            logo: job.logo,
            location: job.location,
            salary: job.salary,
            type: job.type,
            appliedDate: job.createdAt, // You might want to track actual application date separately
            status: 'pending' // You can extend the schema to track application status
        }));

        return res.json({ applications });
    } catch (err) {
        console.error('Error fetching applications:', err);
        return res.status(500).json({ message: 'Server error fetching applications' });
    }
});

// Helper function to get relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} month(s) ago`;
}


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
