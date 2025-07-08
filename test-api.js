#!/usr/bin/env node

/**
 * Simple test script to verify the API structure
 * This script tests the basic functionality without making actual API calls
 */

const fetch = require('node-fetch');

// Test the API structure
async function testAPI() {
  console.log('🧪 Testing Price Comparison API Structure...\n');
  
  // Test 1: Check if the API endpoint exists (should fail without API keys)
  try {
    const response = await fetch('http://localhost:3000/api/price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: 'US',
        query: 'iPhone 16 Pro, 128GB'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 500 && data.error === 'Missing required environment variables') {
      console.log('✅ API endpoint structure is correct');
      console.log('✅ Environment variable validation working');
    } else {
      console.log('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.log('❌ Error connecting to API:', error.message);
    console.log('Make sure the server is running with: npm run dev');
  }
  
  // Test 2: Test invalid country
  try {
    const response = await fetch('http://localhost:3000/api/price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: 'INVALID',
        query: 'test product'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('Unsupported country')) {
      console.log('✅ Country validation working');
    } else {
      console.log('❌ Country validation failed:', data);
    }
  } catch (error) {
    console.log('❌ Error in country validation test:', error.message);
  }
  
  console.log('\n🎉 Basic API structure tests completed!');
  console.log('\nTo test with real API keys:');
  console.log('1. Copy env.example to .env.local');
  console.log('2. Add your OPENAI_API_KEY and BING_API_KEY');
  console.log('3. Run: npm run dev');
  console.log('4. Test with: curl -X POST http://localhost:3000/api/price -H "Content-Type: application/json" -d \'{"country":"US","query":"iPhone 16 Pro, 128GB"}\'');
}

if (require.main === module) {
  testAPI();
} 