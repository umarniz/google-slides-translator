// Function to get all text from the presentation
function getAllText(presentationId) {
  console.log('Getting all text from presentation:', presentationId);
  const presentation = SlidesApp.openById(presentationId);
  const slides = presentation.getSlides();
  const textElements = [];
  
  // Helper function to process a shape and extract text
  function processShape(shape, slideIndex, groupIndex = null) {
    try {
      const text = shape.getText();
      if (text && text.asString().trim()) {
        console.log(`Found text in shape on slide ${slideIndex + 1}${groupIndex !== null ? `, group ${groupIndex}` : ''}`);
        
        // Get text with formatting
        const textStyle = text.getTextStyle();
        const formattedText = {
          text: text.asString(),
          bold: textStyle.isBold() || false,
          italic: textStyle.isItalic() || false,
          underline: textStyle.isUnderline() || false,
          fontSize: textStyle.getFontSize() || 11,
          fontFamily: textStyle.getFontFamily() || 'Arial'
        };
        
        textElements.push({
          slideIndex: slideIndex + 1,
          groupIndex: groupIndex,
          text: text.asString(),
          formatting: formattedText,
          shapeId: shape.getObjectId()
        });
      }
    } catch (error) {
      console.log(`Shape doesn't support text or has no text`);
    }
  }
  
  // Helper function to process a group and its children
  function processGroup(group, slideIndex, parentGroupIndex = null) {
    try {
      const groupIndex = parentGroupIndex !== null ? `${parentGroupIndex}_${group.getObjectId()}` : group.getObjectId();
      const children = group.getChildren();
      
      children.forEach(child => {
        if (child.getPageElementType() === SlidesApp.PageElementType.GROUP) {
          // Recursively process nested groups
          processGroup(child.asGroup(), slideIndex, groupIndex);
        } else if (child.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
          processShape(child.asShape(), slideIndex, groupIndex);
        }
      });
    } catch (error) {
      console.error('Error processing group:', error);
    }
  }

  // Helper function to process table cells
  function processTableCell(table, row, col, slideIndex, tableIndex) {
    try {
      const cell = table.getCell(row, col);
      const text = cell.getText();
      const textContent = text.asString().trim();
      
      if (textContent) {
        console.log(`Found text in table ${tableIndex + 1}, cell (${row},${col}) on slide ${slideIndex + 1}: "${textContent}"`);
        
        // Get text with formatting
        const textStyle = text.getTextStyle();
        const formattedText = {
          text: textContent,
          bold: textStyle.isBold() || false,
          italic: textStyle.isItalic() || false,
          underline: textStyle.isUnderline() || false,
          fontSize: textStyle.getFontSize() || 11,
          fontFamily: textStyle.getFontFamily() || 'Arial'
        };
        
        textElements.push({
          slideIndex: slideIndex + 1,
          tableIndex: tableIndex,
          row: row,
          col: col,
          text: textContent,
          formatting: formattedText,
          shapeId: `table_${table.getObjectId()}_${row}_${col}`,
          type: 'table_cell'
        });
      }
    } catch (error) {
      console.error(`Error processing table cell (${row},${col}):`, error);
    }
  }
  
  slides.forEach((slide, slideIndex) => {
    console.log(`Processing slide ${slideIndex + 1}`);
    
    // Process tables first
    const tables = slide.getTables();
    console.log(`Found ${tables.length} tables on slide ${slideIndex + 1}`);
    
    tables.forEach((table, tableIndex) => {
      const numRows = table.getNumRows();
      const numCols = table.getNumColumns();
      console.log(`Processing table ${tableIndex + 1} with ${numRows} rows and ${numCols} columns`);
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          processTableCell(table, row, col, slideIndex, tableIndex);
        }
      }
    });
    
    // Process shapes and groups after tables
    const shapes = slide.getShapes();
    shapes.forEach(shape => processShape(shape, slideIndex));
    
    const groups = slide.getGroups();
    groups.forEach(group => processGroup(group, slideIndex));
  });
  
  console.log('Total text elements found:', textElements.length);
  return textElements;
}

// Function to update text in a specific shape while preserving formatting
function updateText(presentationId, shapeId, translatedText, originalFormatting) {
  console.log('Updating text for shape:', shapeId);
  console.log('Translated text:', translatedText);
  console.log('Original formatting:', originalFormatting);
  
  const presentation = SlidesApp.openById(presentationId);
  const slides = presentation.getSlides();
  
  // Check if this is a table cell
  if (shapeId.startsWith('table_')) {
    const [_, tableId, rowStr, colStr] = shapeId.split('_');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    
    console.log(`Looking for table ${tableId}, cell (${row},${col})`);
    
    for (const slide of slides) {
      const tables = slide.getTables();
      for (const table of tables) {
        if (table.getObjectId() === tableId) {
          try {
            const cell = table.getCell(row, col);
            const text = cell.getText();
            text.clear();
            text.setText(translatedText);
            
            // Apply formatting
            const textStyle = text.getTextStyle();
            textStyle.setBold(originalFormatting.bold || false);
            textStyle.setItalic(originalFormatting.italic || false);
            textStyle.setUnderline(originalFormatting.underline || false);
            textStyle.setFontSize(originalFormatting.fontSize || 11);
            textStyle.setFontFamily(originalFormatting.fontFamily || 'Arial');
            
            console.log('Successfully updated text for table cell:', shapeId);
            return true;
          } catch (error) {
            console.error('Error updating table cell:', error);
            throw error;
          }
        }
      }
    }
    console.error('Table not found:', tableId);
    return false;
  }
  
  // Handle regular shapes
  for (const slide of slides) {
    const shapes = slide.getShapes();
    for (const shape of shapes) {
      if (shape.getObjectId() === shapeId) {
        const text = shape.getText();
        text.clear();
        text.setText(translatedText);
        
        // Apply formatting
        const textStyle = text.getTextStyle();
        textStyle.setBold(originalFormatting.bold || false);
        textStyle.setItalic(originalFormatting.italic || false);
        textStyle.setUnderline(originalFormatting.underline || false);
        textStyle.setFontSize(originalFormatting.fontSize || 11);
        textStyle.setFontFamily(originalFormatting.fontFamily || 'Arial');
        
        console.log('Successfully updated text for shape:', shapeId);
        return true;
      }
    }
  }
  
  console.error('Shape or table cell not found:', shapeId);
  return false;
}

// Function to handle translation requests
function doPost(e) {
  console.log('Received POST request:', e);
  console.log('Request data:', e.postData.contents);
  
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed request data:', data);
    
    if (!data.action || data.action !== 'translate') {
      console.error('Invalid action:', data.action);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action',
        details: 'The request must include an action of "translate"'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!data.targetLanguage) {
      console.error('Missing target language');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing target language',
        details: 'The request must include a target language'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!data.presentationId) {
      console.error('Missing presentation ID');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing presentation ID',
        details: 'The request must include a presentation ID'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Starting translation process for presentation:', data.presentationId);
    const result = translateSlides(data.presentationId, data.targetLanguage);
    console.log('Translation result:', result);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      details: 'An error occurred while processing the request'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle translation requests
function translateSlides(presentationId, targetLanguage) {
  console.log('Opening presentation:', presentationId);
  const presentation = SlidesApp.openById(presentationId);
  console.log('Successfully opened presentation');
  
  // Get all text elements with formatting
  const textElements = getAllText(presentationId);
  console.log('Found', textElements.length, 'text elements total');
  
  // Translate each text element while preserving formatting
  for (const element of textElements) {
    try {
      console.log(`Translating text: "${element.text}"`);
      
      // Get the translated text synchronously
      let translatedText;
      try {
        translatedText = translateWithChatGPT(element.text, targetLanguage);
        if (translatedText && typeof translatedText === 'object' && translatedText.then) {
          // If it's a Promise, get its value synchronously
          translatedText = translatedText.toString();
          console.error('Translation returned a Promise instead of text');
        }
      } catch (translationError) {
        console.error('Translation error:', translationError);
        translatedText = element.text; // Keep original text on error
      }
      
      console.log(`Translated text: "${translatedText}"`);
      
      // Update the text in the presentation while preserving formatting
      updateText(presentationId, element.shapeId, translatedText, element.formatting);
      
      console.log(`Successfully translated and updated text for shape ${element.shapeId}`);
    } catch (error) {
      console.error(`Error translating text for shape ${element.shapeId}:`, error);
    }
  }
  
  return {
    success: true,
    textElements: textElements,
    message: `Found ${textElements.length} text elements to translate`
  };
}

// Handle OPTIONS requests for CORS
function doOptions(e) {
  console.log('Received OPTIONS request:', e);
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
} 