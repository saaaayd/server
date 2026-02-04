const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, rejectUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/pending', getPendingUsers);
router.put('/:id/approve', approveUser);
router.put('/:id/reject', rejectUser);

module.exports = router;
