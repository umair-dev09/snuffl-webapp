// test-integration.js - Test the complete Serper + Crawl4AI integration
const testCompleteFlow = async () => {
  try {
    console.log('🧪 Testing complete Serper → Crawl4AI integration...\n');

    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        query: 'best wireless headphones under 5000'
      })
    });

    const data = await response.json();
    console.log('📊 Integration Test Results:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.scrapedProducts) {
      console.log(`\n✅ Complete flow successful!`);
      console.log(`📈 Serper found: ${data.serperProductCount} products`);
      console.log(`🕷️ Crawl4AI scraped: ${data.scrapedProductCount} products`);
      console.log('\n🛍️ Sample scraped products:');
      data.scrapedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'Unknown'}`);
        console.log(`   Price: ${product.price || 'N/A'}`);
        console.log(`   Rating: ${product.rating || 'N/A'}`);
        console.log(`   Brand: ${product.brand || 'N/A'}`);
        console.log('');
      });
    } else if (data.serperProducts) {
      console.log(`\n⚠️ Partial success - Serper worked but Crawl4AI might be down`);
      console.log(`📦 Serper returned ${data.serperProducts.length} products`);
    } else {
      console.log(`\n❌ Integration test failed`);
    }
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
};

testCompleteFlow();
