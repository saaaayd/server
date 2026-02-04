const SystemLog = require('../models/SystemLog');

/**
 * Creates a system log entry
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Short description of the action (e.g., 'LOGIN', 'CREATE_PAYMENT')
 * @param {any} details - Additional details (object or string)
 * @param {object} req - Express request object (optional, for IP)
 */
const logAction = async (userId, action, details, req = null) => {
    try {
        let ipAddress = 'Unknown';
        if (req) {
            ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        }

        await SystemLog.create({
            user: userId,
            action,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Failed to create system log:', error);
        // We don't want logging failure to crash the main request
    }
};

module.exports = { logAction };
