// API utilities for OpenRouter translation

/**
 * Send a translation request to OpenRouter API
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language code
 * @param {string} model - The AI model to use
 * @param {string} apiKey - The OpenRouter API key
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, targetLanguage, model, apiKey) => {
  if (!text || !targetLanguage || !model || !apiKey) {
    throw new Error('Missing required parameters for translation');
  }

  try {
    // Create prompt for translation
    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}\n\nTranslation:`;
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/openrouter-translator', // Replace with your actual site
        'X-Title': 'OpenRouter Translator Chrome Extension'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

/**
 * Get a list of available models from OpenRouter
 * @param {string} apiKey - The OpenRouter API key
 * @returns {Promise<Array>} - List of available models
 */
export const getAvailableModels = async (apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required to fetch available models');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/openrouter-translator', 
        'X-Title': 'OpenRouter Translator Chrome Extension'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

/**
 * Format model identifiers consistently
 * @param {string} modelId - Raw model identifier
 * @returns {string} - Formatted model identifier
 */
export const formatModelId = (modelId) => {
  // Remove any whitespace and ensure proper format
  return modelId.trim();
};

/**
 * Check if the API key is valid
 * @param {string} apiKey - The OpenRouter API key to validate
 * @returns {Promise<boolean>} - Whether the key is valid
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey) return false;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/openrouter-translator',
        'X-Title': 'OpenRouter Translator Chrome Extension'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};
