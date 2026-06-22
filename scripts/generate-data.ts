/**
 * scripts/generate-data.ts
 * 
 * 使用真实 chinese-poetry 数据生成 mock 格式。
 * 
 * 步骤：
 * 1. git clone https://github.com/chinese-poetry/chinese-poetry.git
 * 2. cd chinese-poetry
 * 3. npm i -g tsx (or use ts-node)
 * 4. 在本项目根目录： npx tsx scripts/generate-data.ts /path/to/chinese-poetry
 *
 * 本脚本会输出 data/poets.json data/poems.json data/relations.json
 *
 * 当前使用 mock 数据。请在需要时替换。
 */

import fs from 'fs';
import path from 'path';

console.log('此脚本为占位说明脚本。');
console.log('真实实现可遍历 poet.tang.*.json / poet.song.*.json 等文件，构建：');
console.log('- 诗人：id, name, dynasty, bio(可从外部补充), worksCount');
console.log('- 诗词：id, poetId, title, content[], form');
console.log('- 关系：可基于同一朝代或已知交游硬编码，或简单同集出现关系。');
console.log('示例运行：npx tsx scripts/generate-data.ts ~/Downloads/chinese-poetry');
process.exit(0);
