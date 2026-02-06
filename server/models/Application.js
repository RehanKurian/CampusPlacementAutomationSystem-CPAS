/**
 * Application.js
 * 
 * Mongoose schema for job applications.
 * Tracks the entire application lifecycle from submission to hiring.
 * 
 * This model creates a separate collection to properly track:
 * - Which student applied to which job
 * - Application status (pending, in-review, shortlisted, accepted, rejected)
 * - Status history and messages
 * - Application timestamps
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // ============================================
    // REFERENCES
    // ============================================
    
    // Reference to the job being applied for
    job: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'jobs',  // References the Job collection
        required: true 
    },
    
    // Reference to the student who applied
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',  // References the User collection
        required: true 
    },

    // ============================================
    // APPLICATION STATUS
    // ============================================
    
    // Current status of the application
    status: { 
        type: String, 
        enum: [
            'pending',      // Just applied, waiting for review
            'in-review',    // Recruiter is reviewing
            'shortlisted',  // Made it to shortlist
            'interview',    // Interview scheduled
            'accepted',     // Offer extended / Hired
            'rejected'      // Application rejected
        ],
        default: 'pending'
    },
    
    // Optional message from recruiter (e.g., "Interview on Monday 10 AM")
    statusMessage: { 
        type: String,
        default: ''
    },

    // ============================================
    // TIMESTAMPS
    // ============================================
    
    // When the student applied
    appliedDate: { 
        type: Date, 
        default: Date.now 
    },
    
    // When the status was last updated
    updatedAt: { 
        type: Date,
        default: Date.now
    },

    // ============================================
    // SNAPSHOT DATA (Optional but useful)
    // ============================================
    
    // Store resume link at time of application
    // (in case student updates resume later, recruiter sees original)
    resumeSnapshot: {
        type: String,
        default: ''
    },
    
    // Cover letter or additional message from student
    coverLetter: {
        type: String,
        default: ''
    }

}, {
    // Automatically manage createdAt and updatedAt
    timestamps: true
});

// ============================================
// INDEXES
// ============================================

// Compound index to ensure a student can only apply once per job
// This prevents duplicate applications
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

// Index for faster queries by student (My Applications page)
applicationSchema.index({ student: 1, appliedDate: -1 });

// Index for faster queries by job (Recruiter viewing applicants)
applicationSchema.index({ job: 1, status: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate days since application
applicationSchema.virtual('daysSinceApplied').get(function() {
    const now = new Date();
    const applied = new Date(this.appliedDate);
    const diffTime = Math.abs(now - applied);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtuals are included in JSON output
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

// Create and export the model
const Application = mongoose.model('applications', applicationSchema);

module.exports = Application;
