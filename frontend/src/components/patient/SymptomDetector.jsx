import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';

// Top common clinical symptoms from vocabulary
const COMMON_SYMPTOMS = [
  "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", 
  "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", 
  "vomiting", "burning_micturition", "spotting_urination", "fatigue", "weight_gain", 
  "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness", 
  "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever", 
  "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache", 
  "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes", 
  "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine", 
  "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach", 
  "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm", 
  "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion", 
  "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements", 
  "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness", 
  "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", 
  "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", 
  "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech"
];

const SymptomDetector = ({ onBookDoctor }) => {
  const { t, i18n } = useTranslation();
  const [method, setMethod] = useState('nlp'); // 'nlp' or 'chips'
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [city, setCity] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync selected input language with global app language switcher
  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  // Manual Chips state
  const [chips, setChips] = useState([]);
  const [chipInput, setChipInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Prediction Result state
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);

  // Handle autocomplete suggestions for chips
  useEffect(() => {
    if (chipInput.trim() === '') {
      setSuggestions([]);
      return;
    }
    const query = chipInput.toLowerCase().replace(/\s+/g, '_');
    const filtered = COMMON_SYMPTOMS.filter(
      (sym) => sym.includes(query) && !chips.includes(sym)
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [chipInput, chips]);

  // Initialize webkitSpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsRecording(true);
        toast.success('Microphone listening...');
      };
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        toast.error('Voice input failed. Please speak clearly or type.');
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Web Speech API is not supported in this browser. Please type.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Configure language codes
      let recognitionLang = 'en-US';
      if (selectedLanguage === 'gu') recognitionLang = 'gu-IN';
      if (selectedLanguage === 'hi') recognitionLang = 'hi-IN';

      recognitionRef.current.lang = recognitionLang;
      recognitionRef.current.start();
    }
  };

  // Submit NLP analysis (/ai/detect)
  const handleNlpSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error('Please describe your symptoms first.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/detect', {
        inputText: inputText.trim(),
        lang: selectedLanguage,
        city: city.trim() || undefined
      });

      if (response.data && response.data.success) {
        setResult(response.data.data);
        toast.success('Symptoms analyzed successfully!');
      }
    } catch (err) {
      console.error('NLP symptoms detection error:', err);
      const msg = err.response?.data?.error?.message || 'AI analysis failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Add chip
  const addChip = (symptom) => {
    if (symptom && !chips.includes(symptom)) {
      setChips([...chips, symptom]);
      setChipInput('');
      setSuggestions([]);
    }
  };

  // Remove chip
  const removeChip = (indexToRemove) => {
    setChips(chips.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit manual chips prediction (/ai/predict)
  const handleChipsSubmit = async (e) => {
    e.preventDefault();
    if (chips.length === 0) {
      toast.error('Please add at least one symptom chip.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/predict', {
        symptoms: chips,
        lang: selectedLanguage,
        city: city.trim() || undefined
      });

      if (response.data && response.data.success) {
        const payload = response.data.data;
        // Normalize response keys to match layout structure
        setResult({
          extractedSymptoms: chips,
          prediction: {
            diseaseName: payload.predictedDisease,
            description: payload.description,
            precautions: payload.precautions
          },
          confidence: payload.confidence,
          recommendedSpecialization: payload.specialization,
          recommendedDoctors: payload.recommendedDoctors
        });
        toast.success('Disease classified successfully!');
      }
    } catch (err) {
      console.error('Manual chips disease prediction error:', err);
      const msg = err.response?.data?.error?.message || 'Disease prediction failed. Please review symptom spelling.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getCleanLabel = (str) => {
    return str.replace(/_/g, ' ');
  };

  return (
    <div className="symptom-detector-container">
      <div className="tab-toggle-container">
        <button 
          className={`tab-toggle-btn ${method === 'nlp' ? 'active' : ''}`}
          onClick={() => { setMethod('nlp'); setResult(null); }}
        >
          📝 {t('tab_ai_detection')}
        </button>
        <button 
          className={`tab-toggle-btn ${method === 'chips' ? 'active' : ''}`}
          onClick={() => { setMethod('chips'); setResult(null); }}
        >
          🏷️ {t('tab_ai_detection')} (Chips)
        </button>
      </div>

      <div className="detector-workspace">
        <Card className="config-form-card" style={{ padding: '28px' }}>
          <div className="config-row">
            {/* Language Selector */}
            <FormField
              label={t('choose_input_lang')}
              id="selectedLanguage"
              type="select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="config-field"
              options={[
                { value: 'en', label: 'English (EN)' },
                { value: 'hi', label: 'Hindi (हिन्दी)' },
                { value: 'gu', label: 'Gujarati (ગુજરાતી)' }
              ]}
              style={{ marginBottom: 0 }}
            />

            {/* City Filter */}
            <FormField
              label="Location / City"
              id="city"
              type="text"
              placeholder="e.g. Ahmedabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="config-field"
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* METHOD 1: NLP Text/Voice Description */}
          {method === 'nlp' && (
            <form onSubmit={handleNlpSubmit}>
              <div className="textarea-wrapper" style={{ position: 'relative' }}>
                <FormField
                  label={t('describe_symptoms')}
                  id="nlpInput"
                  type="textarea"
                  rows={4}
                  placeholder={
                    selectedLanguage === 'gu' 
                      ? 'દા.ત. મને કાલે રાતથી તાવ આવે છે અને માથું દુખે છે.' 
                      : selectedLanguage === 'hi' 
                      ? 'जैसे. मुझे कल रात से बुखार आ रहा है और सिर में दर्द है।' 
                      : 'e.g. I have been suffering from extreme fever and joint pain since last night.'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  required
                  style={{ paddingRight: '100px', minHeight: '120px' }}
                />
                <button
                  type="button"
                  className={`mic-record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={loading}
                  title="Speak symptoms"
                  style={{ zIndex: 5 }}
                >
                  {isRecording ? '🎤 Pulse' : t('speech_btn_label')}
                </button>
              </div>

              <Button type="submit" variant="primary" isLoading={loading}>
                🧠 {t('run_inference')}
              </Button>
            </form>
          )}

          {/* METHOD 2: Select Symptom Chips */}
          {method === 'chips' && (
            <form onSubmit={handleChipsSubmit}>
              <div className="form-group autocomplete-wrapper" style={{ position: 'relative' }}>
                <FormField
                  label={t('search_placeholder')}
                  id="chipInput"
                  type="text"
                  placeholder="Type symptom (e.g. fever, headache)"
                  value={chipInput}
                  onChange={(e) => setChipInput(e.target.value)}
                  disabled={loading}
                  style={{ marginBottom: 0 }}
                />
                
                {suggestions.length > 0 && (
                  <div className="autocomplete-suggestions">
                    {suggestions.map((sug) => (
                      <div 
                        key={sug} 
                        className="suggestion-item" 
                        onClick={() => addChip(sug)}
                      >
                        {getCleanLabel(sug)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Chips */}
              <div className="chips-container" style={{ margin: '16px 0' }}>
                {chips.length === 0 ? (
                  <p className="no-chips-placeholder">No symptom tags added.</p>
                ) : (
                  chips.map((c, idx) => (
                    <span key={c} className="symptom-chip">
                      {getCleanLabel(c)}
                      <button type="button" onClick={() => removeChip(idx)}>&times;</button>
                    </span>
                  ))
                )}
              </div>

              <Button type="submit" variant="primary" disabled={loading || chips.length === 0} isLoading={loading}>
                🧠 {t('run_inference')}
              </Button>
            </form>
          )}
        </Card>

        {/* LOADING INDICATOR */}
        {loading && (
          <Card style={{ padding: '40px 20px', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="lg" label={t('analyzing_symptoms')} />
          </Card>
        )}

        {/* ANALYSIS RESULTS PANEL */}
        {result && (
          <div className="results-panel fade-in">
            <Card className="result-overview-card" style={{ padding: '28px' }}>
              <div className="result-overview-header">
                <div>
                  <span className="specialization-tag">{result.recommendedSpecialization}</span>
                  <h2>{t('predicted_condition')}: {result.prediction.diseaseName}</h2>
                </div>
                <div className="confidence-score-container">
                  <div className="radial-score">
                    <span className="score-pct">{Math.round(result.confidence * 100)}%</span>
                    <span className="score-lbl">{t('confidence_score')}</span>
                  </div>
                </div>
              </div>

              <p className="disease-description">{result.prediction.description}</p>

              <div className="extracted-symptoms-chips">
                <h4>{t('symptom_summary')}:</h4>
                <div className="chips-container">
                  {result.extractedSymptoms.map((s) => (
                    <span key={s} className="symptom-chip-inactive">
                      {getCleanLabel(s)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="precautions-section">
                <h4>{t('precautions')}:</h4>
                <ul>
                  {result.prediction.precautions.map((p, idx) => (
                    <li key={idx}>✅ {p}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* RECOMMENDED DOCTORS */}
            <div className="doctors-recommendation-section">
              <h3>{t('recommended_clinicians')} ({result.recommendedSpecialization})</h3>
              {result.recommendedDoctors.length === 0 ? (
                <EmptyState
                  icon="👩‍⚕️"
                  title="No Doctors Available"
                  message={t('no_doctors_available')}
                />
              ) : (
                <div className="recommended-doctors-grid">
                  {result.recommendedDoctors.map((doc) => (
                    <Card key={doc._id} className="mini-doctor-card" hoverEffect={true} style={{ padding: '20px' }}>
                      <div className="card-header-meta">
                        <span className="badge-available">Available</span>
                        <span className="doctor-city">📍 {doc.city}</span>
                      </div>
                      <h4>Dr. {doc.name}</h4>
                      <p className="doctor-hospital">🏢 {doc.hospital}</p>
                      <div className="doctor-shift-meta">
                        <span>🕒 Consultation: {doc.consultationDuration || 15} mins</span>
                        <span>🗓️ Timings: {doc.timings?.morningShift?.startTime} - {doc.timings?.eveningShift?.endTime}</span>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => onBookDoctor(doc, result.prediction.diseaseName)}
                      >
                        {t('book_appointment')}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomDetector;
