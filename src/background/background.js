// Background script for handling OpenRouter API requests and communication with content scripts

import { translate } from '../utils/translator.js';
import { getConfig, DEFAULT_CONFIG } from '../utils/storage.js';

// Initialize extension configuration
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('translatorConfig', (result) => {
    if (!result.translatorConfig) {
      chrome.storage.sync.set({ translatorConfig: DEFAULT_CONFIG });
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translate(request.text, request.targetLang, request.model)
      .then(result => sendResponse({ success: true, translatedText: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async response
  }
  
  if (request.action === 'getConfig') {
    getConfig().then(config => sendResponse(config));
    return true; // Required for async response
  }
});
