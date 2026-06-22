import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, GeneratedPoem, LLMSettings, GeneratorOptions, LLMProvider } from './types';

const defaultOptions: GeneratorOptions = {
  form: '七律',
  temperature: 0.75,
  strictPingze: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      llmKeys: {},
      generatorOptions: defaultOptions,
      lastMode: 'local',

      addFavorite: (poem) =>
        set((state) => ({
          favorites: [poem, ...state.favorites.filter((p) => p.id !== poem.id)].slice(0, 100),
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((p) => p.id !== id),
        })),

      setLLMKeys: (keys) => set({ llmKeys: keys }),

      setGeneratorOptions: (opts) =>
        set((state) => ({
          generatorOptions: { ...state.generatorOptions, ...opts },
        })),

      setLastMode: (mode) => set({ lastMode: mode }),

      clearAllData: () =>
        set({
          favorites: [],
          llmKeys: {},
          generatorOptions: defaultOptions,
          lastMode: 'local',
        }),
    }),
    {
      name: 'shiyun-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        llmKeys: state.llmKeys,
        generatorOptions: state.generatorOptions,
        lastMode: state.lastMode,
      }),
    }
  )
);

// Helper: check if any LLM key is present
export function hasLLMKey(keys: LLMSettings): boolean {
  return !!(keys.grok || keys.claude || keys.openai);
}

// Get the first available provider
export function getAvailableProvider(keys: LLMSettings): LLMProvider | null {
  if (keys.grok) return 'grok';
  if (keys.claude) return 'claude';
  if (keys.openai) return 'openai';
  return null;
}
