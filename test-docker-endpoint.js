// test-docker-endpoint.js
async function testDockerEndpoint() {
  const endpoint = 'https://snuffl-crawl4ai-docker.onrender.com';
  
  console.log('🐳 Testing Docker Crawl4AI Endpoint Directly...\n');

  // Test 1: Health Check
  console.log('1. Health Check:');
  try {
    const healthResponse = await fetch(`${endpoint}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Status: ${healthResponse.status}`);
    console.log(`✅ Response: ${JSON.stringify(healthData)}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return;
  }

  // Test 2: Simple Product Scrape
  console.log('\n2. Simple Product Scrape:');
  try {
    const scrapeResponse = await fetch(`${endpoint}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.amazon.in/dp/B08N5WRWNW',
        extract_structured_data: true
      })
    });

    const scrapeData = await scrapeResponse.json();
    console.log(`Status: ${scrapeResponse.status}`);
    console.log(`Success: ${scrapeData.success}`);
    console.log(`URL: ${scrapeData.url}`);
    
    if (scrapeData.success) {
      console.log(`✅ Product Name: ${scrapeData.product_data?.name || 'N/A'}`);
      console.log(`✅ Product Price: ${scrapeData.product_data?.price || 'N/A'}`);
      console.log(`✅ Product Rating: ${scrapeData.product_data?.rating || 'N/A'}`);
    } else {
      console.log(`❌ Error: ${scrapeData.error}`);
    }
  } catch (error) {
    console.log(`❌ Scrape test failed: ${error.message}`);
  }

  // Test 3: Bulk Scrape (like what the integration uses)
  console.log('\n3. Bulk Scrape Test:');
  try {
    const bulkResponse = await fetch(`${endpoint}/bulk-scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: [
          'https://google.com/shopping/product/17288165653605839116?gl=in',
          'https://google.com/shopping/product/1989553405342060063?gl=in'
        ],
        extract_structured_data: true
      })
    });

    const bulkData = await bulkResponse.json();
    console.log(`Status: ${bulkResponse.status}`);
    console.log(`Total URLs: ${bulkData.total_urls}`);
    console.log(`Successful: ${bulkData.successful_scrapes}`);
    console.log(`Failed: ${bulkData.failed_scrapes}`);
    
    if (bulkData.results && bulkData.results.length > 0) {
      bulkData.results.forEach((result, index) => {
        console.log(`\nResult ${index + 1}:`);
        console.log(`  URL: ${result.url}`);
        console.log(`  Success: ${result.success}`);
        if (result.success && result.product_data) {
          console.log(`  Product: ${result.product_data.name || 'N/A'}`);
        } else {
          console.log(`  Error: ${result.error || 'Unknown error'}`);
        }
      });
    }
  } catch (error) {
    console.log(`❌ Bulk scrape test failed: ${error.message}`);
  }
}

testDockerEndpoint();
