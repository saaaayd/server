const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student',
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined for admins
    },
    studentProfile: {
        type: {
            roomNumber: String,
            phoneNumber: String,
            enrollmentDate: Date,
            emergencyContactName: String,
            emergencyContactPhone: String,
            status: {
                type: String,
                enum: ['active', 'inactive', 'graduated'],
                default: 'inactive',
            },
        },
        default: undefined, // Only for students
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // pending by default for everyone (except seeded admins theoretically)
    }
}, { timestamps: true });

// Pre-save hook to ensure studentProfile exists only for students?
// Doing this validation in the controller is flexible, but could be enforced here.


module.exports = mongoose.model('User', userSchema);
