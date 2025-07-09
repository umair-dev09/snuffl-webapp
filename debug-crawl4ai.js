// debug-crawl4ai.js - Debug the Crawl4AI integration step by step
const testCrawl4AIIntegration = async () => {
  console.log('🔍 Debugging Crawl4AI Integration...\n');

  // Sample Serper products (from the actual response)
  const serperProducts = [
    {
      "title": "boAt Rockerz 550 Bluetooth Wireless Over Ear Headphones",
      "source": "boAt",
      "link": "https://google.com/shopping/product/2138685141745863597?gl=in",
      "price": "₹1,205.33",
      "rating": 4.7,
      "ratingCount": 373,
      "productId": "2138685141745863597"
    },
    {
      "title": "Noise Airwave Max 4 Wireless Over-Ear Headphones",
      "source": "Noise", 
      "link": "https://google.com/shopping/product/5094145435918843741?gl=in",
      "price": "₹1,674.33",
      "rating": 4.4,
      "ratingCount": 203,
      "productId": "5094145435918843741"
    }
  ];

  console.log(`📋 Testing with ${serperProducts.length} Serper products`);

  // Step 1: Test direct bulk scrape
  console.log('\n1. Testing Direct Bulk Scrape...');
  try {
    const endpoint = 'https://snuffl-crawl4ai-docker.onrender.com';
    const urls = serperProducts.map(p => p.link);
    
    console.log(`🔗 URLs to scrape: ${urls.length}`);
    urls.forEach((url, i) => console.log(`  ${i+1}. ${url}`));

    const response = await fetch(`${endpoint}/bulk-scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: urls,
        extract_structured_data: true
      })
    });

    const result = await response.json();
    console.log(`\n📊 Bulk scrape results:`);
    console.log(`Total URLs: ${result.total_urls}`);
    console.log(`Successful: ${result.successful_scrapes}`);
    console.log(`Failed: ${result.failed_scrapes}`);

    result.results.forEach((res, i) => {
      console.log(`\nResult ${i+1}:`);
      console.log(`  URL: ${res.url}`);
      console.log(`  Success: ${res.success}`);
      if (res.success) {
        console.log(`  Product Name: ${res.product_data?.name || 'N/A'}`);
        console.log(`  Product Price: ${res.product_data?.price || 'N/A'}`);
      } else {
        console.log(`  Error: ${res.error}`);
      }
    });

  } catch (error) {
    console.log(`❌ Direct bulk scrape failed: ${error.message}`);
    return;
  }

  // Step 2: Test the crawl4aiService directly
  console.log('\n2. Testing crawl4aiService.scrapeSerperProducts...');
  try {
    // Simulate what the service does
    const { crawl4aiService } = await import('./lib/crawl4aiService.js');
    const productData = await crawl4aiService.scrapeSerperProducts(serperProducts);
    
    console.log(`📦 Service returned ${productData.length} products`);
    productData.forEach((product, i) => {
      console.log(`\nProduct ${i+1}:`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Price: ${product.price}`);
      console.log(`  Rating: ${product.rating}`);
    });

  } catch (error) {
    console.log(`❌ Service test failed: ${error.message}`);
  }
};

testCrawl4AIIntegration();
