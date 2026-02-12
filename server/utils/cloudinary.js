require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for resumes
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        return {
            folder: 'resumes',
            resource_type: 'raw',
            public_id: `resume_${userId}_${timestamp}`,
            // Don't specify format for raw resource type
        };
    },
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Configure multer with Cloudinary storage
const uploadResume = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // URL format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{folder}/{public_id}
    const matches = url.match(/\/resumes\/(resume_[^/]+)/);
    return matches ? `resumes/${matches[1]}` : null;
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    uploadResume,
    getPublicIdFromUrl,
    deleteFromCloudinary,
};