const axios = require('axios');

/**
 * Generates chat or text completion from LLM (Gemini or Groq fallback).
 * 
 * @param {object[]} messages - Array of message objects, structure: [{ role: 'user' | 'assistant' | 'system', content: '...' }]
 * @param {string} [systemInstruction] - Optional system systemInstruction prompt.
 * @param {boolean} [jsonMode=false] - Whether to request structured JSON output.
 * @returns {Promise<string>} The generated completion string.
 */
const generateCompletion = async (messages, systemInstruction = '', jsonMode = false) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    // Call Gemini API
    // Model: gemini-3.8-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;
    
    // Map OpenAI/Groq standard role message format to Gemini's format:
    // role: "user" | "model"
    // contents: [{ role: "user", parts: [{ text: "..." }] }]
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // If there's a system message in the array, add it to systemInstruction
    const systemMsg = messages.find(m => m.role === 'system');
    const systemPrompt = systemInstruction || (systemMsg ? systemMsg.content : '');

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048
      }
    };

    if (systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    if (jsonMode) {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    try {
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const candidate = response.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Empty response content from Gemini API');
      }
      return text;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('⚠️ [AI Engine Notice] Gemini API daily quota limit exceeded (429 Rate Limit). Responding via Groq LLM (qwen/qwen3.8-27b)...');
      } else {
        console.log(`⚠️ [AI Engine Notice] Gemini API temporary issue (${error.response ? error.response.status : error.message}). Responding via Groq LLM (qwen/qwen3.8-27b)...`);
      }
      if (!groqKey) {
        throw error;
      }
    }
  }

  // Fallback / Default: Groq Cloud API
  if (!groqKey || groqKey === 'gsk_your_groq_api_key_here') {
    throw new Error('No valid LLM API keys configured (GEMINI_API_KEY or GROQ_API_KEY).');
  }

  // Map messages to Groq compatible structure
  const groqMessages = [];
  
  // If there is systemInstruction, prepend it
  if (systemInstruction) {
    groqMessages.push({ role: 'system', content: systemInstruction });
  }

  // Push existing messages (making sure we don't duplicate system prompt if already there)
  messages.forEach(m => {
    if (m.role === 'system' && systemInstruction) {
      // Skip system messages from array if systemInstruction is already provided
      return;
    }
    groqMessages.push({ role: m.role, content: m.content });
  });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'qwen/qwen3.8-27b',
        messages: groqMessages,
        temperature: 0.1,
        max_tokens: 1024,
        response_format: jsonMode ? { type: 'json_object' } : undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        timeout: 10000
      }
    );

    const completionText = response.data?.choices?.[0]?.message?.content;
    if (!completionText) {
      throw new Error('Empty response from Groq API');
    }
    return completionText;
  } catch (error) {
    console.error('Groq LLM call failed:', error.response?.data || error.message);
    throw new Error(`LLM Service invocation failed: ${error.message}`);
  }
};

module.exports = {
  generateCompletion
};
