const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    // === BASIC JOB DETAILS ===
    title: { 
        type: String, 
        required: true 
    },
    company: { 
        type: String, 
        required: true 
    },
    logo: { 
        type: String,
        default: '🏢' // Emoji or image URL
    },
    location: { 
        type: String, 
        required: true 
    },
    
    // === COMPENSATION & TYPE ===
    salary: { 
        type: String, 
        required: true // e.g., "₹15-25 LPA"
    },
    type: { 
        type: String, 
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        default: 'Full-time'
    },
    experience: { 
        type: String, 
        default: '0-2 years' // e.g., "0-2 years", "3-5 years"
    },

    // === JOB DESCRIPTION ===
    description: { 
        type: String, 
        required: true 
    },
    skills: [{ 
        type: String // e.g., ["React", "Node.js", "MongoDB"]
    }],

    // === RECRUITER REFERENCE ===
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', // Links to the User model (recruiter)
        required: true
    },

    // === APPLICATION TRACKING ===
    applicants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' // Students who applied
    }],

    // === STATUS ===
    isActive: { 
        type: Boolean, 
        default: true // To hide/show job listings
    }

}, { timestamps: true }); // Adds createdAt and updatedAt automatically


// Ensure virtuals are included when converting to JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('jobs', jobSchema);
module.exports = Job;
