// Popup script for the OpenRouter Translator extension

import { getConfig, saveConfig } from '../utils/storage.js';

// DOM elements
const modelSelect = document.getElementById('model-select');
const customModelInput = document.getElementById('custom-model-input');
const customModelField = document.getElementById('custom-model');
const languageButtons = document.querySelectorAll('.lang-btn');
const defaultLanguageSelect = document.getElementById('default-language');
const saveSettingsButton = document.getElementById('save-settings');
const translatePageButton = document.getElementById('translate-page');
const optionsLink = document.getElementById('options-link');
const statusMessage = document.getElementById('status-message');

// Store current active tab
let activeTab = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', initializePopup);

// Initialize the popup UI with saved settings
async function initializePopup() {
  // Get the current active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tabs[0];
  
  // Load saved configuration
  await loadSavedConfig();
  
  // Set up event listeners
  setupEventListeners();
}

// Load saved configuration from storage
async function loadSavedConfig() {
  const config = await getConfig();
  
  // Set model selection
  if (config.defaultModel) {
    // Check if it's one of our predefined models
    const predefinedModelOption = Array.from(modelSelect.options).find(option => 
      option.value === config.defaultModel
    );
    
    if (predefinedModelOption) {
      modelSelect.value = config.defaultModel;
    } else {
      // It's a custom model
      modelSelect.value = 'custom';
      customModelInput.classList.remove('hidden');
      customModelField.value = config.defaultModel;
    }
  }
  
  // Set default language
  if (config.defaultTargetLanguage) {
    defaultLanguageSelect.value = config.defaultTargetLanguage;
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Model selection change
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === 'custom') {
      customModelInput.classList.remove('hidden');
    } else {
      customModelInput.classList.add('hidden');
    }
  });
  
  // Language quick buttons
  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const language = button.getAttribute('data-lang');
      translatePage(language);
    });
  });
  
  // Save settings button
  saveSettingsButton.addEventListener('click', saveSettings);
  
  // Translate page button
  translatePageButton.addEventListener('click', () => {
    const language = defaultLanguageSelect.value;
    translatePage(language);
  });
  
  // Options link
  optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

// Save settings to storage
async function saveSettings() {
  const config = await getConfig();
  const updatedConfig = { ...config };
  
  // Update model
  if (modelSelect.value === 'custom') {
    updatedConfig.defaultModel = customModelField.value.trim();
  } else {
    updatedConfig.defaultModel = modelSelect.value;
  }
  
  // Update default language
  updatedConfig.defaultTargetLanguage = defaultLanguageSelect.value;
  
  // Save updated config
  await saveConfig(updatedConfig);
  showStatus('Settings saved successfully!', 'success');
}

// Translate the current page
function translatePage(targetLanguage) {
  if (!activeTab) return;
  
  // Get the current model
  let model;
  if (modelSelect.value === 'custom') {
    model = customModelField.value.trim();
  } else {
    model = modelSelect.value;
  }
  
  // Show status
  showStatus('Translating page...', 'success');
  
  // Send message to content script
  chrome.tabs.sendMessage(
    activeTab.id, 
    { 
      action: 'translatePage', 
      targetLang: targetLanguage,
      model: model
    },
    (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded yet
        injectContentScript(targetLanguage, model);
      }
    }
  );
}

// Inject content script if not already loaded
function injectContentScript(targetLanguage, model) {
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['src/content/content.js']
  }, () => {
    // Wait a moment for the script to initialize
    setTimeout(() => {
      chrome.tabs.sendMessage(
        activeTab.id, 
        { 
          action: 'translatePage', 
          targetLang: targetLanguage,
          model: model
        }
      );
    }, 100);
  });
}

// Show status message
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = type; // Apply the correct CSS class
  statusMessage.classList.remove('hidden');
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 3000);
}
