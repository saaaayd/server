const express = require('express');
const router = express.Router();
const {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const { restrictTo } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getStudents)
    .post(protect, restrictTo('admin'), createStudent);

router.route('/:id')
    .put(protect, restrictTo('admin'), updateStudent)
    .delete(protect, restrictTo('admin'), deleteStudent);

module.exports = router;
