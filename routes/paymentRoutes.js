const express = require('express');
const router = express.Router();
const {
    getPayments,
    getMyHistory,
    createPayment,
    updatePaymentStatus,
    deletePayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Multer config (Memory storage for GDrive upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get('/', protect, restrictTo('admin'), getPayments);
// Create payment with optional receipt
router.post('/', protect, restrictTo('admin'), upload.single('receipt_image'), createPayment);
router.get('/my-history', protect, restrictTo('student'), getMyHistory);

// Update status OR upload receipt
// PUT allows FormData with file (student/admin)
router.put('/:id', protect, upload.single('receipt_image'), updatePaymentStatus);
// PATCH allows simple JSON status updates (admin verify)
router.patch('/:id', protect, restrictTo('admin'), updatePaymentStatus);
router.delete('/:id', protect, restrictTo('admin'), deletePayment);

module.exports = router;
