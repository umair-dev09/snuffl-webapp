// performance-comparison.js - Compare Railway vs Render performance
const testUrls = [
  'https://www.amazon.in/dp/B08N5WRWNW',
  'https://www.flipkart.com/apple-iphone-13/p/itm6ac6485515ae4',
  'https://www.amazon.com/dp/B08N5WRWNW'
];

const endpoints = {
  render: 'https://snuffl-crawl4ai-docker.onrender.com',
  railway: 'https://your-railway-app.railway.app' // Update this after deployment
};

async function testEndpoint(name, baseUrl, testType = 'bulk') {
  console.log(`\n🧪 Testing ${name.toUpperCase()} - ${testType}...`);
  
  const startTime = Date.now();
  
  try {
    // Health check first
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthTime = Date.now() - startTime;
    
    if (!healthResponse.ok) {
      console.log(`❌ ${name} health check failed: ${healthResponse.status}`);
      return null;
    }
    
    const healthData = await healthResponse.json();
    console.log(`✅ ${name} health: ${healthTime}ms - ${healthData.status}`);
    
    // Test scraping
    const scrapeStartTime = Date.now();
    let response;
    
    if (testType === 'bulk') {
      response = await fetch(`${baseUrl}/bulk-scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: testUrls,
          extract_structured_data: true
        })
      });
    } else {
      response = await fetch(`${baseUrl}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: testUrls[0],
          extract_structured_data: true
        })
      });
    }
    
    const scrapeTime = Date.now() - scrapeStartTime;
    const totalTime = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`❌ ${name} scraping failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    const results = {
      platform: name,
      healthTime,
      scrapeTime,
      totalTime,
      success: true,
      successRate: testType === 'bulk' ? 
        `${data.successful_scrapes}/${data.total_urls}` : 
        data.success ? '1/1' : '0/1'
    };
    
    console.log(`📊 ${name} Results:`);
    console.log(`   Health Check: ${healthTime}ms`);
    console.log(`   Scraping: ${scrapeTime}ms`);
    console.log(`   Total: ${totalTime}ms`);
    console.log(`   Success Rate: ${results.successRate}`);
    
    return results;
    
  } catch (error) {
    console.log(`❌ ${name} error: ${error.message}`);
    return {
      platform: name,
      error: error.message,
      success: false,
      totalTime: Date.now() - startTime
    };
  }
}

async function runComparison() {
  console.log('🏁 Railway vs Render Performance Comparison');
  console.log('=' * 50);
  
  // Test both platforms in parallel
  console.log('\n📡 Testing Bulk Scraping (3 URLs)...');
  const [renderResults, railwayResults] = await Promise.all([
    testEndpoint('render', endpoints.render, 'bulk'),
    testEndpoint('railway', endpoints.railway, 'bulk')
  ]);
  
  console.log('\n📡 Testing Single Scraping...');
  const [renderSingle, railwaySingle] = await Promise.all([
    testEndpoint('render', endpoints.render, 'single'),
    testEndpoint('railway', endpoints.railway, 'single')
  ]);
  
  // Compare results
  console.log('\n🏆 Performance Summary:');
  console.log('=' * 50);
  
  if (renderResults && railwayResults) {
    console.log('\n📊 Bulk Scraping Comparison:');
    console.log(`   Render:  ${renderResults.totalTime}ms`);
    console.log(`   Railway: ${railwayResults.totalTime}ms`);
    
    const bulkWinner = renderResults.totalTime < railwayResults.totalTime ? 'Render' : 'Railway';
    const bulkDiff = Math.abs(renderResults.totalTime - railwayResults.totalTime);
    console.log(`   🥇 Winner: ${bulkWinner} (${bulkDiff}ms faster)`);
  }
  
  if (renderSingle && railwaySingle) {
    console.log('\n📊 Single Scraping Comparison:');
    console.log(`   Render:  ${renderSingle.totalTime}ms`);
    console.log(`   Railway: ${railwaySingle.totalTime}ms`);
    
    const singleWinner = renderSingle.totalTime < railwaySingle.totalTime ? 'Render' : 'Railway';
    const singleDiff = Math.abs(renderSingle.totalTime - railwaySingle.totalTime);
    console.log(`   🥇 Winner: ${singleWinner} (${singleDiff}ms faster)`);
  }
  
  console.log('\n💡 Recommendation:');
  if (renderResults && railwayResults) {
    const renderAvg = (renderResults.totalTime + (renderSingle?.totalTime || 0)) / 2;
    const railwayAvg = (railwayResults.totalTime + (railwaySingle?.totalTime || 0)) / 2;
    
    if (renderAvg < railwayAvg) {
      console.log('   🎯 Use Render for better performance');
      console.log('   📁 You can delete the crawl4ai-server-railway folder');
    } else {
      console.log('   🎯 Use Railway for better performance');
      console.log('   📁 You can delete the crawl4ai-server folder (Render)');
    }
  }
}

// Update the Railway URL before running
if (endpoints.railway.includes('your-railway-app')) {
  console.log('⚠️ Please update the Railway URL in the script before running the comparison');
  console.log('   Current Railway URL: ' + endpoints.railway);
  console.log('   Update after deploying to Railway');
} else {
  runComparison().catch(console.error);
}
