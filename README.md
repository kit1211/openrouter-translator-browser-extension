# OpenRouter Translator Browser Extension

A Chrome extension for translating web pages using OpenRouter API with support for multiple AI models including GPT-4o-mini, GPT-4o, and Gemini 2.5 Flash.

![OpenRouter Translator Logo](src/assets/icons/icon.svg)

## Features

- Translate entire web pages with a single click
- Support for multiple AI models through OpenRouter API
- Quick language selection with country flags
- Custom model support
- Default language settings
- Floating translate button on web pages

## Technologies Used

- JavaScript (ES6+)
- Chrome Extension API
- OpenRouter API
- Webpack for building
- CSS for styling

## Installation for Development

### Prerequisites

- Node.js and npm
- Chrome browser

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kit1211/openrouter-translator-browser-extension.git
   cd openrouter-translator-browser-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Generate icon files:
   - Open `icon-generator.html` in your browser
   - Click the download buttons to save the icon files
   - Place the downloaded files in `src/assets/icons/` directory

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `dist` folder from your project directory
4. The extension should now appear in your Chrome extensions list

## Configuration

1. Click on the extension icon in your Chrome toolbar
2. Click on "Advanced Options" to open the settings page
3. Enter your OpenRouter API Key (get one from [OpenRouter](https://openrouter.ai/keys))
4. Configure your preferred default model and language
5. Save your settings

## Usage

### Translating a Page

1. Navigate to any webpage you want to translate
2. Click the floating globe icon (🌐) in the bottom right corner of the page, or
3. Click the extension icon in the toolbar and then click "Translate Page"

### Quick Translation

1. Click the extension icon in the toolbar
2. Use the quick translate buttons with country flags to translate to a specific language

### Changing Models

1. Click the extension icon in the toolbar
2. Select a different model from the dropdown
3. For custom models, select "Custom model..." and enter the model identifier
4. Click "Save Settings" to save your preference

## Project Structure

```
openrouter-translator-browser-extension/
├── manifest.json                 # Extension configuration
├── package.json                  # Dependencies and scripts
├── webpack.config.js             # For bundling
├── icon-generator.html           # Tool to generate icon files
├── src/
│   ├── background/
│   │   └── background.js         # Background script for API handling
│   ├── content/
│   │   └── content.js            # Content script for webpage manipulation
│   ├── popup/
│   │   ├── popup.html            # Extension popup UI
│   │   ├── popup.js              # Popup functionality
│   │   └── popup.css             # Popup styling
│   ├── options/
│   │   ├── options.html          # Settings page
│   │   ├── options.js            # Settings functionality
│   │   └── options.css           # Settings styling
│   ├── utils/
│   │   ├── api.js                # OpenRouter API handling
│   │   ├── translator.js         # Translation logic
│   │   └── storage.js            # Chrome storage management
│   └── assets/
│       ├── icons/                # Extension icons
│       └── flags/                # Country flag icons
└── dist/                         # Built extension files (generated)
```

## Building for Production

To build the extension for production:

```bash
npm run build
```

This will create a `dist` directory with all the necessary files for the extension.

## Troubleshooting

### Extension Not Working

- Make sure you have entered a valid OpenRouter API key in the options page
- Check if you have built the extension correctly and loaded the `dist` folder
- Try disabling and re-enabling the extension in `chrome://extensions/`

### Custom Model Not Working

- Ensure the model identifier is correct and supported by OpenRouter
- Check the browser console for any error messages

### Translation Not Appearing

- Some websites may have security measures that prevent content scripts from running
- Try refreshing the page and clicking the translate button again

## License

MIT

## Acknowledgements

- [OpenRouter](https://openrouter.ai/) for providing the API
- Chrome Extensions API documentation
