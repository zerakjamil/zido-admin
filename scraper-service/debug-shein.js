const puppeteer = require('puppeteer');

async function debugSheinPage() {
  const url = 'https://us.shein.com/Avantive-Metal-Trim-Halter-Neck-And-Off-The-Shoulder-Black-Top-Formal-Back-To-School-Halloween-Wedding-Guest-Vacation-Y2k-Beach-Cute-Teacher-Going-Out-Business-Casual-Elegant-Birthday-Office-Outfits-Country-Concert-Club-Western-Work-Clothes-Streetwear-Vintage-Festival-Cocktail-Rave-Prom-Airport-Funny-Basic-Brunch-Outfits-2000s-Style-Bodycon-Old-Money-Style-Church-Homecoming-Classy-Party-Modest-Fairycore-Coquette-Date-Night-Festival-Resort-Wear-Baddie-Stockholm-Style-Night-Out-p-86164532.html';

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
  
  console.log('Navigating to page...');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  
  console.log('Waiting for images...');
  await page.waitForTimeout(5000);
  
  // Extract all images
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      dataSrc: img.getAttribute('data-src'),
      alt: img.alt,
      className: img.className
    })).filter(img => img.src && img.src.includes('img.ltwebstatic.com'));
  });
  
  console.log('\n=== FOUND IMAGES ===');
  images.forEach((img, index) => {
    console.log(`${index + 1}. ${img.src}`);
    console.log(`   Alt: ${img.alt}`);
    console.log(`   Class: ${img.className}`);
    console.log('---');
  });
  
  await browser.close();
}

debugSheinPage().catch(console.error);
