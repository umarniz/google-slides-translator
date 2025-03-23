# Google Slides Translator

An automated solution for translating Google Slides presentations while preserving all formatting, including text styles, tables, and grouped elements.

## Features

- 🔄 Automatic translation of entire presentations
- 💅 Preserves all text formatting (bold, italic, underline, font size, font family)
- 📊 Supports tables and merged cells
- 🎨 Handles grouped elements and shapes
- 🎯 Maintains original layout and design
- 🔍 Detailed logging for troubleshooting

## Setup

### Prerequisites

1. Google Account with access to Google Apps Script
2. ChatGPT API key from OpenAI
3. Google Chrome browser (for the extension)

### Installation

1. Create a new Google Apps Script project:
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the contents of `google-apps-script/Code.gs` into the script editor
   - Create a new file called `google-apps-script/chatgpt.gs` and copy its contents

2. Configure the ChatGPT API:
   - Replace `YOUR_API_KEY` in `chatgpt.gs` with your actual OpenAI API key
   - Save the changes

3. Deploy as a Web App:
   - Click on "Deploy" > "New deployment"
   - Choose "Web app" as the deployment type
   - Set the following options:
     - Execute as: "User accessing the web app"
     - Who has access: "Anyone"
   - Click "Deploy" and authorize the application
   - Copy the deployment URL for later use

4. Install the Chrome Extension:
   - Load the extension in developer mode
   - Update the `manifest.json` with your deployment URL
   - Reload the extension

## Usage

1. Open any Google Slides presentation
2. Click the extension icon in Chrome
3. Select your target language
4. Click "Translate" and wait for the process to complete

## Technical Details

The translator works in several steps:

1. **Text Detection**:
   - Scans all slides for text elements
   - Processes shapes, tables, and grouped elements
   - Preserves formatting information

2. **Translation**:
   - Uses ChatGPT API for high-quality translation
   - Handles text in batches
   - Maintains special characters and formatting

3. **Update**:
   - Updates each element while preserving original formatting
   - Handles special cases like merged cells
   - Maintains slide layout and design

## Error Handling

The system includes comprehensive error handling:
- Logs all operations for debugging
- Gracefully handles API failures
- Preserves original text if translation fails
- Provides detailed error messages

## Limitations

- Requires ChatGPT API key
- Translation quality depends on ChatGPT
- Processing time increases with presentation size
- API rate limits may apply

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository. 