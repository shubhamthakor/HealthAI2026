const llmService = require('./llmService');

/**
 * Detects the user's intent and extracts entities from their message and chat history.
 * 
 * @param {string} userMessage - User's latest input message.
 * @param {object[]} chatHistory - Previous chat history messages.
 * @returns {Promise<{intent: string, confidence: number, entities: object}>}
 */
const detectIntent = async (userMessage, chatHistory = []) => {
  const currentDate = '2026-07-05'; // Anchor to prompt's context date

  const systemInstruction = `You are the intent detection and entity extraction engine of HealthAI.
Analyze the user's latest message (taking the conversation history into account if relevant) and classify it into exactly one of these intents:
- "symptom_analysis": User describes symptoms, pain, weakness, sickness, or asks for a disease prediction from symptoms.
- "appointment_booking": User explicitly wants to book or schedule a medical appointment or consult a doctor.
- "doctor_search": User wants to find or search for doctors, specialized clinics, hospitals, or doctor availability by region/specialization.
- "queue_tracking": User asks about their queue number, active position, remaining wait times, or active queues.
- "appointment_cancel": User wants to cancel their appointment.
- "leave_inquiry": User checks if a doctor is on leave, asks if a clinic is closed, or queries a specific doctor's leaves.
- "general_help": Greetings (hi, hello), general system capabilities, or small talk.

Extract the following entities if present (otherwise return null or empty array):
- "specialization": Doctor's medical field (e.g., "General Physician", "Dermatologist", "Cardiologist", "Neurologist", "Pediatrician"). Map common words (like skin doctor -> Dermatologist, heart doctor -> Cardiologist, brain doctor -> Neurologist, child doctor -> Pediatrician, regular doctor -> General Physician).
- "city": The location/city mentioned (e.g., "Anand", "Surat", "Ahmedabad", "Baroda"). Capitalize properly.
- "doctorName": Name of the doctor if mentioned (e.g., "Devendra Shah", "Kavita Desai"). Omit professional titles like "Dr." or "Dr".
- "date": Targeted date for appointment or leave checking. Resolve relative terms (e.g., "today" -> "${currentDate}", "tomorrow" -> "2026-07-06", "day after tomorrow" -> "2026-07-07", "next monday" -> "2026-07-06", "next tuesday" -> "2026-07-07", etc.) into a strict "YYYY-MM-DD" format.
- "symptoms": List of symptoms described in the text (e.g. ["fever", "headache"]).

You must output ONLY a valid JSON object matching the schema below. Do not include markdown wraps (like \`\`\`json), comments, preambles, or postscripts.

Response JSON Schema:
{
  "intent": "detected_intent_here",
  "confidence": 0.00 to 1.00,
  "entities": {
    "specialization": "string or null",
    "city": "string or null",
    "doctorName": "string or null",
    "date": "string (YYYY-MM-DD) or null",
    "symptoms": ["string", "string"]
  }
}`;

  // Map chat history
  const formattedMessages = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  // Push user message
  formattedMessages.push({
    role: 'user',
    content: `User Input: "${userMessage}"\nSystem Reference Date: ${currentDate}`
  });

  try {
    const rawResult = await llmService.generateCompletion(formattedMessages, systemInstruction, true);
    
    // Parse the result safely
    let parsedResult;
    try {
      // Clean up markdown codeblock formatting if returned despite prompt restrictions
      let cleanJson = rawResult.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse intent JSON, raw result was:', rawResult);
      // Fallback intent
      return {
        intent: 'general_help',
        confidence: 0.5,
        entities: { specialization: null, city: null, doctorName: null, date: null, symptoms: [] }
      };
    }

    return {
      intent: parsedResult.intent || 'general_help',
      confidence: parsedResult.confidence || 0.9,
      entities: parsedResult.entities || { specialization: null, city: null, doctorName: null, date: null, symptoms: [] }
    };
  } catch (error) {
    console.error('Intent detection LLM call failed:', error.message);
    return {
      intent: 'general_help',
      confidence: 0.5,
      entities: { specialization: null, city: null, doctorName: null, date: null, symptoms: [] }
    };
  }
};

module.exports = {
  detectIntent
};
