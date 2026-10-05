const intentService = require('./intentService');
const symptomExtractionService = require('./symptomExtractionService');
const nlpService = require('./nlpService');
const actionService = require('./actionService');
const responseFormatter = require('./responseFormatter');
const aiService = require('./aiService');
const diseaseLoader = require('../utils/diseaseLoader');
const Doctor = require('../models/Doctor');

/**
 * Orchestrates the conversational agent pipeline.
 * 
 * @param {string} patientId - Mongoose ID of the patient.
 * @param {string} userMessage - Raw message text input.
 * @param {string} lang - Selected language ('en', 'gu', 'hi').
 * @param {object[]} chatHistory - Previous chat messages context.
 * @param {string} [clientCity] - Patient's current city from context.
 * @returns {Promise<object>} Unified response formatted for the chat widget.
 */
const processChatMessage = async (patientId, userMessage, lang = 'en', chatHistory = [], clientCity = '') => {
  // 1. Detect Intent and Entities
  const { intent, entities } = await intentService.detectIntent(userMessage, chatHistory);

  let actionExecuted = 'none';
  let actionSuccess = true;
  let actionData = {};
  let actionError = null;

  try {
    switch (intent) {
      case 'symptom_analysis': {
        actionExecuted = 'symptom_analysis';
        // Extract symptoms using Groq NLP
        let symptoms = await symptomExtractionService.extractSymptoms(userMessage, lang);
        
        // Fallback to entities symptoms if NLP returns empty
        if ((!symptoms || symptoms.length === 0) && entities.symptoms && entities.symptoms.length > 0) {
          symptoms = entities.symptoms;
        }

        // Normalize raw symptoms & aliases against dataset vocabulary
        try {
          const vocabulary = nlpService.getVocabulary();
          symptoms = nlpService.normalizeSymptomTokens(symptoms, vocabulary);
        } catch (vocabErr) {
          console.error('Failed to load vocabulary for normalization:', vocabErr.message);
        }

        if (!symptoms || symptoms.length === 0) {
          actionSuccess = false;
          actionError = 'No recognizable clinical symptoms could be extracted from your description.';
          break;
        }

        // Trigger FastAPI disease prediction microservice
        const predictionResult = await aiService.predictDisease(symptoms);
        
        // Load localized disease details
        const diseaseInfo = diseaseLoader.loadDiseaseInfo(predictionResult.predictedDisease, lang);
        const specialization = diseaseLoader.getSpecializationForDisease(predictionResult.predictedDisease);

        // Fetch doctors in patient's city matching mapped specialization
        const query = { specialization };
        const activeCity = entities.city || clientCity;
        if (activeCity) {
          query.city = new RegExp('^' + activeCity.trim() + '$', 'i');
        }
        const recommendedDoctors = await Doctor.find(query);

        actionData = {
          prediction: {
            diseaseName: diseaseInfo.name,
            confidence: predictionResult.confidence,
            specialization,
            description: diseaseInfo.description,
            precautions: diseaseInfo.precautions
          },
          recommendedDoctors
        };
        break;
      }

      case 'doctor_search': {
        actionExecuted = 'doctor_search';
        const searchCity = entities.city || clientCity;
        const doctors = await actionService.searchDoctors({
          specialization: entities.specialization,
          city: searchCity,
          doctorName: entities.doctorName
        });
        
        actionData = { doctors };
        break;
      }

      case 'appointment_booking': {
        // If a specific doctor is specified
        if (entities.doctorName) {
          // Resolve doctor in the database
          const doctors = await actionService.searchDoctors({
            doctorName: entities.doctorName,
            city: entities.city || clientCity
          });

          if (doctors.length === 0) {
            actionExecuted = 'book_appointment';
            actionSuccess = false;
            actionError = `No doctor found matching the name "${entities.doctorName}".`;
          } else if (doctors.length > 1) {
            // Ambiguity: found multiple doctors, show doctor search results instead
            actionExecuted = 'doctor_search';
            actionData = { doctors };
            actionSuccess = true; // Still success, let user choose
          } else {
            actionExecuted = 'book_appointment';
            const selectedDoctor = doctors[0];
            
            // Resolve booking date (default to today's date if not specified)
            const todayISO = new Date().toISOString().split('T')[0];
            const bookingDateStr = entities.date || todayISO;
            
            // Resolve disease classification (default to "General Consultation" if none)
            const diseaseKey = entities.specialization || 'General Consultation';

            const appointment = await actionService.bookAppointment(patientId, {
              doctorId: selectedDoctor._id,
              appointmentDate: bookingDateStr,
              disease: diseaseKey
            });

            actionData = { appointment };
          }
        } else if (entities.specialization) {
          // If specialization is provided, search doctors in specialization first
          actionExecuted = 'doctor_search';
          const doctors = await actionService.searchDoctors({
            specialization: entities.specialization,
            city: entities.city || clientCity
          });
          actionData = { doctors };
          actionSuccess = true;
        } else {
          actionExecuted = 'book_appointment';
          actionSuccess = false;
          actionError = 'Please specify a doctor name or specialization, and a date to book an appointment.';
        }
        break;
      }

      case 'appointment_check': {
        actionExecuted = 'appointment_check';
        const Appointment = require('../models/Appointment');
        const appointments = await Appointment.find({ patientId }).populate('doctorId').sort({ appointmentDate: -1 });
        actionData = { appointments };
        actionSuccess = true;
        break;
      }

      case 'queue_tracking': {
        actionExecuted = 'queue_tracking';
        const queueStatus = await actionService.fetchQueueStatus(patientId);
        actionData = { queueStatus };
        break;
      }

      case 'appointment_cancel': {
        actionExecuted = 'appointment_cancel';
        const cancelledAppt = await actionService.cancelAppointment(patientId, 'latest');
        actionData = { appointment: cancelledAppt };
        break;
      }

      case 'leave_inquiry': {
        actionExecuted = 'leave_inquiry';
        const todayISO = new Date().toISOString().split('T')[0];
        const checkDate = entities.date || todayISO; // default check date
        
        let doctorsToCheck = [];
        if (entities.doctorName) {
          doctorsToCheck = await actionService.searchDoctors({
            doctorName: entities.doctorName,
            city: entities.city || clientCity
          });
        } else if (entities.specialization) {
          doctorsToCheck = await actionService.searchDoctors({
            specialization: entities.specialization,
            city: entities.city || clientCity
          });
        }

        const leaveStatus = [];
        for (const doc of doctorsToCheck) {
          const leave = await actionService.checkDoctorLeave(doc._id, checkDate);
          
          // Also check day availability
          const checkDateObj = new Date(checkDate);
          const dayOfWeek = checkDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
          const isWorkingDay = doc.availability.includes(dayOfWeek);

          leaveStatus.push({
            doctorName: doc.name,
            specialization: doc.specialization,
            date: checkDate,
            onLeave: !!leave,
            leaveReason: leave ? leave.leaveReason : null,
            worksOnThisDay: isWorkingDay,
            hospital: doc.hospital
          });
        }

        actionData = { leaveStatus };
        break;
      }

      case 'general_help':
      default: {
        actionExecuted = 'none';
        break;
      }
    }
  } catch (error) {
    actionSuccess = false;
    actionError = error.message;
  }

  // 3. Format final response payload
  return await responseFormatter.formatResponse({
    intent,
    userMessage,
    actionExecuted,
    actionSuccess,
    actionData,
    actionError,
    chatHistory
  });
};

module.exports = {
  processChatMessage
};
