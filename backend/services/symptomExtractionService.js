const nlpService = require('./nlpService');

/**
 * Extracts and maps clinical symptoms from input text using the existing Groq NLP service.
 * 
 * @param {string} inputText - User described symptom description.
 * @param {string} [lang='en'] - Language code ('en', 'gu', 'hi').
 * @returns {Promise<string[]>} List of validated English clinical symptoms vocabulary tokens.
 */
const extractSymptoms = async (inputText, lang = 'en') => {
  return await nlpService.extractSymptoms(inputText, lang);
};

module.exports = {
  extractSymptoms
};
