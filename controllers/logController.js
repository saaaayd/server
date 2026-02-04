const SystemLog = require('../models/SystemLog');

// @desc    Get system logs
// @route   GET /api/logs
// @access  Admin
const getLogs = async (req, res) => {
    try {
        const { action, startDate, endDate } = req.query;
        let query = {};

        if (action) {
            query.action = { $regex: action, $options: 'i' };
        }

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        }

        const logs = await SystemLog.find(query)
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(100); // Limit to last 100 logs for performance

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLogs };
