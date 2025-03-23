document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  const translateButton = document.getElementById('translateBtn');
  const languageSelect = document.getElementById('targetLanguage');
  const statusDiv = document.getElementById('status');
  
  if (!translateButton || !languageSelect || !statusDiv) {
    console.error('Required elements not found:', {
      translateButton: !!translateButton,
      languageSelect: !!languageSelect,
      statusDiv: !!statusDiv
    });
    return;
  }
  
  translateButton.addEventListener('click', async function() {
    console.log('Translate button clicked');
    const targetLanguage = languageSelect.value;
    console.log('Selected language:', targetLanguage);
    
    statusDiv.textContent = 'Translating...';
    statusDiv.style.color = '#666';
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      if (!tab.url.includes('docs.google.com/presentation')) {
        throw new Error('Please open a Google Slides presentation first');
      }
      
      console.log('Sending message to content script...');
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'translate',
        targetLanguage: targetLanguage
      });
      
      console.log('Received response:', response);
      
      if (response.success) {
        statusDiv.textContent = response.result.message || 'Translation completed successfully!';
        statusDiv.style.color = '#4CAF50';
      } else {
        throw new Error(response.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      statusDiv.textContent = error.message || 'Translation failed. Please try again.';
      statusDiv.style.color = '#f44336';
    }
  });
}); 