const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../public/data');
const OUT_FILE = path.join(DATA_DIR, 'poems-all.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Based on chinese-poetry repository structure:
// poet.tang.0.json to poet.tang.57000.json
const TANG_LIMIT = 57; 
// ci.song.0.json to ci.song.21000.json
const SONG_CI_LIMIT = 21; 
// poet.song.0.json to poet.song.254000.json
const SONG_SHI_LIMIT = 254; 

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Node.js Poetry Cloud Fetcher'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        resolve(null);
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Starting massive poem fetch (this may take a few minutes)...');
  const allPoems = [];

  const processBatch = async (type, getUrl, maxI) => {
    console.log(`\n=== Fetching ${type} ===`);
    // Run 10 at a time to speed it up without spamming too much
    for (let i = 0; i <= maxI; i += 10) {
      const promises = [];
      for (let j = 0; j < 10 && (i + j) <= maxI; j++) {
        const fileIndex = (i + j) * 1000;
        const url = getUrl(fileIndex);
        promises.push(
          fetchJson(url).then(data => {
            if (data && Array.isArray(data)) {
              let added = 0;
              for (const item of data) {
                const author = item.author || item.poet;
                const title = item.title || item.rhythmic;
                const paragraphs = item.paragraphs;
                if (author && title && paragraphs && paragraphs.length > 0) {
                  allPoems.push({
                    id: item.id || `${type}_${fileIndex}_${added}`,
                    poetId: `poet_${author}`,
                    title: title,
                    content: paragraphs,
                    tags: [type]
                  });
                  added++;
                }
              }
              console.log(`  ✓ Loaded ${added} items from ${fileIndex}.json`);
            }
          })
        );
      }
      await Promise.all(promises);
      console.log(`Batch ${i} to ${i+9} done. Current total: ${allPoems.length}`);
    }
  };

  await processBatch('唐诗', i => `https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E5%85%A8%E5%94%90%E8%AF%97/poet.tang.${i}.json`, TANG_LIMIT);
  await processBatch('宋词', i => `https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E5%AE%8B%E8%AF%8D/ci.song.${i}.json`, SONG_CI_LIMIT);
  await processBatch('宋诗', i => `https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E5%85%A8%E5%AE%8B%E8%AF%97/poet.song.${i}.json`, SONG_SHI_LIMIT);

  console.log(`\nAll done. Total valid poems: ${allPoems.length}`);
  console.log(`Writing to ${OUT_FILE}...`);
  fs.writeFileSync(OUT_FILE, JSON.stringify(allPoems));
  console.log(`✓ Saved ${allPoems.length} poems to ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1)}MB)`);
}

main().catch(console.error);
