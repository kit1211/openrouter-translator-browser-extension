// Core translation logic using OpenRouter API and Chrome storage

import { translateText as callTranslateApi } from './api.js';
import { getConfig } from './storage.js';

/**
 * Translates a given text using the configured OpenRouter model.
 * @param {string} text - The text to be translated.
 * @param {string} targetLanguage - The language to translate the text into (e.g., 'th', 'en').
 * @param {string} [modelOverride] - Optional: A specific model to use for this translation, overrides default.
 * @returns {Promise<string>} The translated text.
 * @throws {Error} If API key is not configured or translation fails.
 */
export const translate = async (text, targetLanguage, modelOverride) => {
  const config = await getConfig();
  const apiKey = config.apiKey;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please set it in the extension options.');
  }

  const modelToUse = modelOverride || config.defaultModel;

  try {
    const translatedContent = await callTranslateApi(text, targetLanguage, modelToUse, apiKey);
    return translatedContent;
  } catch (error) {
    console.error('Error during translation:', error);
    throw error;
  }
};

/**
 * Batches an array of texts into chunks to avoid excessively large API requests.
 * @param {string[]} texts - An array of text strings to batch.
 * @param {number} maxBatchSize - The maximum character length for each batch.
 * @returns {string[][]} An array of text batches.
 */
export const batchTexts = (texts, maxBatchSize) => {
  const batches = [];
  let currentBatch = [];
  let currentSize = 0;
  
  for (const text of texts) {
    // If adding the current text exceeds maxBatchSize, start a new batch
    // Also, ensure we don't create empty batches if a single text is larger than maxBatchSize
    if (currentSize + text.length > maxBatchSize && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentSize = 0;
    }
    
    currentBatch.push(text);
    currentSize += text.length;
  }
  
  // Add any remaining texts as the last batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  
  return batches;
};

/**
 * Extracts all visible text nodes from a given DOM element.
 * Skips script, style, and noscript tags.
 * @param {HTMLElement} element - The DOM element to traverse.
 * @returns {Text[]} An array of text nodes.
 */
export const getAllTextNodes = (element) => {
  if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'NOSCRIPT') {
    return [];
  }
  
  let textNodes = [];
  
  // Add direct text nodes if they contain non-whitespace text
  for (let child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
      textNodes.push(child);
    }
  }
  
  // Recursively process child elements
  for (let child of element.children) {
    textNodes = textNodes.concat(getAllTextNodes(child));
  }
  
  return textNodes;
};
