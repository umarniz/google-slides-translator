// Replace this with your deployed Google Apps Script web app URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYeUH8cGal-7Q7ebEewhgdPAaiHVCbD2JyHxkZEf4q9BAWhjjnZjtRGu5HLFabfbUjvg/exec';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translateText') {
    console.log('Background script received request:', request);
    
    // Forward the request to Google Apps Script
    const requestBody = {
      action: 'translate',
      targetLanguage: request.targetLanguage,
      presentationId: request.presentationId
    };
    
    console.log('Sending request to Apps Script:', {
      url: APPS_SCRIPT_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: requestBody
    });

    // Make the request with redirect: "follow"
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    })
    .then(response => {
      console.log('Received response:', {
        status: response.status,
        statusText: response.statusText,
        type: response.type
      });
      
      return response.text();
    })
    .then(text => {
      console.log('Raw response text:', text);
      try {
        const result = JSON.parse(text);
        console.log('Parsed response:', result);
        
        // If we have text elements, consider it a success
        if (result.textElements && result.textElements.length > 0) {
          const successResponse = {
            success: true,
            textElements: result.textElements,
            message: `Found ${result.textElements.length} text elements to translate`
          };
          console.log('Sending success response:', successResponse);
          sendResponse(successResponse);
          return;
        }
        
        console.log('Sending parsed result:', result);
        sendResponse(result);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.error('Response text:', text);
        
        // If we can't parse the JSON, but we have text, it might still be a success
        if (text && text.includes('textElements')) {
          const successResponse = {
            success: true,
            message: 'Received response from server',
            rawResponse: text
          };
          console.log('Sending raw response as success:', successResponse);
          sendResponse(successResponse);
          return;
        }
        
        throw new Error('Invalid JSON response from server');
      }
    })
    .catch(error => {
      console.error('Error in background script:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      let errorDetails = 'Please check the Apps Script deployment and permissions';
      
      if (error.message.includes('Network error')) {
        errorMessage = 'Could not connect to the translation service';
        errorDetails = 'Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed';
        errorDetails = 'Please make sure you are logged into the correct Google account and have authorized the Apps Script.';
      }
      
      const errorResponse = { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      };
      console.log('Sending error response:', errorResponse);
      sendResponse(errorResponse);
    });
    
    return true; // Keep the message channel open for async response
  }
}); 