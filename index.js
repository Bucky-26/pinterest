const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3004;

app.get('/v1/pinterest', async (req, res) => {
  const targetImageCount = 100; // Set the target number of images to collect
  const imageUrls = []; // Initialize the array to store image URLs

  try {
    // Launch a headless browser with the --no-sandbox flag
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const { s } = req.query;

    // Navigate to the Pinterest URL
    await page.goto(`https://www.pinterest.ph/search/pins/?q=${s}&rs=typed`);

    let collectedImageCount = 0;

    // Scroll until the target number of images is collected
    while (collectedImageCount < targetImageCount) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 3); // Increase scroll distance
      });

      // Adjust the wait time as needed
      await page.waitForTimeout(200); // Reduce wait time for images to load

      const newImageUrls = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('#mweb-unauth-container img');
        return Array.from(imgElements, img => img.src.replace('236x', '1200x'));
      });

      // Add the new images to the collected list
      const uniqueNewImageUrls = newImageUrls.filter(url => !imageUrls.includes(url));
      imageUrls.push(...uniqueNewImageUrls);

      // Update the collected image count
      collectedImageCount = imageUrls.length;
    }

    // Close the browser
    await browser.close();

    // Format the response with each URL on a new line
    const formattedUrls = imageUrls.map(url => `  "${url}"`).join(',\n');
    const jsonResponse = `{
  "status": "success",
  "urls": [
${formattedUrls}
  ],
  "total": ${collectedImageCount}
}`;

    res.setHeader('Content-Type', 'application/json');
    res.send(jsonResponse);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
