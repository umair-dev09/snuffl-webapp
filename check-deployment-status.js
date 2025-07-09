// check-deployment-status.js
const endpoints = [
  'https://snuffl-crawl4ai-server.onrender.com',
  'https://snuffl-crawl4ai-docker.onrender.com'
];

async function checkEndpoint(url) {
  console.log(`\n🔍 Checking: ${url}`);
  
  try {
    const response = await fetch(`${url}/health`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ WORKING: ${JSON.stringify(data)}`);
      return { url, status: 'working', data };
    } else {
      console.log(`❌ ERROR: ${response.statusText}`);
      return { url, status: 'error', error: response.statusText };
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return { url, status: 'failed', error: error.message };
  }
}

async function checkAllEndpoints() {
  console.log('🧪 Checking Crawl4AI deployment status...');
  console.log('=' * 50);
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n📊 Summary:');
  results.forEach(result => {
    const status = result.status === 'working' ? '✅ WORKING' : '❌ NOT WORKING';
    console.log(`${status}: ${result.url}`);
  });
  
  const workingEndpoints = results.filter(r => r.status === 'working');
  if (workingEndpoints.length > 0) {
    console.log(`\n🎯 Use this endpoint in .env.local:`);
    console.log(`CRAWL4AI_ENDPOINT=${workingEndpoints[0].url}`);
  } else {
    console.log(`\n⚠️ No working endpoints found. You need to deploy the Docker version.`);
  }
}

checkAllEndpoints();
