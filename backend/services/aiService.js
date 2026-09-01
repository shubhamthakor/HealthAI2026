const axios = require('axios');
const { AppError } = require('../moddleware/errorMiddleware');

/**
 * Sends a list of standardized symptoms to the Python FastAPI microservice
 * to predict the corresponding disease and obtain model confidence.
 * 
 * @param {string[]} symptoms - List of symptom strings (e.g., ["headache", "vomiting"])
 * @returns {Promise<{predictedDisease: string, confidence: number}>}
 */
const predictDisease = async (symptoms) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  
  try {
    const response = await axios.post(`${aiServiceUrl}/predict`, {
      symptoms: symptoms
    }, {
      timeout: 5000 // 5 seconds timeout
    });
    
    const { predictedDisease, confidence } = response.data;
    return { predictedDisease, confidence };
  } catch (error) {
    console.error('AI Service communication failed:', error.message);
    
    // 1. If AI service responded with a validation or client error (e.g. 400 Bad Request)
    if (error.response) {
      const statusCode = error.response.status;
      const detail = error.response.data && error.response.data.detail 
        ? error.response.data.detail 
        : 'AI service request error';
        
      throw new AppError(detail, statusCode, 'AI_SERVICE_ERROR');
    }
    
    // 2. If no response was received (e.g., connection timeout, service offline)
    if (error.request) {
      throw new AppError(
        'AI prediction service is currently unreachable or timed out.',
        503,
        'AI_SERVICE_UNAVAILABLE'
      );
    }
    
    // 3. Fallback for other errors
    throw new AppError(
      `AI Service initialization error: ${error.message}`,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

module.exports = {
  predictDisease
};
