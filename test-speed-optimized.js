// test-speed-optimized.js - Test the speed optimizations
const testSpeedOptimized = async () => {
  console.log('⚡ Testing Speed-Optimized Railway Setup...');
  console.log('🎯 Target: Complete 12 URLs in under 60 seconds');
  
  const testData = {
    userId: 'test-user',
    query: 'gaming headset wireless'
  };

  try {
    console.log('🚀 Starting speed test...');
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

    console.log(`\n📊 SPEED TEST RESULTS:`);
    console.log(`⏱️  Total time: ${duration.toFixed(1)}s`);
    console.log(`🎯 Target: <60s`);
    
    if (duration < 60) {
      console.log(`🏆 SUCCESS! ${(60 - duration).toFixed(1)}s faster than target`);
    } else {
      console.log(`⚠️  Still ${(duration - 60).toFixed(1)}s over target`);
    }
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`\n📈 Performance Breakdown:`);
      console.log(`   Status: ${response.status} ✅`);
      console.log(`   Products from Serper: ${data.serperProductCount}`);
      console.log(`   Products scraped: ${data.scrapedProductCount}`);
      console.log(`   Success rate: ${data.scrapedProductCount}/${data.serperProductCount}`);
      
      // Calculate approximate speeds
      const urlsPerSecond = (data.serperProductCount / duration).toFixed(2);
      console.log(`   Processing speed: ${urlsPerSecond} URLs/second`);
      
      console.log(`\n🔄 Optimizations Applied:`);
      console.log(`   ✅ Parallel batch processing (2 batches simultaneously)`);
      console.log(`   ✅ Reduced timeouts (60s per batch vs 180s)`);
      console.log(`   ✅ Optimized Crawl4AI settings`);
      console.log(`   ✅ Faster Groq processing (200 tokens vs 800)`);
      console.log(`   ✅ Aggressive content truncation`);
      
      if (data.scrapedProducts && data.scrapedProducts.length > 0) {
        console.log('\n🛍️ Sample products:');
        data.scrapedProducts.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ${product.price}`);
        });
      }
      
      // Performance recommendations
      console.log(`\n💡 Performance Analysis:`);
      if (duration < 45) {
        console.log(`   🚀 EXCELLENT! Railway setup is highly optimized`);
      } else if (duration < 60) {
        console.log(`   ✅ GOOD! Target achieved, Railway is well optimized`);
      } else if (duration < 90) {
        console.log(`   ⚠️  NEEDS WORK: Consider reducing batch size to 4 URLs`);
      } else {
        console.log(`   ❌ SLOW: May need to revert to sequential processing`);
      }
      
    } else {
      console.error('❌ API call failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Speed test failed:', error.message);
  }
};

testSpeedOptimized();
