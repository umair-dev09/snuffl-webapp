// test-batching.js - Test the new batching functionality

const testBatching = async () => {
  console.log('🧪 Testing batching functionality...');
  
  const testData = {
    userId: 'test-user',
    query: 'wireless headphones'
  };

  try {
    console.log('📡 Calling Next.js API with batching enabled...');
    
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

testBatching();
