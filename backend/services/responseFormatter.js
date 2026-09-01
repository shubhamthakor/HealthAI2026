const llmService = require('./llmService');

/**
 * Formats a conversational reply from the LLM based on intent and action data,
 * and packages it with structured data for the frontend.
 * 
 * @param {object} params
 * @param {string} params.intent - Detected intent.
 * @param {string} params.userMessage - Original user message.
 * @param {string} params.actionExecuted - The name of the action executed.
 * @param {boolean} params.actionSuccess - Whether the action succeeded.
 * @param {object} [params.actionData] - Raw result data from action execution.
 * @param {string} [params.actionError] - Error message if action failed.
 * @param {object[]} [params.chatHistory] - Previous conversation history.
 * @returns {Promise<{intent: string, reply: string, actionExecuted: string, actionSuccess: boolean, actionError: string|null, structuredData: object}>}
 */
const formatResponse = async ({
  intent,
  userMessage,
  actionExecuted,
  actionSuccess,
  actionData = {},
  actionError = null,
  chatHistory = []
}) => {
  let reply = '';
  const structuredData = {};

  // Build specific structuredData based on the action
  if (actionExecuted === 'doctor_search' && actionSuccess) {
    structuredData.doctors = actionData.doctors || [];
  } else if (actionExecuted === 'book_appointment') {
    if (actionSuccess) {
      structuredData.appointment = actionData.appointment;
    }
  } else if (actionExecuted === 'appointment_cancel') {
    if (actionSuccess) {
      structuredData.appointment = actionData.appointment;
    }
  } else if (actionExecuted === 'queue_tracking' && actionSuccess) {
    structuredData.queueStatus = actionData.queueStatus || [];
  } else if (actionExecuted === 'symptom_analysis' && actionSuccess) {
    structuredData.diseasePrediction = actionData.prediction;
    structuredData.doctors = actionData.recommendedDoctors || [];
  }

  // Ask LLM to generate a natural, professional response in the tone of HealthAI
  // Provide it with the context of the user message, what action was taken, and the results of that action.
  const systemInstruction = `You are the conversational interface of HealthAI, a smart healthcare portal.
Your task is to generate a warm, friendly, empathetic, and polite response based on the action executed and its outcomes.

Important Safety Guidelines:
- Avoid giving absolute medical diagnoses.
- Never prescribe specific medicines.
- Always include a disclaimer recommending consulting a healthcare professional when discussing symptoms or diseases.
- Keep the response short, clear, and focused.

Context:
- User Input: "${userMessage}"
- Intent: "${intent}"
- Action Executed: "${actionExecuted}"
- Action Status: ${actionSuccess ? 'SUCCESS' : 'FAILED'}
- Action Error: ${actionError ? `"${actionError}"` : 'None'}
- Structured Result: ${JSON.stringify(structuredData)}

Rules:
- If the user greets you (e.g., "hello", "hi") or asks who you are / what you can do, introduce yourself warmly as the HealthAI Care Agent. Politely list your key capabilities (symptom analysis, doctor recommendations, appointment booking, and real-time queue tracking) and ask how you can help them.
- If an appointment was booked, highlight the doctor's name, booking date, queue number, and estimated wait time.
- If doctors were found, briefly mention that you have found them and they are displayed below.
- If queue status was tracked, tell the user their position and remaining wait time.
- If symptom analysis was performed, give a brief overview of the predicted disease and precautions, followed by the safety disclaimer.
- If an action failed, explain the issue politely (e.g. "Doctor is on leave", "Queue is full") and suggest an alternative.
- Respond in the language of the user's message (e.g. English, Gujarati, or Hindi). If they greet you in Gujarati, reply in Gujarati.
- Be friendly and conversational, not dry or overly robotic.`;

  const messages = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  // Push actual user message to complete the conversation context
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    reply = await llmService.generateCompletion(messages, systemInstruction, false);
  } catch (error) {
    console.error('Failed to generate conversational reply via LLM:', error.message);
    // Fallback static replies if LLM fails
    if (intent === 'appointment_booking') {
      if (actionSuccess) {
        const appt = structuredData.appointment;
        reply = `Your appointment has been successfully booked! Date: ${new Date(appt.appointmentDate).toDateString()}, Queue Number: ${appt.queueNumber}, Estimated Wait Time: ${appt.estimatedWaitTime} minutes. Please consult a healthcare professional for proper diagnosis.`;
      } else {
        reply = `I'm sorry, I could not complete your booking. Reason: ${actionError || 'Unknown error'}.`;
      }
    } else if (intent === 'doctor_search') {
      if (actionSuccess && structuredData.doctors.length > 0) {
        reply = `I found ${structuredData.doctors.length} doctors matching your search. They are listed below.`;
      } else {
        reply = `No doctors were found matching your criteria.`;
      }
    } else if (intent === 'queue_tracking') {
      if (actionSuccess && structuredData.queueStatus.length > 0) {
        const q = structuredData.queueStatus[0];
        reply = `You are currently at position ${q.position} in Dr. ${q.doctorName}'s queue. Your estimated wait time is ${q.estimatedWaitTime} minutes.`;
      } else {
        reply = `You do not have any active appointments in the queue.`;
      }
    } else {
      reply = `Hello! How can I assist you with your health query, doctor search, or appointment bookings today?`;
    }
  }

  return {
    intent,
    reply: reply.trim(),
    actionExecuted,
    actionSuccess,
    actionError,
    structuredData
  };
};

module.exports = {
  formatResponse
};
