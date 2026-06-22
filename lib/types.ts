export type Dynasty = '唐' | '宋' | '元' | '明' | '清' | '其他';

export interface Poet {
  id: string;
  name: string;
  dynasty: Dynasty;
  bio: string;
  worksCount: number;
  birthYear?: number;
  deathYear?: number;
}

export interface Poem {
  id: string;
  poetId: string;
  title: string;
  content: string[];
  form: '五绝' | '七律' | '词牌' | '其他';
  tags?: string[];
}

export interface Relation {
  from: string;
  to: string;
  type: '赠诗' | '提及' | '同题';
  note?: string;
}

export interface GeneratedPoem extends Poem {
  generatedAt: string;
  source: 'local' | 'grok' | 'claude' | 'openai';
}

export type LLMProvider = 'grok' | 'claude' | 'openai';

export interface LLMSettings {
  grok?: string;
  claude?: string;
  openai?: string;
}

export interface GeneratorOptions {
  form: '五绝' | '七律' | '词牌' | '自由';
  temperature: number;
  strictPingze: boolean;
}

export interface AppState {
  favorites: GeneratedPoem[];
  llmKeys: LLMSettings;
  generatorOptions: GeneratorOptions;
  lastMode: 'local' | LLMProvider;
  addFavorite: (poem: GeneratedPoem) => void;
  removeFavorite: (id: string) => void;
  setLLMKeys: (keys: LLMSettings) => void;
  setGeneratorOptions: (opts: Partial<GeneratorOptions>) => void;
  setLastMode: (mode: 'local' | LLMProvider) => void;
  clearAllData: () => void;
}
