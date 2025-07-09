// test-railway-batching.js - Test Railway with 2 batches of 6 URLs each
const testRailwayBatching = async () => {
  console.log('🚂 Testing Railway with 2 batches of 6 URLs each...');
  
  const testData = {
    userId: 'test-user',
    query: 'wireless earbuds gaming'
  };

  try {
    console.log('📡 Calling Next.js API with Railway endpoint...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`Status: ${response.status}`);
    console.log(`⏱️ Total time: ${duration.toFixed(1)}s`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API call successful!');
      console.log(`📊 Results:`, {
        message: data.message,
        serperProductCount: data.serperProductCount,
        scrapedProductCount: data.scrapedProductCount,
        hasScrapedProducts: !!data.scrapedProducts
      });
      
      console.log(`🎯 Expected: 12 products from Serper, processed in 2 batches of 6 URLs each`);
      console.log(`📊 Actual: ${data.serperProductCount} products from Serper`);
      console.log(`⚡ Expected timing: ~8-12s (2 batches × ~4s each + 1×2s delay)`);
      console.log(`⚡ Actual timing: ${duration.toFixed(1)}s`);
      
      if (data.scrapedProducts && data.scrapedProducts.length > 0) {
        console.log('\n🛍️ Sample products:');
        data.scrapedProducts.slice(0, 4).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ${product.price}`);
        });
      }
      
      // Performance analysis
      console.log('\n📈 Performance Analysis:');
      if (duration < 10) {
        console.log('🚀 Excellent! Railway handles 6-URL batches very well');
      } else if (duration < 15) {
        console.log('✅ Good performance with 6-URL batches');
      } else {
        console.log('⚠️ Slower than expected - might need to reduce batch size');
      }
      
    } else {
      console.error('❌ API call failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testRailwayBatching();
