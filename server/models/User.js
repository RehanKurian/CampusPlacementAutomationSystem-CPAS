const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // === COMMON DETAILS (For Everyone) ===
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String }, // Useful for updates/OTP
    profilePhoto: { type: String }, // Link to image
    
    role: { 
        type: String, 
        enum: ['student', 'recruiter', 'admin'], 
        default: 'student' 
    },

    // === STUDENT SECTION (Only for Students) ===
    studentProfile: {
        // Personal
        usn: { type: String }, // University Seat Number (Crucial for colleges)
        gender: { type: String, enum: ['Male', 'Female', 'Other'] }, // Some drives are gender-specific
        dob: { type: Date },

        // Education (The Filtering Logic)
        branch: { type: String }, // e.g., "BCA", "CSE"
        cgpa: { type: Number, default: 0 },
        tenthMarks: { type: Number, default: 0 }, // Percentages
        twelfthMarks: { type: Number, default: 0 },
        backlogs: { type: Number, default: 0 }, // IMPORTANT: To block ineligible students

        // Professional
        skills: [String], // e.g., ["React", "Python", "Java"] - Good for search
        resume: { type: String }, // Link from Cloudinary
        
        // Experience (Simple Array)
        experience: [{
            companyName: String,
            role: String,
            duration: String, // e.g., "3 Months"
        }],

        // Certifications
        certifications: [String] // e.g., ["AWS Certified", "NPTEL Python"]
    },

    // === RECRUITER SECTION (Only for Recruiters) ===
    recruiterProfile: {
        companyName: { type: String },
        position: { type: String }, // e.g., "HR Manager" or "Technical Lead"
        companyWebsite: { type: String },
        linkedInProfile: { type: String } // Good for verification
    }

}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

const User = mongoose.model('users', userSchema);
module.exports = User;
