import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "HealthAI Portal",
      "sign_out": "Sign Out",
      "unauthorized": "Unauthorized",
      "loading": "Loading secure health portal...",
      "role_tag": "Role",
      
      // Patient Dashboard Tabs
      "tab_overview": "Overview",
      "tab_ai_detection": "AI Diagnostics",
      "tab_specialist": "Specialist Registry",
      "tab_queue": "Live Queue Tracker",
      
      // Dashboard Overview Tab
      "welcome_back": "Welcome Back, {{name}}!",
      "patient_portal_subtitle": "Review your daily appointments, AI diagnostics, and queue tracker status in real time.",
      "quick_actions": "Quick Actions",
      "book_consult": "Book Consultation",
      "diagnose_symptoms": "Diagnose Symptoms",
      "view_live_queue": "View Live Queue",
      "upcoming_appointments": "Upcoming Appointments",
      "recent_predictions": "Recent AI Predictions",
      "completed_prescriptions": "Completed Prescriptions",
      "estimated_wait": "Estimated Wait",
      "mins": "mins",
      "no_upcoming_appts": "No Upcoming Appointments",
      "no_upcoming_msg": "You have no pending scheduled doctor checkups for today.",
      "no_predictions": "No Recent Predictions",
      "no_predictions_msg": "Submit symptoms in the AI diagnostics tab to get health evaluations.",
      "no_prescriptions": "No Active Prescriptions",
      "no_prescriptions_msg": "Your historical checkup records and prescription files will appear here once checked out.",
      
      // AI Disease Detection Page
      "ai_detector_title": "AI Symptom Analyzer & Disease Evaluator",
      "ai_detector_subtitle": "Submit symptoms using text or speech in English, Hindi, or Gujarati to get instant medical classification recommendations.",
      "choose_input_lang": "Choose Input Language",
      "describe_symptoms": "Describe your symptoms (e.g. fever, headache, body pain)",
      "listening_instructions": "Click the microphone button and start speaking in the selected language...",
      "run_inference": "Run AI Diagnostic Inference",
      "analyzing_symptoms": "Analyzing symptoms...",
      "speech_btn_label": "Speak Symptoms",
      "disease_prediction_results": "Inference Results",
      "predicted_condition": "Predicted Medical Condition",
      "confidence_score": "Prediction Confidence Score",
      "disease_info": "Disease Information",
      "precautions": "Recommended Precautions",
      "recommended_clinicians": "Recommended Medical Clinicians",
      "no_doctors_available": "No specialists matching this category are currently registered in your city.",
      
      // Specialist Registry Page
      "find_specialist": "Find a Medical Specialist",
      "specialist_subtitle": "Search the directory of affiliated clinicians and schedule a priority queue checkup.",
      "search_placeholder": "Search by name, specialization, or hospital...",
      "avg_duration": "Avg checkup duration: {{min}} min",
      "available_days": "Available:",
      "shifts": "Shift hours:",
      "morning": "Morning",
      "evening": "Evening",
      "book_appointment": "Book Queue Appointment",
      
      // Booking Modal
      "schedule_checkup": "Schedule Doctor Checkup",
      "select_date": "Select Appointment Date",
      "symptom_summary": "Symptom Summary",
      "estimated_queue_wait": "Estimated Queue Waiting Time",
      "estimated_queue_wait_val": "{{time}} minutes ({{count}} patients ahead)",
      "booking_submitting": "Scheduling appointment...",
      "confirm_booking_btn": "Confirm Booking Request",
      "cancel": "Cancel",
      
      // Queue Tracker Tab
      "live_queue_monitor": "Live Consultation Queue Tracker",
      "queue_subtitle": "Check your status in the queue. The dashboard updates automatically via live websocket feeds.",
      "select_appt_track": "Select Active Appointment to Track",
      "your_current_turn": "Your Checkup Status",
      "called_to_cabin": "Called to Cabin!",
      "please_proceed": "Please proceed to the doctor's consultation room immediately.",
      "position_in_queue": "Position in Queue",
      "wait_time": "Estimated Wait Time",
      "upcoming_queue_list": "Upcoming Clinic Queue Line",
      "active_patients_ahead": "{{count}} Active Patients Waiting",
      "no_active_queue": "No Active Queue Sessions",
      "no_active_queue_msg": "You do not have any active appointments scheduled for today or they have been completed.",
      "estimated_wait_mins": "{{time}} min"
    }
  },
  gu: {
    translation: {
      "app_name": "હેલ્થAI પોર્ટલ",
      "sign_out": "સાઇન આઉટ",
      "unauthorized": "અનધિકૃત",
      "loading": "સુરક્ષિત હેલ્થ પોર્ટલ લોડ થઈ રહ્યું છે...",
      "role_tag": "ભૂમિકા",
      
      // Patient Dashboard Tabs
      "tab_overview": "ઝાંખી",
      "tab_ai_detection": "AI નિદાન",
      "tab_specialist": "નિષ્ણાત રજિસ્ટ્રી",
      "tab_queue": "લાઈવ કતાર ટ્રેકર",
      
      // Dashboard Overview Tab
      "welcome_back": "સ્વાગત છે, {{name}}!",
      "patient_portal_subtitle": "રીઅલ ટાઇમમાં તમારી દૈનિક મુલાકાતો, AI નિદાન અને કતાર ટ્રેકર સ્થિતિની સમીક્ષા કરો.",
      "quick_actions": "ઝડપી ક્રિયાઓ",
      "book_consult": "મુલાકાત બુક કરો",
      "diagnose_symptoms": "લક્ષણોનું નિદાન કરો",
      "view_live_queue": "લાઈવ કતાર જુઓ",
      "upcoming_appointments": "આગામી એપોઇન્ટમેન્ટ્સ",
      "recent_predictions": "તાજેતરના AI અનુમાનો",
      "completed_prescriptions": "પૂર્ણ થયેલ પ્રિસ્ક્રિપ્શન",
      "estimated_wait": "અંદાજિત રાહ",
      "mins": "મિનિટ",
      "no_upcoming_appts": "કોઈ આગામી એપોઇન્ટમેન્ટ નથી",
      "no_upcoming_msg": "તમારી પાસે આજ માટે કોઈ બાકી ડૉક્ટર તપાસ નિર્ધારિત નથી.",
      "no_predictions": "કોઈ તાજેતરના અનુમાનો નથી",
      "no_predictions_msg": "આરોગ્ય મૂલ્યાંકન મેળવવા માટે AI નિદાન ટેબમાં લક્ષણો સબમિટ કરો.",
      "no_prescriptions": "કોઈ સક્રિય પ્રિસ્ક્રિપ્શન નથી",
      "no_prescriptions_msg": "ચેકઆઉટ થયા પછી તમારો મુલાકાત ઇતિહાસ અને પ્રિસ્ક્રિપ્શન ફાઇલો અહીં દેખાશે.",
      
      // AI Disease Detection Page
      "ai_detector_title": "AI લક્ષણ વિશ્લેષક અને રોગ મૂલ્યાંકનકાર",
      "ai_detector_subtitle": "ત્વરિત તબીબી વર્ગીકરણ ભલામણો મેળવવા માટે અંગ્રેજી, હિન્દી અથવા ગુજરાતીમાં ટેક્સ્ટ અથવા સ્પીચનો ઉપયોગ કરીને લક્ષણો સબમિટ કરો.",
      "choose_input_lang": "ઇનપુટ ભાષા પસંદ કરો",
      "describe_symptoms": "તમારા લક્ષણોનું વર્ણન કરો (દા.ત. તાવ, માથાનો દુખાવો, શરીરનો દુખાવો)",
      "listening_instructions": "માઇક્રોફોન બટન પર ક્લિક કરો અને પસંદ કરેલી ભાષામાં બોલવાનું શરૂ કરો...",
      "run_inference": "AI નિદાન ચલાવો",
      "analyzing_symptoms": "લક્ષણોનું વિશ્લેષણ થઈ રહ્યું છે...",
      "speech_btn_label": "લક્ષણો બોલો",
      "disease_prediction_results": "નિદાન પરિણામો",
      "predicted_condition": "અનુમાનિત તબીબી સ્થિતિ",
      "confidence_score": "અનુમાન આત્મવિશ્વાસ સ્કોર",
      "disease_info": "રોગની માહિતી",
      "precautions": "ભલામણ કરેલ સાવચેતીઓ",
      "recommended_clinicians": "ભલામણ કરેલ તબીબી ચિકિત્સકો",
      "no_doctors_available": "તમારા શહેરમાં આ કેટેગરી સાથે મેળ ખાતા કોઈ નિષ્ણાતો હાલમાં નોંધાયેલા નથી.",
      
      // Specialist Registry Page
      "find_specialist": "તબીબી નિષ્ણાત શોધો",
      "specialist_subtitle": "સંલગ્ન ચિકિત્સકોની ડિરેક્ટરી શોધો અને કતાર એપોઇન્ટમેન્ટ નિર્ધારિત કરો.",
      "search_placeholder": "નામ, વિશેષતા અથવા હોસ્પિટલ દ્વારા શોધો...",
      "avg_duration": "સરેરાશ તપાસ સમય: {{min}} મિનિટ",
      "available_days": "ઉપલબ્ધ દિવસો:",
      "shifts": "શિફ્ટ સમય:",
      "morning": "સવાર",
      "evening": "સાંજ",
      "book_appointment": "કતાર એપોઇન્ટમેન્ટ બુક કરો",
      
      // Booking Modal
      "schedule_checkup": "ડૉક્ટર તપાસ સુનિશ્ચિત કરો",
      "select_date": "એપોઇન્ટમેન્ટ તારીખ પસંદ કરો",
      "symptom_summary": "લક્ષણોનો સારાંશ",
      "estimated_queue_wait": "અંદાજિત કતાર રાહ જોવાનો સમય",
      "estimated_queue_wait_val": "{{time}} મિનિટ (આગળ {{count}} દર્દીઓ છે)",
      "booking_submitting": "એપોઇન્ટમેન્ટ સુનિશ્ચિત થઈ રહી છે...",
      "confirm_booking_btn": "બુકિંગ વિનંતીની પુષ્ટિ કરો",
      "cancel": "રદ કરો",
      
      // Queue Tracker Tab
      "live_queue_monitor": "લાઈવ કન્સલ્ટેશન કતાર ટ્રેકર",
      "queue_subtitle": "કતારમાં તમારી સ્થિતિ તપાસો. ડેશબોર્ડ લાઈવ વેબસોકેટ ફીડ્સ દ્વારા આપમેળે અપડેટ થાય છે.",
      "select_appt_track": "ટ્રેક કરવા માટે સક્રિય એપોઇન્ટમેન્ટ પસંદ કરો",
      "your_current_turn": "તમારી તપાસની સ્થિતિ",
      "called_to_cabin": "કેબિનમાં બોલાવવામાં આવ્યા છે!",
      "please_proceed": "કૃપા કરીને તરત જ ડૉક્ટરના કન્સલ્ટેશન રૂમમાં જાઓ.",
      "position_in_queue": "કતારમાં સ્થાન",
      "wait_time": "અંદાજિત રાહ સમય",
      "upcoming_queue_list": "આગામી ક્લિનિક કતાર લાઇન",
      "active_patients_ahead": "{{count}} સક્રિય દર્દીઓ રાહ જોઈ રહ્યા છે",
      "no_active_queue": "કોઈ સક્રિય કતાર સત્રો નથી",
      "no_active_queue_msg": "તમારી પાસે આજ માટે કોઈ સક્રિય એપોઇન્ટમેન્ટ નિર્ધારિત નથી અથવા તે પૂર્ણ થઈ ગઈ છે.",
      "estimated_wait_mins": "{{time}} મિનિટ"
    }
  },
  hi: {
    translation: {
      "app_name": "हेल्थAI पोर्टल",
      "sign_out": "साइन आउट",
      "unauthorized": "अनुधिकृत",
      "loading": "सुरक्षित स्वास्थ्य पोर्टल लोड हो रहा है...",
      "role_tag": "भूमिका",
      
      // Patient Dashboard Tabs
      "tab_overview": "सिंहावलोकन",
      "tab_ai_detection": "AI निदान",
      "tab_specialist": "विशेषज्ञ निर्देशिका",
      "tab_queue": "लाइव कतार ट्रैकर",
      
      // Dashboard Overview Tab
      "welcome_back": "स्वागत है, {{name}}!",
      "patient_portal_subtitle": "रीअल-टाइम में अपनी दैनिक नियुक्तियों, AI निदान और कतार ट्रैकर स्थिति की समीक्षा करें.",
      "quick_actions": "त्वरित कार्रवाई",
      "book_consult": "परामर्श बुक करें",
      "diagnose_symptoms": "लक्षणों का निदान करें",
      "view_live_queue": "लाइव कतार देखें",
      "upcoming_appointments": "आगामी नियुक्तियां",
      "recent_predictions": "हालिया AI अनुमान",
      "completed_prescriptions": "पूर्ण किए गए नुस्खे",
      "estimated_wait": "अनुमानित प्रतीक्षा",
      "mins": "मिनट",
      "no_upcoming_appts": "कोई आगामी नियुक्ति नहीं",
      "no_upcoming_msg": "आज के लिए आपकी कोई निर्धारित डॉक्टर जांच लंबित नहीं है.",
      "no_predictions": "कोई हालिया अनुमान नहीं",
      "no_predictions_msg": "स्वास्थ्य मूल्यांकन प्राप्त करने के लिए AI निदान टैब में लक्षण सबमिट करें.",
      "no_prescriptions": "कोई सक्रिय नुस्खा नहीं",
      "no_prescriptions_msg": "चेकआउट होने के बाद आपका यात्रा इतिहास और नुस्खे की फाइलें यहां दिखाई देंगी.",
      
      // AI Disease Detection Page
      "ai_detector_title": "AI लक्षण विश्लेषक और रोग मूल्यांकनकर्ता",
      "ai_detector_subtitle": "त्वरित चिकित्सा वर्गीकरण अनुशंसाएं प्राप्त करने के लिए अंग्रेजी, हिंदी या गुजराती में टेक्स्ट या भाषण का उपयोग करके लक्षण सबमिट करें.",
      "choose_input_lang": "इनपुट भाषा चुनें",
      "describe_symptoms": "अपने लक्षणों का वर्णन करें (जैसे बुखार, सिरदर्द, शरीर में दर्द)",
      "listening_instructions": "माइक्रोफ़ोन बटन पर क्लिक करें और चयनित भाषा में बोलना शुरू करें...",
      "run_inference": "AI निदान चलाएं",
      "analyzing_symptoms": "लक्षणों का विश्लेषण किया जा रहा है...",
      "speech_btn_label": "लक्षण बोलें",
      "disease_prediction_results": "निदान के परिणाम",
      "predicted_condition": "अनुमानित चिकित्सा स्थिति",
      "confidence_score": "अनुमान आत्मविश्वास स्कोर",
      "disease_info": "रोग की जानकारी",
      "precautions": "अनुशंसित सावधानियां",
      "recommended_clinicians": "अनुशंसित चिकित्सा चिकित्सक",
      "no_doctors_available": "आपके शहर में इस श्रेणी से मेल खाने वाले कोई भी विशेषज्ञ वर्तमान में पंजीकृत नहीं हैं.",
      
      // Specialist Registry Page
      "find_specialist": "चिकित्सा विशेषज्ञ खोजें",
      "specialist_subtitle": "संबद्ध चिकित्सकों की निर्देशिका खोजें और कतार नियुक्ति निर्धारित करें.",
      "search_placeholder": "नाम, विशेषता या अस्पताल द्वारा खोजें...",
      "avg_duration": "औसत जांच समय: {{min}} मिनट",
      "available_days": "उपलब्ध दिन:",
      "shifts": "शिफ्ट का समय:",
      "morning": "सुबह",
      "evening": "शाम",
      "book_appointment": "कतार नियुक्ति बुक करें",
      
      // Booking Modal
      "schedule_checkup": "डॉक्टर जांच निर्धारित करें",
      "select_date": "नियुक्ति की तिथि चुनें",
      "symptom_summary": "लक्षणों का सारांश",
      "estimated_queue_wait": "अनुमानित कतार प्रतीक्षा समय",
      "estimated_queue_wait_val": "{{time}} मिनट (आगे {{count}} मरीज हैं)",
      "booking_submitting": "नियुक्ति निर्धारित की जा रही है...",
      "confirm_booking_btn": "बुकिंग अनुरोध की पुष्टि करें",
      "cancel": "रद्द करें",
      
      // Queue Tracker Tab
      "live_queue_monitor": "लाइव परामर्श कतार ट्रैकर",
      "queue_subtitle": "कतार में अपनी स्थिति की जांच करें. डैशबोर्ड लाइव वेबसॉकेट फ़ीड के माध्यम से स्वचालित रूप से अपडेट होता है.",
      "select_appt_track": "ट्रैक करने के लिए सक्रिय नियुक्ति चुनें",
      "your_current_turn": "आपकी जांच की स्थिति",
      "called_to_cabin": "केबिन में बुलाया गया है!",
      "please_proceed": "कृपया तुरंत डॉक्टर के परामर्श कक्ष में जाएं.",
      "position_in_queue": "कतार में स्थान",
      "wait_time": "अनुमानित प्रतीक्षा समय",
      "upcoming_queue_list": "आगामी क्लिनिक कतार लाइन",
      "active_patients_ahead": "{{count}} सक्रिय मरीज प्रतीक्षा कर रहे हैं",
      "no_active_queue": "कोई सक्रिय कतार सत्र नहीं",
      "no_active_queue_msg": "आपके पास आज के लिए कोई सक्रिय नियुक्ति निर्धारित नहीं है या वे पूर्ण हो चुकी हैं.",
      "estimated_wait_mins": "{{time}} मिनट"
    }
  }
};

// Retrieve default from localStorage if previously configured
const savedLang = localStorage.getItem('health_portal_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
