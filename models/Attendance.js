const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    timeIn: {
        type: Date,
    },
    timeOut: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['present', 'late', 'absent'],
        default: 'present',
    },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
