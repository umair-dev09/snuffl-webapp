// test-serper.js - Quick test for Serper API integration
const testSearchAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        query: 'best headphones under 3000'
      })
    });

    const data = await response.json();
    console.log('🧪 Test Results:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.serperProducts) {
      console.log(`\n✅ Successfully fetched ${data.serperProducts.length} products from Serper API`);
      console.log('\n📋 Sample products:');
      data.serperProducts.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   Price: ${product.price}`);
        console.log(`   Source: ${product.source}`);
        console.log(`   Link: ${product.link}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSearchAPI();
