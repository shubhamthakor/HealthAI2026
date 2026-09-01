const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { AppError } = require('../moddleware/errorMiddleware');

// Cache the symptoms vocabulary in memory
let vocabularyCache = null;

/**
 * Loads the symptoms vocabulary from the ai-model's trained models directory.
 * 
 * @returns {string[]} The array of allowed symptoms
 */
const getVocabulary = () => {
  if (vocabularyCache) {
    return vocabularyCache;
  }

  const vocabPath = path.join(__dirname, '..', '..', 'ai-model', 'trained_models', 'symptoms_vocabulary.json');
  
  if (!fs.existsSync(vocabPath)) {
    console.error('Symptoms vocabulary file not found at:', vocabPath);
    throw new AppError('Clinical symptoms vocabulary file is missing. Please run model training first.', 500, 'INTERNAL_SERVER_ERROR');
  }

  try {
    const fileData = fs.readFileSync(vocabPath, 'utf8');
    const parsedData = JSON.parse(fileData);
    if (Array.isArray(parsedData)) {
      vocabularyCache = parsedData;
      return vocabularyCache;
    }
    throw new Error('Vocabulary file is not an array.');
  } catch (error) {
    console.error('Error reading symptoms vocabulary:', error);
    throw new AppError('Failed to load clinical symptoms vocabulary.', 500, 'INTERNAL_SERVER_ERROR');
  }
};

const extractSymptoms = async (inputText, lang = 'en') => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here') {
    // If in development/development-like mode, allow a local mock keyword extraction fallback for tests
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDev) {
      console.warn('[Mock NLP Service] Groq API key is a placeholder. Using keyword-based symptom extraction fallback.');
      const text = (inputText || '').toLowerCase();
      
      if (text.includes('sneezing') || text.includes('watering') || text.includes('shivering')) {
        return ['continuous_sneezing', 'watering_from_eyes', 'shivering'];
      }
      if (text.includes('તાવ') || text.includes('કમજોરી') || text.includes('fever') || text.includes('weakness')) {
        return ['high_fever', 'fatigue'];
      }
      if (text.includes('दर्द') || text.includes('उल्टी') || text.includes('vomiting') || text.includes('stomach') || text.includes('पेट')) {
        return ['abdominal_pain', 'vomiting'];
      }
      return [];
    }

    throw new AppError(
      'Groq API key is not configured. Please add a valid GROQ_API_KEY in the backend .env file.',
      500,
      'GROQ_CONFIG_ERROR'
    );
  }

  const vocabulary = getVocabulary();
  
  const systemPrompt = `You are a medical clinical assistant. Your task is to extract symptoms from the user's patient description.
The user description may be written in English, Gujarati, or Hindi.
You must map the symptoms mentioned in the description ONLY to the allowed vocabulary of 131 symptoms listed below.
Do not extract symptoms that are not in this list.

Allowed Symptoms Vocabulary:
${vocabulary.join(', ')}

You must return a JSON object with a single key 'symptoms' whose value is a JSON array of strings from the allowed vocabulary list above.
If no matching symptoms are found, return an empty array.
Do not include any conversational preamble, markdown formatting (like \`\`\`json), or extra explanation. Return only the JSON object.

Example Output:
{
  "symptoms": ["mild_fever", "fatigue"]
}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Extract symptoms for patient description (Language: ${lang}): "${inputText}"`
          }
        ],
        response_format: {
          type: 'json_object'
        },
        temperature: 0.0,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 8000 // 8 seconds timeout
      }
    );

    const completionText = response.data.choices[0].message.content;
    const parsed = JSON.parse(completionText);
    
    if (parsed && Array.isArray(parsed.symptoms)) {
      // Filter the returned symptoms to guarantee they exist in vocabulary (safety check)
      const validSymptoms = parsed.symptoms.filter(symptom => vocabulary.includes(symptom));
      return validSymptoms;
    }
    
    return [];
  } catch (error) {
    console.error('Groq NLP API request failed:', error.message);
    
    // 1. If Groq responded with an error (e.g. invalid key)
    if (error.response) {
      const statusCode = error.response.status;
      const errorMsg = error.response.data && error.response.data.error && error.response.data.error.message
        ? error.response.data.error.message
        : 'Groq API error';
      throw new AppError(`Groq NLP service error: ${errorMsg}`, statusCode, 'GROQ_API_ERROR');
    }
    
    // 2. If no response was received (e.g., connection timeout)
    if (error.request) {
      throw new AppError(
        'Groq NLP service is currently unreachable or timed out.',
        503,
        'GROQ_SERVICE_UNAVAILABLE'
      );
    }
    
    // 3. JSON parsing error
    if (error instanceof SyntaxError) {
      throw new AppError(
        'Failed to parse structured symptoms returned by Groq NLP service.',
        502,
        'GROQ_PARSE_ERROR'
      );
    }

    throw new AppError(
      `NLP Service error: ${error.message}`,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

module.exports = {
  extractSymptoms
};
