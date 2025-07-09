// debug-api-call.js - Test exactly what the API does
const testAPICall = async () => {
  console.log('🧪 Testing API Search Call...\n');

  try {
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'debug-user',
        query: 'test headphones under 2000'
      })
    });

    const data = await response.json();
    
    console.log(`📊 API Response Status: ${response.status}`);
    console.log(`📊 API Response:`, JSON.stringify(data, null, 2));
    
    // Check if the issue is in our logic
    if (data.serperProducts && data.serperProducts.length > 0) {
      console.log('\n🔍 Debugging the issue:');
      console.log(`✅ Serper API: Working (${data.serperProducts.length} products)`);
      
      if (data.scrapedProducts && data.scrapedProducts.length > 0) {
        console.log(`✅ Crawl4AI Integration: Working (${data.scrapedProducts.length} products)`);
        data.scrapedProducts.forEach((product, i) => {
          console.log(`  ${i+1}. ${product.name} - ${product.price}`);
        });
      } else {
        console.log(`❌ Crawl4AI Integration: Failed`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
        
        // Let's test the individual URLs manually
        console.log('\n🔧 Manual URL Test:');
        const testUrls = data.serperProducts.slice(0, 2).map(p => p.link);
        
        for (const url of testUrls) {
          console.log(`\n🔗 Testing: ${url}`);
          try {
            const scrapeResponse = await fetch('https://snuffl-crawl4ai-docker.onrender.com/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: url,
                extract_structured_data: true
              })
            });
            
            const scrapeData = await scrapeResponse.json();
            console.log(`  Success: ${scrapeData.success}`);
            if (scrapeData.success) {
              console.log(`  Product: ${scrapeData.product_data?.name || 'N/A'}`);
              console.log(`  Price: ${scrapeData.product_data?.price || 'N/A'}`);
            } else {
              console.log(`  Error: ${scrapeData.error}`);
            }
          } catch (scrapeError) {
            console.log(`  ❌ Scrape failed: ${scrapeError.message}`);
          }
        }
      }
    } else {
      console.log('❌ Serper API: Failed');
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
  }
};

testAPICall();
