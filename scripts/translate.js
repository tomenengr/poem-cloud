const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

const converter = OpenCC.Converter({ from: 't', to: 'cn' });

const DATA_FILE = path.join(__dirname, '../public/data/poems-all.json');

console.log('Reading poems-all.json...');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

console.log(`Translating ${data.length} poems to Simplified Chinese...`);

for (let i = 0; i < data.length; i++) {
  const poem = data[i];
  
  if (poem.poetId) {
    poem.poetId = converter(poem.poetId);
  }
  if (poem.title) {
    poem.title = converter(poem.title);
  }
  if (poem.content && Array.isArray(poem.content)) {
    poem.content = poem.content.map(line => converter(line));
  }
  
  if (i % 10000 === 0 && i > 0) {
    console.log(`... translated ${i} poems`);
  }
}

console.log('Writing translated data back to poems-all.json...');
fs.writeFileSync(DATA_FILE, JSON.stringify(data));
console.log('Done!');
