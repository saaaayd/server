const express = require('express');
const router = express.Router();
const {
    getCleaningSchedules,
    createCleaningSchedule,
    updateCleaningSchedule,
    deleteCleaningSchedule
} = require('../controllers/cleaningController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getCleaningSchedules)
    .post(protect, restrictTo('admin'), createCleaningSchedule);

router.route('/:id')
    .put(protect, restrictTo('admin'), updateCleaningSchedule)
    .delete(protect, restrictTo('admin'), deleteCleaningSchedule);

module.exports = router;
