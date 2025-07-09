// test-intelligent-ranking.js - Test the intelligent URL selection
const testIntelligentRanking = async () => {
  console.log('🧠 Testing intelligent ranking for best 15 URLs...');
  
  const testCases = [
    {
      name: 'Budget-conscious office chair',
      query: 'office chair with headrest under 3000',
      expectedBehavior: 'Should prioritize chairs under ₹3000 with headrest'
    },
    {
      name: 'Gaming headphones',
      query: 'wireless gaming headphones under 5000',
      expectedBehavior: 'Should prioritize wireless gaming headphones under ₹5000'
    },
    {
      name: 'Gym equipment',
      query: 'home gym equipment for small space',
      expectedBehavior: 'Should prioritize compact/space-saving gym equipment'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Query: "${testCase.query}"`);
    console.log(`🎯 Expected: ${testCase.expectedBehavior}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user',
          query: testCase.query
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Serper returned: ${data.serperProductCount} products`);
        console.log(`🛍️ Scraped: ${data.scrapedProductCount} products`);
        
        if (data.scrapedProducts && data.scrapedProducts.length > 0) {
          console.log(`🏆 Top ranked products:`);
          data.scrapedProducts.slice(0, 3).forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - ${product.price}`);
          });
        }
      } else {
        console.log(`❌ Failed: ${response.status} - ${data.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${testCase.name}":`, error.message);
    }
    
    // Wait between tests
    console.log('⏳ Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Intelligent ranking tests completed!');
};

testIntelligentRanking();
