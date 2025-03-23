// Replace with your ChatGPT API key
const CHATGPT_API_KEY = 'YOUR_API_KEY';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to translate text using ChatGPT
function translateWithChatGPT(text, targetLanguage) {
  try {
    console.log(`Translating to ${targetLanguage}: "${text}"`);
    
    const response = UrlFetchApp.fetch(CHATGPT_API_URL, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CHATGPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. Preserve any special characters, numbers, and formatting. Only translate the text, do not add any explanations or notes.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      }),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      console.error('ChatGPT API error:', responseText);
      throw new Error(`ChatGPT API error: ${responseCode}`);
    }
    
    const result = JSON.parse(responseText);
    const translatedText = result.choices[0].message.content.trim();
    console.log(`Translation result: "${translatedText}"`);
    return translatedText;
    
  } catch (error) {
    console.error('Error in translateWithChatGPT:', error);
    throw error;
  }
} 