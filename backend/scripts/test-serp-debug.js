// Debug SerpAPI response structure
import 'dotenv/config';

const SERP_API_KEY = process.env.SERP_API_KEY;

const url = new URL('https://serpapi.com/search.json');
url.searchParams.set('q', 'fontanero madrid');
url.searchParams.set('hl', 'es');
url.searchParams.set('gl', 'es');
url.searchParams.set('num', '10');
url.searchParams.set('start', '10');
url.searchParams.set('api_key', SERP_API_KEY);

fetch(url.toString())
  .then(res => res.json())
  .then(data => {
    console.log('\n📊 Full organic_results structure:');
    console.log(JSON.stringify(data.organic_results?.slice(0, 2), null, 2));

    console.log('\n✅ Keys in first result:', Object.keys(data.organic_results?.[0] || {}));
  })
  .catch(err => console.error('Error:', err.message));
