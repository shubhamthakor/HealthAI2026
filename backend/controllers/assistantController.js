const aiAssistantService = require('../services/aiAssistantService');
const { AppError } = require('../moddleware/errorMiddleware');

/**
 * Controller to handle AI chatbot conversations and executions.
 * 
 * @route   POST /api/v1/assistant/chat
 * @access  Private (Patient role)
 */
const chatController = async (req, res, next) => {
  const { message, lang = 'en', chatHistory = [], city = '' } = req.body;
  const patientId = req.user._id;

  // 1. Validation
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return next(new AppError('message must be a non-empty string.', 400, 'BAD_REQUEST'));
  }

  const allowedLanguages = ['en', 'gu', 'hi'];
  if (!allowedLanguages.includes(lang)) {
    return next(new AppError("Language must be one of 'en', 'gu', or 'hi'.", 400, 'BAD_REQUEST'));
  }

  if (!Array.isArray(chatHistory)) {
    return next(new AppError("chatHistory must be an array.", 400, 'BAD_REQUEST'));
  }

  try {
    // 2. Orchestrate conversation pipeline
    const assistantResponse = await aiAssistantService.processChatMessage(
      patientId,
      message,
      lang,
      chatHistory,
      city
    );

    // 3. Return response
    res.status(200).json({
      success: true,
      data: assistantResponse
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chatController
};
