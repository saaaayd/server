const mongoose = require('mongoose');

const cleaningScheduleSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String, // Could be a name or role
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema);
