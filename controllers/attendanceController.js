const Attendance = require('../models/Attendance');

// @desc    Get all attendance logs
// @route   GET /api/attendance
// @access  Public/Admin
const getAttendance = async (req, res) => {
    try {
        const logs = await Attendance.find().sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create attendance log
// @route   POST /api/attendance
// @access  Admin
const createAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.create(req.body);
        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Admin
const updateAttendance = async (req, res) => {
    try {
        const updatedAttendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedAttendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAttendance,
    createAttendance,
    updateAttendance
};
