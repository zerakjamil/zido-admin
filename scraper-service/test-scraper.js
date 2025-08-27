const { scrapeProduct } = require('./scrapers/productScraper');

async function testScraper() {
  console.log('Testing scraper with Shein URL...');
  
  const url = 'https://us.shein.com/Avantive-Metal-Trim-Halter-Neck-And-Off-The-Shoulder-Black-Top-Formal-Back-To-School-Halloween-Wedding-Guest-Vacation-Y2k-Beach-Cute-Teacher-Going-Out-Business-Casual-Elegant-Birthday-Office-Outfits-Country-Concert-Club-Western-Work-Clothes-Streetwear-Vintage-Festival-Cocktail-Rave-Prom-Airport-Funny-Basic-Brunch-Outfits-2000s-Style-Bodycon-Old-Money-Style-Church-Homecoming-Classy-Party-Modest-Fairycore-Coquette-Date-Night-Festival-Resort-Wear-Baddie-Stockholm-Style-Night-Out-p-86164532.html?src_identifier=on%3DIMAGE_COMPONENT%60cn%3Dshopbycate%60hz%3D-%60jc%3Dreal_2030%60ps%3D2_1&src_module=all&src_tab_page_id=page_home1755295495323&pageListType=4&imgRatio=3-4&pageListType=4';
  
  try {
    const result = await scrapeProduct(url);
    console.log('\n=== SCRAPING RESULT ===');
    console.log('Name:', result.name);
    console.log('Price:', result.price, result.currency);
    console.log('Description:', result.description.substring(0, 100) + '...');
    console.log('Colors:', result.colors);
    console.log('Sizes:', result.sizes);
    console.log('\n=== IMAGE URLS ===');
    result.image_urls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    console.log('\n=== TEST COMPLETE ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  process.exit(0);
}

testScraper();
