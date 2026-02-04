const User = require('../models/User');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const pendingMaintenance = await MaintenanceRequest.countDocuments({ status: 'pending' });
        const overduePayments = await Payment.countDocuments({ status: 'overdue' });
        const pendingCleaning = 0; // Mock data as requested

        res.status(200).json({
            totalStudents,
            pendingMaintenance,
            pendingCleaning,
            overduePayments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student/stats
// @access  Private (Student)
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Calculate balance (pending + overdue payments)
        const payments = await Payment.find({
            student: studentId,
            status: { $in: ['pending', 'overdue'] },
        });

        const balance = payments.reduce((acc, curr) => acc + curr.amount, 0);

        const pendingRequests = await MaintenanceRequest.countDocuments({
            student: studentId,
            status: { $ne: 'resolved' },
        });

        res.status(200).json({
            balance,
            pendingRequests,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getStudentStats,
};
