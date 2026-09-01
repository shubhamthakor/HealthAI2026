const fs = require('fs');
const path = require('path');

// Simple in-memory cache to avoid reading from disk on every prediction request
const cache = {};

/**
 * Loads JSON configuration content with caching.
 * 
 * @param {string} filename - Filename inside the backend/data/disease directory
 * @returns {object|null} Parsed JSON content or null if file not found
 */
const getFileContent = (filename) => {
  if (cache[filename]) {
    return cache[filename];
  }
  
  const filepath = path.join(__dirname, '..', 'data', 'disease', filename);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  
  try {
    const fileData = fs.readFileSync(filepath, 'utf8');
    const parsedData = JSON.parse(fileData);
    cache[filename] = parsedData;
    return parsedData;
  } catch (error) {
    console.error(`Error loading or parsing JSON file ${filename}:`, error);
    return null;
  }
};

/**
 * Loads disease name, description, and precautions localized by lang string.
 * Falls back to English if the translation is missing.
 * 
 * @param {string} diseaseName - Standard disease key (e.g. "Typhoid")
 * @param {string} lang - Language code ('en', 'gu', 'hi')
 * @returns {{name: string, description: string, precautions: string[]}}
 */
const loadDiseaseInfo = (diseaseName, lang = 'en') => {
  let filename;
  
  if (lang === 'gu') {
    filename = 'disease_gujarati.json';
  } else if (lang === 'hi') {
    filename = 'disease_hindi.json';
  } else {
    filename = 'disease.json';
  }
  
  let data = getFileContent(filename);
  let info = data ? data[diseaseName] : null;
  
  // Fallback to English files if translated key or file is unavailable
  if (!info && filename !== 'disease.json') {
    const englishData = getFileContent('disease.json');
    info = englishData ? englishData[diseaseName] : null;
  }
  
  return info || {
    name: diseaseName,
    description: "No description available.",
    precautions: []
  };
};

/**
 * Maps a disease name to its matching medical specialization key.
 * Resolves variations like trailing spaces or casing differences.
 * 
 * @param {string} diseaseName - Standard disease key (e.g. "Typhoid")
 * @returns {string} The doctor specialization (e.g. "General Physician")
 */
const getSpecializationForDisease = (diseaseName) => {
  const data = getFileContent('specializationMap.json');
  if (!data) {
    return 'General Physician';
  }
  
  // 1. Direct key match lookup
  if (data[diseaseName]) {
    return data[diseaseName];
  }
  
  // 2. Trailing spaces & casing correction fallback (e.g. "Diabetes " vs "Diabetes")
  const cleanedQuery = diseaseName.trim().toLowerCase();
  for (const [key, value] of Object.entries(data)) {
    if (key.trim().toLowerCase() === cleanedQuery) {
      return value;
    }
  }
  
  return 'General Physician';
};

module.exports = {
  loadDiseaseInfo,
  getSpecializationForDisease
};
