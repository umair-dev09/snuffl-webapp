// test-15-products.js - Test the 15 product limit with 5 batches of 3
const testFifteenProducts = async () => {
  console.log('🧪 Testing 15 products with 5 batches of 3...');
  
  const testData = {
    userId: 'test-user',
    query: 'office chair with headrest'
  };

  try {
    console.log('📡 Calling Next.js API...');
    
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`Status: ${response.status}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API call successful!');
      console.log(`📊 Results:`, {
        message: data.message,
        serperProductCount: data.serperProductCount,
        scrapedProductCount: data.scrapedProductCount,
        hasScrapedProducts: !!data.scrapedProducts
      });
      
      console.log(`🎯 Expected: 15 products from Serper, processed in 5 batches of 3`);
      console.log(`📊 Actual: ${data.serperProductCount} products from Serper`);
      
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

testFifteenProducts();
