// Utility functions for working with Chrome storage

// Default configuration values
export const DEFAULT_CONFIG = {
  apiKey: '',
  defaultModel: 'openai/gpt-4o-mini',
  defaultTargetLanguage: 'th',
  showButton: true,
  models: [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'google/gemini-2.5-flash-preview:thinking'
  ]
};

/**
 * Get the current extension configuration
 * @returns {Promise<Object>} The current configuration
 */
export const getConfig = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('translatorConfig', (result) => {
      resolve(result.translatorConfig || DEFAULT_CONFIG);
    });
  });
};

/**
 * Save configuration to Chrome storage
 * @param {Object} config - The configuration to save
 * @returns {Promise<void>}
 */
export const saveConfig = (config) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ translatorConfig: config }, resolve);
  });
};

/**
 * Reset configuration to defaults
 * @returns {Promise<void>}
 */
export const resetConfig = () => {
  return saveConfig(DEFAULT_CONFIG);
};

/**
 * Update specific configuration properties
 * @param {Object} updates - Object containing properties to update
 * @returns {Promise<Object>} The updated configuration
 */
export const updateConfig = async (updates) => {
  const currentConfig = await getConfig();
  const updatedConfig = { ...currentConfig, ...updates };
  await saveConfig(updatedConfig);
  return updatedConfig;
};
