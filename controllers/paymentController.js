const Payment = require('../models/Payment');
const User = require('../models/User');
const { logAction } = require('../utils/logger');
const { uploadFile } = require('../utils/driveService');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('student', 'name email roomNumber');
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my payment history
// @route   GET /api/payments/my-history
// @access  Private (Student)
const getMyHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private (Admin)
const createPayment = async (req, res) => {
    const { student, amount, type, dueDate, notes, receiptUrl } = req.body;

    try {
        // Check if student exists
        const studentUser = await User.findById(student);
        if (!studentUser || studentUser.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        let finalReceiptUrl = receiptUrl;

        // Handle File Upload
        if (req.file) {
            try {
                finalReceiptUrl = await uploadFile(req.file);
            } catch (uErr) {
                console.error(uErr);
                return res.status(500).json({ message: 'Failed to upload receipt image' });
            }
        }

        const payment = await Payment.create({
            student,
            amount,
            type,
            dueDate,
            notes,
            receiptUrl: finalReceiptUrl,
            status: finalReceiptUrl ? 'paid' : 'pending' // Default to paid if receipt provided? Or pending? User didn't specify, but usually receipt implies paid.
        });

        res.status(201).json(payment);

        // Log payment creation
        // Note: req.user might be undefined if this is an admin action on behalf of someone else, 
        // need to check if we have req.user from middleware
        const actorId = req.user ? req.user.id : student;
        await logAction(actorId, 'CREATE_PAYMENT', `Created payment of ${amount} for student ${studentUser.email}`, req);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment status / Upload receipt
// @route   PUT/PATCH /api/payments/:id
// @access  Private
const updatePaymentStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Handle File Upload
        if (req.file) {
            try {
                const publicUrl = await uploadFile(req.file);
                payment.receiptUrl = publicUrl;
                payment.status = 'paid'; // Auto-set to paid if receipt uploaded
            } catch (uErr) {
                console.error(uErr);
                return res.status(500).json({ message: 'Failed to upload receipt image' });
            }
        }

        // Handle JSON Body Updates
        if (status) payment.status = status;
        if (req.body.receiptUrl && !req.file) payment.receiptUrl = req.body.receiptUrl; // Allow manual link overrides

        if (payment.status === 'paid') {
            // Only set paidDate if it wasn't set before
            if (!payment.paidDate) payment.paidDate = Date.now();
        } else if (payment.status !== 'verified') {
            // Reset if moved away from paid/verified? 
            // kept simple logic for now
        }

        const updatedPayment = await payment.save();

        // Log status update
        const actorId = req.user ? req.user.id : 'system';
        await logAction(actorId, 'UPDATE_PAYMENT', `Updated payment ${payment._id}`, req);

        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        await payment.deleteOne();

        // Log deletion
        const actorId = req.user ? req.user.id : 'system';
        await logAction(actorId, 'DELETE_PAYMENT', `Deleted payment ${req.params.id}`, req);

        res.status(200).json({ message: 'Payment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPayments,
    getMyHistory,
    createPayment,
    updatePaymentStatus,
    deletePayment,
};
