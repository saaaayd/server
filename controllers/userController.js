const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
const { logAction } = require('../utils/logger');

// @desc    Get all pending users
// @route   GET /api/users/pending
// @access  Admin
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
// @access  Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'approved';

        // Automatically set student profile status to active if user is a student
        if (!user.studentProfile) {
            user.studentProfile = {
                status: 'active'
            };
        } else {
            user.studentProfile.status = 'active';
        }

        await user.save();

        // Send email
        await sendApprovalEmail(user);

        // Log action
        await logAction(req.user.id, 'APPROVE_USER', `Approved user: ${user.email}`, req);

        res.json({ message: 'User approved and notified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject user
// @route   PUT /api/users/:id/reject
// @access  Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'rejected';
        await user.save();

        // Send email
        await sendRejectionEmail(user, req.body.reason);

        // Log action
        await logAction(req.user.id, 'REJECT_USER', `Rejected user: ${user.email}. Reason: ${req.body.reason}`, req);

        res.json({ message: 'User rejected and notified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingUsers,
    approveUser,
    rejectUser
};
