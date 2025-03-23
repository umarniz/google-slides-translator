console.log('Content script loaded');

// Function to get the presentation ID from the URL
function getPresentationId() {
  const match = window.location.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Could not find presentation ID in URL');
  }
  return match[1];
}

// Function to check if we're in a Google Slides presentation
function isGoogleSlides() {
  return window.location.hostname === 'docs.google.com' && 
         window.location.pathname.includes('/presentation/d/');
}

// Function to translate slides
async function translateSlides(targetLanguage) {
  try {
    console.log('Starting translation process...');
    
    // First check if we're in a Google Slides presentation
    if (!isGoogleSlides()) {
      throw new Error('Please open a Google Slides presentation first');
    }

    const presentationId = getPresentationId();
    console.log('Found presentation ID:', presentationId);
    
    // Send message to background script
    console.log('Sending message to background script...');
    const response = await chrome.runtime.sendMessage({
      action: 'translateText',
      targetLanguage: targetLanguage,
      presentationId: presentationId
    });
    
    console.log('Received response from background script:', response);
    
    if (!response.success) {
      throw new Error(response.error || 'Translation failed');
    }
    
    if (!response.textElements || response.textElements.length === 0) {
      throw new Error('No text elements found to translate');
    }
    
    // Show success message
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    messageDiv.textContent = response.message || `Found ${response.textElements.length} text elements to translate`;
    document.body.appendChild(messageDiv);
    
    // Remove message after 5 seconds
    setTimeout(() => messageDiv.remove(), 5000);
    
    return response;
    
  } catch (error) {
    console.error('Error during translation:', error);
    
    // Show error message
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    messageDiv.textContent = error.message || 'Translation failed';
    document.body.appendChild(messageDiv);
    
    // Remove message after 5 seconds
    setTimeout(() => messageDiv.remove(), 5000);
    
    throw error;
  }
}

// Listen for messages from popup
console.log('Setting up message listener...');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'translate') {
    console.log('Processing translate request...');
    
    translateSlides(request.targetLanguage)
      .then(result => {
        console.log('Translation completed successfully:', result);
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Translation process failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }
  
  console.log('Unknown action:', request.action);
  sendResponse({ success: false, error: 'Unknown action' });
}); 