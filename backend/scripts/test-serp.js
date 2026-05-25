// Test SerpAPI connectivity and response
import 'dotenv/config';

const SERP_API_KEY = process.env.SERP_API_KEY;

if (!SERP_API_KEY) {
  console.error('❌ SERP_API_KEY not set in .env');
  process.exit(1);
}

console.log('🔍 Testing SerpAPI...');
console.log(`API Key: ${SERP_API_KEY.substring(0, 10)}...`);

const url = new URL('https://serpapi.com/search.json');
url.searchParams.set('q', 'fontanero madrid');
url.searchParams.set('hl', 'es');
url.searchParams.set('gl', 'es');
url.searchParams.set('num', '10');
url.searchParams.set('start', '10');
url.searchParams.set('api_key', SERP_API_KEY);

console.log(`\n📡 URL: ${url.toString()}`);

fetch(url.toString())
  .then(res => {
    console.log(`✅ Status: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    console.log('\n📊 Response Summary:');
    console.log(`   organic_results: ${(data.organic_results || []).length} items`);
    console.log(`   knowledge_graph: ${data.knowledge_graph ? 'yes' : 'no'}`);
    console.log(`   related_searches: ${(data.related_searches || []).length} items`);

    if (data.organic_results && data.organic_results.length > 0) {
      console.log('\n🔗 First 5 results:');
      data.organic_results.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.title}`);
        console.log(`      ${r.link}`);
      });
    } else {
      console.log('\n⚠️  No organic results found');
    }

    if (data.error) {
      console.log(`\n❌ API Error: ${data.error}`);
    }
  })
  .catch(err => {
    console.error(`\n❌ Fetch failed: ${err.message}`);
    process.exit(1);
  });
