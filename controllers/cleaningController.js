const CleaningSchedule = require('../models/CleaningSchedule');

// @desc    Get all cleaning schedules
// @route   GET /api/cleaning-schedule
// @access  Public
const getCleaningSchedules = async (req, res) => {
    try {
        const schedules = await CleaningSchedule.find().sort({ scheduledDate: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create cleaning schedule
// @route   POST /api/cleaning-schedule
// @access  Admin
const createCleaningSchedule = async (req, res) => {
    try {
        const schedule = await CleaningSchedule.create(req.body);
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update cleaning schedule
// @route   PUT /api/cleaning-schedule/:id
// @access  Admin
const updateCleaningSchedule = async (req, res) => {
    try {
        const updatedSchedule = await CleaningSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete cleaning schedule
// @route   DELETE /api/cleaning-schedule/:id
// @access  Admin
const deleteCleaningSchedule = async (req, res) => {
    try {
        await CleaningSchedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCleaningSchedules,
    createCleaningSchedule,
    updateCleaningSchedule,
    deleteCleaningSchedule
};
