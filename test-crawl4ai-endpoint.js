// test-crawl4ai-endpoint.js - Debug Crawl4AI connection
const testCrawl4AIEndpoint = async () => {
  const endpoint = process.env.CRAWL4AI_ENDPOINT || 'https://snuffl-crawl4ai-server.onrender.com';
  
  console.log(`🔍 Testing Crawl4AI endpoint: ${endpoint}`);
  console.log('=' * 50);

  // Test 1: Health Check
  console.log('\n1. Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${endpoint}/health`);
    console.log(`Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`✅ Health check passed:`, healthData);
    } else {
      console.log(`❌ Health check failed: ${healthResponse.statusText}`);
      const errorText = await healthResponse.text();
      console.log(`Error response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }

  // Test 2: Simple Scrape
  console.log('\n2. Testing Simple Scrape...');
  try {
    const scrapeResponse = await fetch(`${endpoint}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://httpbin.org/html',
        extract_structured_data: false
      })
    });

    console.log(`Status: ${scrapeResponse.status}`);
    
    if (scrapeResponse.ok) {
      const scrapeData = await scrapeResponse.json();
      console.log(`✅ Simple scrape passed:`, {
        success: scrapeData.success,
        url: scrapeData.url,
        hasContent: !!scrapeData.raw_content
      });
    } else {
      console.log(`❌ Simple scrape failed: ${scrapeResponse.statusText}`);
      const errorText = await scrapeResponse.text();
      console.log(`Error response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Simple scrape error:', error.message);
  }

  // Test 3: Product Scrape
  console.log('\n3. Testing Product Scrape...');
  try {
    const productResponse = await fetch(`${endpoint}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.amazon.in/dp/B08N5WRWNW',
        extract_structured_data: true
      })
    });

    console.log(`Status: ${productResponse.status}`);
    
    if (productResponse.ok) {
      const productData = await productResponse.json();
      console.log(`✅ Product scrape result:`, {
        success: productData.success,
        url: productData.url,
        hasProductData: !!productData.product_data,
        productName: productData.product_data?.name || 'N/A',
        error: productData.error
      });
    } else {
      console.log(`❌ Product scrape failed: ${productResponse.statusText}`);
      const errorText = await productResponse.text();
      console.log(`Error response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Product scrape error:', error.message);
  }

  // Test 4: Check actual integration endpoint
  console.log('\n4. Testing Current Integration...');
  try {
    const integrationResponse = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        query: 'test headphones'
      })
    });

    const integrationData = await integrationResponse.json();
    console.log(`Integration Status: ${integrationResponse.status}`);
    console.log('Integration Result:', {
      message: integrationData.message,
      hasSerperProducts: !!integrationData.serperProducts,
      hasScrapedProducts: !!integrationData.scrapedProducts,
      error: integrationData.error
    });
  } catch (error) {
    console.error('❌ Integration test error:', error.message);
  }
};

testCrawl4AIEndpoint();
