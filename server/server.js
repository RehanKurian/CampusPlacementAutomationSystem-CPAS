const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application'); // Import Application model
const { buildEmailContent } = require('./utils/emailTemplates');
const { uploadResume, getPublicIdFromUrl, deleteFromCloudinary } = require('./utils/cloudinary');

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
		if (role === 'recruiter' && req.body.companyName) {
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
        // Check if user is a recruiter
        if (req.user.role !== 'recruiter') {
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
        if (req.user.role !== 'recruiter') {
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
        // Check if user is a recruiter
        if (req.user.role !== 'recruiter') {
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

// READ: Get all jobs (for students)
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({})
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
            applicantCount: job.applicants.length,  
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

// READ: Get recommended jobs for a student based on skill matching
app.get('/api/jobs/recommended/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

        // Verify the student is requesting their own recommendations
        if (req.user.id !== studentId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get student's skills
        const student = await User.findById(studentId).select('studentProfile.skills');
        const studentSkills = student?.studentProfile?.skills || [];

        if (studentSkills.length === 0) {
            return res.json({ 
                jobs: [], 
                message: 'Add skills to your profile to get job recommendations' 
            });
        }

        // Find active jobs that have at least one matching skill
        const jobs = await Job.find({ 
            isActive: true,
            skills: { $in: studentSkills }
        })
            .populate('postedBy', 'name email recruiterProfile')
            .lean();

        // Calculate match percentage for each job
        const jobsWithMatch = jobs.map(job => {
            const jobSkills = job.skills || [];
            const matchingSkills = jobSkills.filter(skill => 
                studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
            );
            const matchPercentage = jobSkills.length > 0 
                ? Math.round((matchingSkills.length / jobSkills.length) * 100)
                : 0;

            return {
                _id: job._id,
                title: job.title,
                company: job.company,
                logo: job.logo,
                location: job.location,
                salary: job.salary,
                type: job.type,
                skills: job.skills,
                matchPercentage,
                matchingSkills,
                createdAt: job.createdAt,
                postedDate: getRelativeTime(job.createdAt)
            };
        });

        // Sort by match percentage (highest first), then by date
        jobsWithMatch.sort((a, b) => {
            if (b.matchPercentage !== a.matchPercentage) {
                return b.matchPercentage - a.matchPercentage;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Return top N jobs
        const recommendedJobs = jobsWithMatch.slice(0, limit);

        return res.json({ jobs: recommendedJobs });
    } catch (err) {
        console.error('Error fetching recommended jobs:', err);
        return res.status(500).json({ message: 'Server error fetching recommendations' });
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

// =====================
// APPLICATION ROUTES
// =====================

// POST: Student applies to a job
app.post('/api/applications', authenticateToken, async (req, res) => {
    try {
        // Only students can apply
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can apply to jobs' });
        }

        const { jobId, coverLetter } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if job is still active
        if (!job.isActive) {
            return res.status(400).json({ message: 'This job is no longer accepting applications' });
        }

        // Check if already applied (unique index will also catch this)
        const existingApplication = await Application.findOne({
            job: jobId,
            student: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Get student's current resume
        const student = await User.findById(req.user.id);
        const resumeSnapshot = student?.studentProfile?.resume || '';

        // Create application
        const application = new Application({
            job: jobId,
            student: req.user.id,
            status: 'pending',
            coverLetter: coverLetter || '',
            resumeSnapshot: resumeSnapshot,
            appliedDate: new Date()
        });

        await application.save();

        // Also add to job's applicants array (for backward compatibility)
        await Job.findByIdAndUpdate(jobId, {
            $addToSet: { applicants: req.user.id }
        });

        return res.status(201).json({
            message: 'Application submitted successfully',
            application: {
                id: application._id,
                status: application.status,
                appliedDate: application.appliedDate
            }
        });
    } catch (err) {
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }
        console.error('Error submitting application:', err);
        return res.status(500).json({ message: 'Server error submitting application' });
    }
});

// GET: Get applications for a specific job (Recruiter only)
app.get('/api/applications/job/:jobId', authenticateToken, async (req, res) => {
    try {
        // Only recruiters can view applicants
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can view applicants' });
        }

        const { jobId } = req.params;

        // Verify the job belongs to this recruiter
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only view applicants for your own jobs' });
        }

        // Fetch applications with student details
        const applications = await Application.find({ job: jobId })
            .populate('student', 'name email phoneNumber profilePhoto studentProfile')
            .sort({ appliedDate: -1 });

        const formattedApplications = applications.map(app => ({
            _id: app._id,
            status: app.status,
            statusMessage: app.statusMessage,
            appliedDate: app.appliedDate,
            updatedAt: app.updatedAt,
            coverLetter: app.coverLetter,
            resumeSnapshot: app.resumeSnapshot,
            daysSinceApplied: app.daysSinceApplied,
            student: {
                _id: app.student._id,
                name: app.student.name,
                email: app.student.email,
                phoneNumber: app.student.phoneNumber,
                profilePhoto: app.student.profilePhoto,
                studentProfile: app.student.studentProfile
            }
        }));

        return res.json({
            job: {
                _id: job._id,
                title: job.title,
                company: job.company
            },
            applications: formattedApplications,
            totalApplications: formattedApplications.length
        });
    } catch (err) {
        console.error('Error fetching job applications:', err);
        return res.status(500).json({ message: 'Server error fetching applications' });
    }
});

// GET: Get student's applications (Updated to use Application model)
app.get('/api/applications/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const limit = Math.min(parseInt(req.query.limit, 10) || 0, 50);

        // Students can only view their own applications
        if (req.user.id !== studentId && req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Fetch applications with job details
        let applicationsQuery = Application.find({ student: studentId })
            .populate({
                path: 'job',
                select: 'title company logo location salary type experience isActive postedBy',
                populate: {
                    path: 'postedBy',
                    select: 'name email recruiterProfile'
                }
            })
            .sort({ appliedDate: -1 });

        if (limit > 0) {
            applicationsQuery = applicationsQuery.limit(limit);
        }

        const applications = await applicationsQuery;

        const formattedApplications = applications.map(app => ({
            _id: app._id,
            jobId: app.job._id,
            title: app.job.title,
            company: app.job.company,
            logo: app.job.logo,
            location: app.job.location,
            salary: app.job.salary,
            type: app.job.type,
            experience: app.job.experience,
            isActive: app.job.isActive,
            appliedDate: app.appliedDate,
            status: app.status,
            statusMessage: app.statusMessage,
            updatedAt: app.updatedAt,
            daysSinceApplied: app.daysSinceApplied,
            recruiter: app.job.postedBy ? {
                name: app.job.postedBy.name,
                company: app.job.postedBy.recruiterProfile?.companyName
            } : null
        }));

        return res.json({ applications: formattedApplications });
    } catch (err) {
        console.error('Error fetching student applications:', err);
        return res.status(500).json({ message: 'Server error fetching applications' });
    }
});

// GET: Get recent applications across recruiter's jobs
app.get('/api/applications/recruiter/:recruiterId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can view recent applications' });
        }

        const { recruiterId } = req.params;
        if (req.user.id !== recruiterId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

        const jobs = await Job.find({ postedBy: recruiterId })
            .select('_id title company');

        if (jobs.length === 0) {
            return res.json({
                applications: [],
                stats: {
                    shortlisted: 0,
                    hired: 0,
                    total: 0
                }
            });
        }

        const jobIds = jobs.map(job => job._id);

        const [applications, shortlistedCount, hiredCount, totalCount] = await Promise.all([
            Application.find({ job: { $in: jobIds } })
            .populate('student', 'name profilePhoto studentProfile')
            .populate('job', 'title company')
            .sort({ appliedDate: -1 })
            .limit(limit),
            Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' }),
            Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' }),
            Application.countDocuments({ job: { $in: jobIds } })
        ]);

        const formattedApplications = applications.map(app => ({
            _id: app._id,
            status: app.status,
            appliedDate: app.appliedDate,
            job: app.job ? {
                _id: app.job._id,
                title: app.job.title,
                company: app.job.company
            } : null,
            student: app.student ? {
                _id: app.student._id,
                name: app.student.name,
                profilePhoto: app.student.profilePhoto,
                cgpa: app.student.studentProfile?.cgpa,
                skills: app.student.studentProfile?.skills || []
            } : null
        }));

        return res.json({
            applications: formattedApplications,
            stats: {
                shortlisted: shortlistedCount,
                hired: hiredCount,
                total: totalCount
            }
        });
    } catch (err) {
        console.error('Error fetching recruiter applications:', err);
        return res.status(500).json({ message: 'Server error fetching applications' });
    }
});

// PUT: Update application status (Recruiter only)
app.put('/api/applications/:applicationId/status', authenticateToken, async (req, res) => {
    try {
        // Only recruiters can update status
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can update application status' });
        }

        const { applicationId } = req.params;
        const { status, statusMessage } = req.body;

        // Validate status
        const validStatuses = ['pending', 'in-review', 'shortlisted', 'interview', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find application and verify ownership
        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify the job belongs to this recruiter
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only update applications for your own jobs' });
        }

        // Update application
        application.status = status;
        application.statusMessage = statusMessage || '';
        application.updatedAt = new Date();

        await application.save();

        return res.json({
            message: 'Application status updated successfully',
            application: {
                _id: application._id,
                status: application.status,
                statusMessage: application.statusMessage,
                updatedAt: application.updatedAt
            }
        });
    } catch (err) {
        console.error('Error updating application status:', err);
        return res.status(500).json({ message: 'Server error updating application' });
    }
});

// DELETE: Student withdraws application
app.delete('/api/applications/:applicationId', authenticateToken, async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Find application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Students can only withdraw their own applications
        if (application.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only withdraw your own applications' });
        }

        // Check if application can be withdrawn (not if already accepted/rejected)
        if (['accepted', 'rejected'].includes(application.status)) {
            return res.status(400).json({ message: 'Cannot withdraw an application that has been finalized' });
        }

        // Remove from job's applicants array
        await Job.findByIdAndUpdate(application.job, {
            $pull: { applicants: req.user.id }
        });

        // Delete application
        await Application.findByIdAndDelete(applicationId);

        return res.json({ message: 'Application withdrawn successfully' });
    } catch (err) {
        console.error('Error withdrawing application:', err);
        return res.status(500).json({ message: 'Server error withdrawing application' });
    }
});

// GET: Check if student has applied to a job
app.get('/api/applications/check/:jobId', authenticateToken, async (req, res) => {
    try {
        const { jobId } = req.params;

        const application = await Application.findOne({
            job: jobId,
            student: req.user.id
        });

        return res.json({
            hasApplied: !!application,
            application: application ? {
                _id: application._id,
                status: application.status,
                appliedDate: application.appliedDate
            } : null
        });
    } catch (err) {
        console.error('Error checking application:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// POST: Send bulk emails to applicants
app.post('/api/emails/send-bulk', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can send bulk emails' });
        }

        const { applicationIds, status, subject, message } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ message: 'No applications selected' });
        }

        // Get recruiter info
        const recruiter = await User.findById(req.user.id);
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        // Fetch applications with student and job details
        const applications = await Application.find({ _id: { $in: applicationIds } })
            .populate('student', 'name email')
            .populate('job', 'title company postedBy');

        // Filter to only applications belonging to this recruiter's jobs
        const validApplications = applications.filter(
            app => app.job && app.job.postedBy.toString() === req.user.id
        );

        if (validApplications.length === 0) {
            return res.status(403).json({ message: 'No valid applications found for your jobs' });
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        let sent = 0;
        let failed = 0;
        const errors = [];

        // Send emails to each applicant
        for (const app of validApplications) {
            try {
                const emailContent = buildEmailContent({
                    status: status || app.status,
                    studentName: app.student.name,
                    jobTitle: app.job.title,
                    companyName: recruiter.recruiterProfile?.companyName || app.job.company,
                    recruiterName: recruiter.name,
                    recruiterPosition: recruiter.recruiterProfile?.position || 'Recruiter',
                    recruiterEmail: recruiter.email,
                    statusMessage: app.statusMessage,
                    customMessage: message,
                    subjectOverride: subject
                });

                await transporter.sendMail({
                    from: process.env.GMAIL,
                    to: app.student.email,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });

                sent++;
            } catch (emailErr) {
                console.error(`Failed to send email to ${app.student.email}:`, emailErr.message);
                failed++;
                errors.push({ email: app.student.email, error: emailErr.message });
            }
        }

        return res.json({
            message: `Emails sent successfully`,
            sent,
            failed,
            total: validApplications.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('Error sending bulk emails:', err);
        return res.status(500).json({ message: 'Server error sending emails' });
    }
});

// Helper function to format an absolute posted date
function getRelativeTime(date) {
    if (!date) {
        return 'Unknown';
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return 'Unknown';
    }

    return parsedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// =====================
// RESUME UPLOAD ROUTES
// =====================

// POST: Upload resume (for students)
app.post('/api/upload/resume', authenticateToken, (req, res) => {
    uploadResume.single('resume')(req, res, async (err) => {
        // Handle multer errors
        if (err) {
            console.error('Upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size exceeds 5MB limit' });
            }
            return res.status(400).json({ message: err.message || 'Error uploading file' });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        try {
            const userId = req.user.id;
            const resumeUrl = req.file.path; // Cloudinary URL

            // Get the user to check for existing resume
            const existingUser = await User.findById(userId);
            if (existingUser?.studentProfile?.resume) {
                // Delete old resume from Cloudinary
                const oldPublicId = getPublicIdFromUrl(existingUser.studentProfile.resume);
                if (oldPublicId) {
                    try {
                        await deleteFromCloudinary(oldPublicId);
                    } catch (deleteErr) {
                        console.error('Error deleting old resume:', deleteErr);
                        // Continue even if old file deletion fails
                    }
                }
            }

            // Update user's resume field
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: { 'studentProfile.resume': resumeUrl } },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json({
                message: 'Resume uploaded successfully',
                resumeUrl: resumeUrl,
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
        } catch (error) {
            console.error('Error saving resume URL:', error);
            return res.status(500).json({ message: 'Error saving resume' });
        }
    });
});

// DELETE: Delete resume (for students)
app.delete('/api/upload/resume', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user to find current resume URL
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resumeUrl = user.studentProfile?.resume;
        if (!resumeUrl) {
            return res.status(400).json({ message: 'No resume to delete' });
        }

        // Delete from Cloudinary
        const publicId = getPublicIdFromUrl(resumeUrl);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        // Remove resume URL from database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $unset: { 'studentProfile.resume': '' } },
            { new: true }
        ).select('-password');

        return res.json({
            message: 'Resume deleted successfully',
            user: {
                id: updatedUser._id,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.phoneNumber,
                profilePhoto: updatedUser.profilePhoto,
                studentProfile: updatedUser.studentProfile,
                recruiterProfile: updatedUser.recruiterProfile,
            },
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return res.status(500).json({ message: 'Error deleting resume' });
    }
});

// TEST ROUTE - Remove after debugging
app.post('/api/test-upload', (req, res) => {
    console.log('Test upload route hit');
    console.log('Headers:', req.headers);
    
    uploadResume.single('resume')(req, res, (err) => {
        console.log('Multer callback');
        console.log('Error:', err);
        console.log('File:', req.file);
        
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file' });
        }
        res.json({ success: true, url: req.file.path });
    });
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
