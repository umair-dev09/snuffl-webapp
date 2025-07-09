// test-smart-selection.js - Test smart URL selection with budget constraint
const testSmartSelection = async () => {
  console.log('🧠 Testing smart URL selection with budget constraint...');
  
  const testData = {
    userId: 'test-user',
    query: 'office chair with headrest under 3000'
  };

  try {
    console.log('📡 Calling API with budget-conscious query...');
    
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
      console.log(`📊 Smart selection results:`);
      console.log(`  - Serper products: ${data.serperProductCount} (should be exactly 15)`);
      console.log(`  - Successfully scraped: ${data.scrapedProductCount}`);
      
      if (data.scrapedProducts && data.scrapedProducts.length > 0) {
        console.log('\n🏆 Top ranked products (should prioritize budget + headrest):');
        data.scrapedProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   Price: ${product.price}`);
          console.log(`   Rating: ${product.rating || 'N/A'}`);
          console.log('');
        });
        
        // Check if prices are within budget
        const withinBudget = data.scrapedProducts.filter(p => {
          const price = parseFloat(p.price.replace(/[₹,]/g, ''));
          return price <= 3000;
        });
        
        console.log(`💰 Products within ₹3000 budget: ${withinBudget.length}/${data.scrapedProducts.length}`);
        
        // Check for headrest keyword
        const withHeadrest = data.scrapedProducts.filter(p => 
          p.name.toLowerCase().includes('headrest')
        );
        
        console.log(`🪑 Products with 'headrest': ${withHeadrest.length}/${data.scrapedProducts.length}`);
      }
    } else {
      console.error('❌ API call failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testSmartSelection();
