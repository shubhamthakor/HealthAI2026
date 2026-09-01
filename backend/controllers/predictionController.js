const Doctor = require('../models/Doctor');
const aiService = require('../services/aiService');
const nlpService = require('../services/nlpService');
const diseaseLoader = require('../utils/diseaseLoader');
const { AppError } = require('../moddleware/errorMiddleware');

/**
 * Controller to handle AI-based disease prediction and doctor recommendation workflow.
 * 
 * @route   POST /api/v1/ai/predict
 * @access  Private (Patient role)
 */
const predictDiseaseController = async (req, res, next) => {
  const { symptoms, lang = 'en', city } = req.body;
  
  // 1. Validation checks
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return next(new AppError('Symptoms must be a non-empty array of strings.', 400, 'BAD_REQUEST'));
  }
  
  const allowedLanguages = ['en', 'gu', 'hi'];
  if (!allowedLanguages.includes(lang)) {
    return next(new AppError("Language must be one of 'en', 'gu', or 'hi'.", 400, 'BAD_REQUEST'));
  }
  
  try {
    // 2. Query Python FastAPI service
    const { predictedDisease, confidence } = await aiService.predictDisease(symptoms);
    
    // 3. Load disease localized details (name, description, precautions)
    const diseaseInfo = diseaseLoader.loadDiseaseInfo(predictedDisease, lang);
    
    // 4. Load doctor specialization mapping
    const specialization = diseaseLoader.getSpecializationForDisease(predictedDisease);
    
    // 5. Fetch doctors matching mapped specialization and city (if specified)
    const doctorQuery = { specialization: specialization };
    if (city && typeof city === 'string' && city.trim() !== '') {
      doctorQuery.city = new RegExp('^' + city.trim() + '$', 'i'); // Case-insensitive match
    }
    const recommendedDoctors = await Doctor.find(doctorQuery);
    
    // 6. Return formatted response
    res.status(200).json({
      success: true,
      data: {
        predictedDisease: diseaseInfo.name, // Localized name based on language selection
        confidence: confidence,
        specialization: specialization,
        description: diseaseInfo.description,
        precautions: diseaseInfo.precautions,
        recommendedDoctors: recommendedDoctors
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to handle NLP-based symptom extraction from raw speech/text,
 * followed by disease prediction and doctor recommendation.
 * 
 * @route   POST /api/v1/ai/detect
 * @access  Private (Patient role)
 */
const detectSymptomsController = async (req, res, next) => {
  const { inputText, speechText, lang = 'en', city } = req.body;
  const rawText = inputText || speechText;

  // 1. Validation checks
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
    return next(new AppError('inputText or speechText must be a non-empty string.', 400, 'BAD_REQUEST'));
  }

  const allowedLanguages = ['en', 'gu', 'hi'];
  if (!allowedLanguages.includes(lang)) {
    return next(new AppError("Language must be one of 'en', 'gu', or 'hi'.", 400, 'BAD_REQUEST'));
  }

  try {
    // 2. Extract symptoms via Groq NLP Service
    const symptoms = await nlpService.extractSymptoms(rawText, lang);

    if (!symptoms || symptoms.length === 0) {
      return next(new AppError('No recognizable clinical symptoms could be extracted from your description.', 400, 'BAD_REQUEST'));
    }

    // 3. Query Python FastAPI service with extracted symptoms
    const { predictedDisease, confidence } = await aiService.predictDisease(symptoms);

    // 4. Load disease localized details (name, description, precautions)
    const diseaseInfo = diseaseLoader.loadDiseaseInfo(predictedDisease, lang);

    // 5. Load doctor specialization mapping
    const specialization = diseaseLoader.getSpecializationForDisease(predictedDisease);

    // 6. Fetch doctors matching mapped specialization and city (if specified)
    const doctorQuery = { specialization: specialization };
    if (city && typeof city === 'string' && city.trim() !== '') {
      doctorQuery.city = new RegExp('^' + city.trim() + '$', 'i'); // Case-insensitive match
    }
    const recommendedDoctors = await Doctor.find(doctorQuery);

    // 7. Return formatted response matching the api-contracts spec
    res.status(200).json({
      success: true,
      data: {
        extractedSymptoms: symptoms,
        internalKey: predictedDisease,
        confidence: confidence,
        prediction: {
          diseaseName: diseaseInfo.name,
          description: diseaseInfo.description,
          precautions: diseaseInfo.precautions
        },
        recommendedSpecialization: specialization,
        recommendedDoctors: recommendedDoctors
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictDiseaseController,
  detectSymptomsController
};
