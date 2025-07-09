// test-crawl4ai-endpoint.js - Debug Crawl4AI connection
const testCrawl4AIEndpoint = async () => {
  const endpoint = 'https://snuffl-crawl4ai-docker.onrender.com';
  
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

  // Test 4: Bulk Scrape (Small batch)
  console.log('\n4. Testing Small Bulk Scrape...');
  try {
    const bulkResponse = await fetch(`${endpoint}/bulk-scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [
          'https://httpbin.org/html',
          'https://www.amazon.in/dp/B08N5WRWNW'
        ],
        extract_structured_data: true
      })
    });

    console.log(`Status: ${bulkResponse.status}`);
    
    if (bulkResponse.ok) {
      const bulkData = await bulkResponse.json();
      console.log(`✅ Small bulk scrape result:`, {
        totalUrls: bulkData.total_urls,
        successfulScrapes: bulkData.successful_scrapes,
        hasResults: !!bulkData.results && bulkData.results.length > 0
      });
    } else {
      console.log(`❌ Small bulk scrape failed: ${bulkResponse.statusText}`);
      const errorText = await bulkResponse.text();
      console.log(`Error response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Small bulk scrape error:', error.message);
  }

  // Test 5: Bulk Scrape (Large batch)
  console.log('\n5. Testing Large Bulk Scrape...');
  try {
    const largeUrls = [
      'https://www.amazon.in/dp/B08N5WRWNW',
      'https://www.flipkart.com/apple-iphone-13/p/itm6ac6485515ae4',
      'https://www.amazon.com/dp/B08N5WRWNW',
      'https://www.bestbuy.com/site/apple-iphone-13/6448849.p',
      'https://www.target.com/p/apple-iphone-13/-/A-83881867',
      'https://www.walmart.com/ip/Apple-iPhone-13/475616863',
      'https://www.newegg.com/apple-iphone-13/p/N82E16875208158',
      'https://www.costco.com/apple-iphone-13.product.100791439.html',
      'https://www.ebay.com/itm/Apple-iPhone-13/374165432789',
      'https://www.bhphotovideo.com/c/product/1671835/apple_mlpg3ll_a_iphone_13_128gb_blue.html'
    ];

    console.log(`Sending ${largeUrls.length} URLs...`);
    
    const largeBulkResponse = await fetch(`${endpoint}/bulk-scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: largeUrls,
        extract_structured_data: true
      })
    });

    console.log(`Status: ${largeBulkResponse.status}`);
    
    if (largeBulkResponse.ok) {
      const largeBulkData = await largeBulkResponse.json();
      console.log(`✅ Large bulk scrape result:`, {
        totalUrls: largeBulkData.total_urls,
        successfulScrapes: largeBulkData.successful_scrapes,
        hasResults: !!largeBulkData.results && largeBulkData.results.length > 0
      });
    } else {
      console.log(`❌ Large bulk scrape failed: ${largeBulkResponse.statusText}`);
      const errorText = await largeBulkResponse.text();
      console.log(`Error response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Large bulk scrape error:', error.message);
  }

  // Test 6: Check actual integration endpoint
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
