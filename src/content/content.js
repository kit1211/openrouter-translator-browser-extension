// Content script to be injected into web pages for translation functionality

import { getAllTextNodes, batchTexts } from '../utils/translator.js';
import { getConfig } from '../utils/storage.js';

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translatePage') {
    translatePage(request.targetLang, request.model);
  }
});

// Create and inject the translation UI button
function createTranslationButton() {
  // Remove any existing button first
  const existingButton = document.getElementById('openrouter-translator-button');
  if (existingButton) {
    existingButton.remove();
  }

  // Create the floating action button
  const button = document.createElement('div');
  button.id = 'openrouter-translator-button';
  button.innerHTML = '🌐';
  button.title = 'Translate this page';
  
  // Style the button
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#4285f4';
  button.style.color = 'white';
  button.style.fontSize = '24px';
  button.style.display = 'flex';
  button.style.justifyContent = 'center';
  button.style.alignItems = 'center';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  button.style.zIndex = '9999';
  button.style.transition = 'transform 0.3s ease';

  // Add hover effect
  button.onmouseover = () => {
    button.style.transform = 'scale(1.1)';
  };
  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
  };

  // Add click event to translate the page
  button.onclick = async () => {
    const config = await getConfig();
    translatePage(config.defaultTargetLanguage, config.defaultModel);
  };

  // Append to the document
  document.body.appendChild(button);
}

// Create and show the translation status overlay
function showTranslationStatus(message, isError = false) {
  // Remove any existing status element
  const existingStatus = document.getElementById('openrouter-translation-status');
  if (existingStatus) {
    existingStatus.remove();
  }

  // Create the status element
  const status = document.createElement('div');
  status.id = 'openrouter-translation-status';
  status.textContent = message;
  
  // Style the status
  status.style.position = 'fixed';
  status.style.top = '20px';
  status.style.right = '20px';
  status.style.padding = '10px 20px';
  status.style.borderRadius = '4px';
  status.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
  status.style.color = 'white';
  status.style.fontSize = '14px';
  status.style.zIndex = '10000';
  status.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  
  // Append to the document
  document.body.appendChild(status);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.getElementById('openrouter-translation-status')) {
      document.getElementById('openrouter-translation-status').remove();
    }
  }, 5000);
}

// Main function to translate the page
function translatePage(targetLanguage, model) {
  showTranslationStatus('Translation in progress...');
  
  // Get all text nodes from the page
  const textNodes = getAllTextNodes(document.body);
  const originalTexts = textNodes.map(node => node.textContent);
  
  // Batch texts to avoid excessively large API requests
  const textBatches = batchTexts(originalTexts, 4000); // Limit batch size to ~4000 chars
  
  // Keep track of translation progress
  let completedBatches = 0;
  
  // Process each batch
  textBatches.forEach((batch, batchIndex) => {
    // Combine texts in batch with a unique separator
    const separator = '\n---SEPARATOR---\n';
    const combinedText = batch.join(separator);
    
    // Send translation request to background script
    chrome.runtime.sendMessage({
      action: 'translate',
      text: combinedText,
      targetLang: targetLanguage,
      model: model
    }, (response) => {
      completedBatches++;
      
      if (response.success) {
        // Split the translated text back into individual pieces
        const translatedTexts = response.translatedText.split(separator);
        
        // Calculate the index offset for the current batch
        const startIndex = batchIndex * textBatches[0].length;
        
        // Apply translations to the corresponding text nodes
        translatedTexts.forEach((translatedText, i) => {
          const nodeIndex = startIndex + i;
          if (nodeIndex < textNodes.length) {
            textNodes[nodeIndex].textContent = translatedText;
          }
        });
        
        // Update status when all batches are completed
        if (completedBatches === textBatches.length) {
          showTranslationStatus('Translation completed!');
        }
      } else {
        showTranslationStatus(`Translation error: ${response.error}`, true);
      }
    });
  });
}

// Initialize when the content script loads
document.addEventListener('DOMContentLoaded', async () => {
  const config = await getConfig();
  if (config.showButton) {
    setTimeout(createTranslationButton, 1000); // Slight delay to ensure the page is loaded
  }
});

// Also inject button when page is fully loaded
window.addEventListener('load', async () => {
  const config = await getConfig();
  if (config.showButton) {
    createTranslationButton();
  }
});
