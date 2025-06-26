// Options page script for OpenRouter Translator extension

import { getConfig, saveConfig, resetConfig, DEFAULT_CONFIG } from '../utils/storage.js';
import { validateApiKey } from '../utils/api.js';

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const defaultModelSelect = document.getElementById('default-model');
const customModelInput = document.getElementById('custom-model-input');
const customModelField = document.getElementById('custom-model');
const modelsList = document.getElementById('models-list');
const newModelInput = document.getElementById('new-model');
const addModelButton = document.getElementById('add-model');
const defaultTargetLangSelect = document.getElementById('default-target-lang');
const showButtonCheckbox = document.getElementById('show-button');
const saveButton = document.getElementById('save-options');
const resetButton = document.getElementById('reset-options');
const statusMessage = document.getElementById('status-message');

// Initialize options page
document.addEventListener('DOMContentLoaded', initializeOptions);

// Initialize the options page UI with saved settings
async function initializeOptions() {
  // Load saved configuration
  await loadSavedConfig();
  
  // Set up event listeners
  setupEventListeners();
}

// Load saved configuration from storage
async function loadSavedConfig() {
  const config = await getConfig();
  
  // Fill in form fields
  apiKeyInput.value = config.apiKey || '';
  
  // Set default model
  if (config.defaultModel) {
    // Check if it's one of our predefined models
    const predefinedModelOption = Array.from(defaultModelSelect.options).find(option => 
      option.value === config.defaultModel
    );
    
    if (predefinedModelOption) {
      defaultModelSelect.value = config.defaultModel;
    } else {
      // It's a custom model
      defaultModelSelect.value = 'custom';
      customModelInput.classList.remove('hidden');
      customModelField.value = config.defaultModel;
    }
  }
  
  // Set default target language
  if (config.defaultTargetLanguage) {
    defaultTargetLangSelect.value = config.defaultTargetLanguage;
  }
  
  // Set show button checkbox
  showButtonCheckbox.checked = config.showButton !== false;
  
  // Populate models list
  populateModelsList(config.models || DEFAULT_CONFIG.models);
}

// Set up all event listeners
function setupEventListeners() {
  // Default model selection change
  defaultModelSelect.addEventListener('change', () => {
    if (defaultModelSelect.value === 'custom') {
      customModelInput.classList.remove('hidden');
    } else {
      customModelInput.classList.add('hidden');
    }
  });
  
  // Add model button
  addModelButton.addEventListener('click', () => {
    const modelName = newModelInput.value.trim();
    if (modelName) {
      addModelToList(modelName);
      newModelInput.value = '';
    }
  });
  
  // Save settings button
  saveButton.addEventListener('click', saveOptions);
  
  // Reset button
  resetButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      await resetConfig();
      await loadSavedConfig(); // Reload UI with default values
      showStatus('Settings reset to defaults', 'success');
    }
  });
}

// Populate the models list
function populateModelsList(models) {
  modelsList.innerHTML = '';
  
  models.forEach(model => {
    addModelToList(model, false);
  });
}

// Add a model to the list
function addModelToList(model, isNew = true) {
  // Don't add duplicates
  const existingModels = Array.from(modelsList.querySelectorAll('.model-name')).map(el => el.textContent);
  if (existingModels.includes(model)) {
    showStatus(`Model "${model}" already exists`, 'error');
    return;
  }
  
  const modelItem = document.createElement('div');
  modelItem.className = 'model-item';
  
  const modelName = document.createElement('div');
  modelName.className = 'model-name';
  modelName.textContent = model;
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-model';
  deleteButton.textContent = 'Remove';
  deleteButton.addEventListener('click', () => {
    modelItem.remove();
  });
  
  modelItem.appendChild(modelName);
  modelItem.appendChild(deleteButton);
  modelsList.appendChild(modelItem);
  
  if (isNew) {
    showStatus(`Model "${model}" added`, 'success');
  }
}

// Save options to storage
async function saveOptions() {
  // Get current model list
  const models = Array.from(modelsList.querySelectorAll('.model-name')).map(el => el.textContent);
  
  // Get the default model value
  let defaultModel;
  if (defaultModelSelect.value === 'custom') {
    defaultModel = customModelField.value.trim();
    if (!defaultModel) {
      showStatus('Please enter a custom model identifier or select a predefined model', 'error');
      return;
    }
  } else {
    defaultModel = defaultModelSelect.value;
  }

  const apiKey = apiKeyInput.value.trim();
  if (apiKey && !(await validateApiKey(apiKey))) {
    showStatus('Invalid OpenRouter API Key. Please check your key.', 'error');
    return;
  }
  
  // Create config object
  const config = {
    apiKey: apiKey,
    defaultModel: defaultModel,
    defaultTargetLanguage: defaultTargetLangSelect.value,
    showButton: showButtonCheckbox.checked,
    models: models
  };
  
  // Save to Chrome storage
  await saveConfig(config);
  showStatus('Settings saved successfully!', 'success');
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
