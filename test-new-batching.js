// test-new-batching.js - Test 15 URLs in 3 batches of 5 URLs each with 2s delay
const testNewBatching = async () => {
  console.log('🧪 Testing new batching: 15 URLs in 3 batches of 5 URLs each...');
  
  const testData = {
    userId: 'test-user',
    query: 'wireless earbuds under 2000'
  };

  try {
    console.log('📡 Calling Next.js API...');
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
      
      console.log(`🎯 Expected: 15 products from Serper, processed in 3 batches of 5 URLs each`);
      console.log(`📊 Actual: ${data.serperProductCount} products from Serper`);
      console.log(`⚡ Expected timing: ~10-15s (3 batches × ~3s each + 2×2s delays)`);
      console.log(`⚡ Actual timing: ${duration.toFixed(1)}s`);
      
      if (data.scrapedProducts && data.scrapedProducts.length > 0) {
        console.log('\n🛍️ Sample products:');
        data.scrapedProducts.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ${product.price}`);
        });
      }
    } else {
      console.error('❌ API call failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testNewBatching();
