const puppeteer = require('puppeteer');

async function generateImageFromText(text) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // Navigate to the page with an increased timeout
    await page.goto('https://deepai.org/machine-learning-model/text2img', { timeout: 60000 });

    // Fill in the textarea
    await page.type('textarea.model-input-text-input', text);

    // Click the button
    await page.click('#modelSubmitButton');

    // Wait for the image response
    await page.waitForSelector('#place_holder_picture_model img', { visible: true });

    // Get the image URL
    const imageURL = await page.$eval('#place_holder_picture_model img', img => img.src);
    
    // Log the image URL
    console.log('Generated Image URL:', imageURL);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Example: Call the function with a sample text
generateImageFromText('Sample text for testing');
