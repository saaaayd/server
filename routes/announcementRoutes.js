const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/', protect, getAnnouncements);
router.post('/', protect, restrictTo('admin'), createAnnouncement);

module.exports = router;
