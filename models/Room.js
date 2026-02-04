const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String, // e.g., 'Single', 'Double', 'Quad'
        required: false // Made optional as per user request
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available'
    },
    features: [{
        type: String // e.g., 'Air Conditioning', 'Private Bath', etc.
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
