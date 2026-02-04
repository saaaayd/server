const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['normal', 'important', 'urgent'],
        default: 'normal',
    },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
