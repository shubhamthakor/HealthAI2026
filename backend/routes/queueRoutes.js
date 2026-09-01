const express = require('express');
const { getActiveQueue, advanceQueue, adminOverrideQueue } = require('../controllers/queueController');
const { protect, authorizeRoles } = require('../moddleware/authMiddleware');

const router = express.Router();

// Active Daily Queue Query
// Access: Patients, Doctors, Admins
router.get('/active', protect, getActiveQueue);

// Move to next patient in line
// Access: Doctor only
router.post('/next', protect, authorizeRoles('doctor'), advanceQueue);

// Emergency Override: Rearrange appointment position in queue
// Access: Admin only
router.patch('/override', protect, authorizeRoles('admin'), adminOverrideQueue);

module.exports = router;
