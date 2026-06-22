const fs = require('fs');
const path = require('path');
const https = require('https');

// Fetch Song Ci + Tang Shi from chinese-poetry
// Target: ~16000 poems

const BASE_URL = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master';
const DATA_DIR = path.join(__dirname, '../data');

const songCiDir = encodeURI('宋词');
const tangShiDir = encodeURI('全唐诗');

// Song Ci files (8000 poems)
const songCiFiles = Array.from({ length: 8 }, (_, i) => `/${songCiDir}/ci.song.${i * 1000}.json`);

// Tang Shi files (output_tang_shi_0 ... output_tang_shi_57)
// Each file has ~1000 poems, we'll fetch 8 files for ~8000 Tang poems
const tangShiFiles = Array.from({ length: 8 }, (_, i) => `/${tangShiDir}/poet.tang.${i * 1000}.json`);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'poem-cloud-fetcher' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message} (status ${res.statusCode}, first 100 chars: ${data.slice(0, 100)})`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Starting to fetch poems from chinese-poetry...');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let allPoems = [];
  let idCounter = 1;

  // 1. Fetch Song Ci
  console.log('\n=== Fetching Song Ci (宋词) ===');
  for (const file of songCiFiles) {
    const url = `${BASE_URL}${file}`;
    console.log(`Fetching ${url}...`);
    try {
      const data = await fetchJson(url);
      const transformed = data.map(raw => ({
        id: `p_${idCounter++}`,
        title: raw.rhythmic || '无题',
        poetId: `poet_${raw.author}`,
        content: raw.paragraphs || [],
        form: '词牌',
        tags: ['宋词', raw.author],
      }));
      allPoems.push(...transformed);
      console.log(`  ✓ Loaded ${data.length} ci. Total: ${allPoems.length}`);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
  }

  // 2. Fetch Tang Shi
  console.log('\n=== Fetching Tang Shi (全唐诗) ===');
  for (const file of tangShiFiles) {
    const url = `${BASE_URL}${file}`;
    console.log(`Fetching ${url}...`);
    try {
      const data = await fetchJson(url);
      const transformed = data.map(raw => ({
        id: `p_${idCounter++}`,
        title: raw.title || '无题',
        poetId: `poet_${raw.author}`,
        content: raw.paragraphs || [],
        form: '其他',
        tags: ['唐诗', raw.author],
      }));
      allPoems.push(...transformed);
      console.log(`  ✓ Loaded ${data.length} shi. Total: ${allPoems.length}`);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
  }

  // Filter out poems with empty content
  allPoems = allPoems.filter(p => p.content && p.content.length > 0 && p.content[0].length > 0);
  console.log(`\nAfter filtering empty: ${allPoems.length} poems`);

  const outputPath = path.join(DATA_DIR, 'poems-large.json');
  fs.writeFileSync(outputPath, JSON.stringify(allPoems));
  console.log(`\n✓ Saved ${allPoems.length} poems to ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)}MB)`);
}

main();
