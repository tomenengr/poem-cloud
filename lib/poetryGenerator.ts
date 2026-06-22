import { Poem, GeneratedPoem, Poet } from './types';
import poets from '@/data/poets.json';
import poems from '@/data/poems.json';

const THEME_MAP: Record<string, string[]> = {
  moon: ['月', '明月', '清辉', '玉盘', '银钩'],
  night: ['夜', '星', '霜', '露', '寒'],
  homesick: ['乡', '故乡', '思', '归', '望'],
  wine: ['酒', '樽', '杯', '酌', '醉'],
  nature: ['山', '水', '松', '云', '风', '江', '河'],
  patriot: ['国', '家', '中原', '北定', '山河'],
  love: ['情', '思', '泪', '梦', '相', '别'],
  autumn: ['秋', '落叶', '雁', '霜', '枫'],
};

const FIVE_JUE_TEMPLATES = [
  ['A1', 'B2', 'C3', 'D4'],
  ['月下', 'A1', 'B2', '思乡'],
];

const SEVEN_LV_TEMPLATES = [
  ['A1 B2 C3 D4', 'E5 F6 G7 H8'],
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(Math.abs(Math.sin(seed) * 10000)) % arr.length];
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h;
}

function extractThemes(prompt: string): string[] {
  const p = prompt.toLowerCase();
  const themes: string[] = [];
  Object.keys(THEME_MAP).forEach((key) => {
    if (p.includes(key) || p.includes(THEME_MAP[key][0])) themes.push(key);
  });
  if (themes.length === 0) themes.push('nature', 'moon');
  return themes;
}

function sampleVocab(themes: string[], count: number, seed: number): string[] {
  let pool: string[] = [];
  themes.forEach((t) => {
    pool = pool.concat(THEME_MAP[t] || []);
  });
  pool = pool.concat(['云', '风', '花', '酒', '梦', '泪', '山', '江', '雁', '霜']);
  const unique = Array.from(new Set(pool));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pick(unique, seed + i * 17));
  }
  return result;
}

function buildLine(words: string[], length: 5 | 7, strict: boolean = false): string {
  // strictPingze: use more classical, repeatable structure and traditional connectors
  let line = '';
  let idx = 0;
  const connectors = strict
    ? ['山', '水', '月', '风', '云', '江', '花', '梦', '酒', '思']
    : ['上', '中', '下', '前', '后', '间', '来', '去', '望', '思'];
  const classicPairs = ['明月', '清风', '孤舟', '青山', '白云', '长河', '落日', '寒星'];

  if (strict) {
    // More deliberate: alternate vocab + classic fragment for rhythm feel
    while (line.length < length) {
      if (line.length === 0 && Math.random() > 0.4) {
        const pair = classicPairs[idx % classicPairs.length];
        line += pair.slice(0, Math.min(3, length));
      } else {
        const w = words[idx % words.length];
        line += w;
      }
      idx++;
      if (line.length < length && Math.random() > (strict ? 0.35 : 0.5)) {
        line += connectors[idx % connectors.length];
      }
    }
  } else {
    while (line.length < length) {
      const w = words[idx % words.length];
      line += w;
      idx++;
      if (line.length < length - 1 && Math.random() > 0.5) {
        line += connectors[idx % connectors.length];
      }
    }
  }
  return line.slice(0, length);
}

function generateTitle(themes: string[], poetName: string, seed: number): string {
  const heads = ['夜', '秋', '月', '酒', '梦', '思', '望', '江', '山'];
  const h = pick(heads, seed);
  if (themes.includes('homesick')) return `${h}思`;
  if (themes.includes('patriot')) return `${h}怀`;
  return `${h}下独酌`;
}

function mimicPoetStyle(poetId: string): { formBias: string; flavorWords: string[] } {
  const poetPoems = (poems as Poem[]).filter((p) => p.poetId === poetId);
  const bias = poetPoems.length > 0 ? poetPoems[0].form : '七律';
  const flavors = poetPoems.flatMap((p) => p.content).slice(0, 6);
  return { formBias: bias, flavorWords: flavors.length ? flavors : ['月', '山', '酒'] };
}

export function generateLocalPoem(
  prompt: string,
  opts: { form: '五绝' | '七律' | '词牌' | '自由'; seed?: number; strictPingze?: boolean }
): GeneratedPoem {
  const seed = opts.seed ?? hashString(prompt);
  const themes = extractThemes(prompt);
  const vocab = sampleVocab(themes, 12, seed);

  // pick a poet to mimic
  const poetList = poets as Poet[];
  const poet = pick(poetList, seed + 3);

  const { flavorWords } = mimicPoetStyle(poet.id);

  const allWords = [...vocab, ...flavorWords.map((l) => l.slice(0, 2))];

  let lines: string[] = [];
  let formUsed: GeneratedPoem['form'] = '七律';
  const strict = !!opts.strictPingze;

  if (opts.form === '五绝' || (opts.form === '自由' && (seed % 5 === 0))) {
    formUsed = '五绝';
    for (let i = 0; i < 4; i++) {
      lines.push(buildLine(allWords, 5, strict));
    }
  } else if (opts.form === '词牌') {
    formUsed = '词牌';
    lines = [
      buildLine(allWords, 7, strict) + '，',
      buildLine(allWords, 5, strict) + '。',
      buildLine(allWords, 7, strict) + '，',
      buildLine(allWords, 7, strict) + '。',
    ];
  } else {
    formUsed = '七律';
    for (let i = 0; i < 8; i++) {
      lines.push(buildLine(allWords, 7, strict));
    }
  }

  const title = generateTitle(themes, poet.name, seed);

  return {
    id: `gen-${Date.now()}-${seed}`,
    poetId: poet.id,
    title,
    content: lines,
    form: formUsed,
    tags: ['本地生成', poet.name],
    generatedAt: new Date().toISOString(),
    source: 'local',
  };
}

// Very light enhancement using dataset for flavor
export function getRandomPoemFromData(): Poem | null {
  const list = poems as Poem[];
  return list[Math.floor(Math.random() * list.length)] || null;
}
