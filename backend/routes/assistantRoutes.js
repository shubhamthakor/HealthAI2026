const express = require('express');
const { chatController } = require('../controllers/assistantController');
const { protect, authorizeRoles } = require('../moddleware/authMiddleware');

const router = express.Router();

// Main conversational route for patients
// Access: Private (Patient only)
router.post(
  '/chat',
  protect,
  authorizeRoles('patient'),
  chatController
);

module.exports = router;
