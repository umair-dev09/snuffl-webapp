// test-api.js - Test the Next.js API endpoint

async function testAPI() {
  console.log('🧪 Testing Next.js API endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        query: 'test headphones'
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON');
    }

  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

testAPI();
