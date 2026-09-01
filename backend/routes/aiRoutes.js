const express = require('express');
const { predictDiseaseController, detectSymptomsController } = require('../controllers/predictionController');
const { protect, authorizeRoles } = require('../moddleware/authMiddleware');

const router = express.Router();

// Route for live disease prediction and doctor recommendations from symptom lists
// Access: Private (Patient only)
router.post(
  '/predict',
  protect,
  authorizeRoles('patient'),
  predictDiseaseController
);

// Route for NLP-based symptom extraction from raw speech/text, prediction, and recommendations
// Access: Private (Patient only)
router.post(
  '/detect',
  protect,
  authorizeRoles('patient'),
  detectSymptomsController
);

module.exports = router;
