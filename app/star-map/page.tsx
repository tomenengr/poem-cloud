'use client';

import dynamic from 'next/dynamic';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dynasty, Poem } from '@/lib/types';

const PoetryCloud = dynamic(() => import('@/components/PoetryCloud'), { ssr: false });
const StarMap = dynamic(() => import('@/components/StarMap'), { ssr: false });

type Mode = 'poetry-cloud' | 'relationship';

// Extract helpers here since we don't import from PoetryCloud directly anymore
function getPoetName(poetId: string): string {
  return poetId.replace('poet_', '');
}

function getPoetDynasty(poem: Poem): string {
  if (poem.tags?.includes('唐诗')) return '唐';
  if (poem.tags?.includes('宋词')) return '宋';
  return '其他';
}

function usePoetList(poems: Poem[] | null) {
  return useMemo(() => {
    if (!poems || poems.length === 0) return [];
    try {
      const poetMap = new Map<string, { name: string; dynasty: string; poems: { id: string; title: string }[]; count: number }>();
      
      for (const poem of poems) {
        const name = getPoetName(poem.poetId);
        const dynasty = getPoetDynasty(poem);
        if (!poetMap.has(name)) {
          poetMap.set(name, { name, dynasty, poems: [], count: 0 });
        }
        const entry = poetMap.get(name)!;
        entry.count++;
        if (entry.poems.length < 20) { // Limit displayed poems per poet
          entry.poems.push({ id: poem.id, title: poem.title });
        }
      }

      return Array.from(poetMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 60);
    } catch {
      return [];
    }
  }, [poems]);
}

export default function StarMapPage() {
  const [mode, setMode] = useState<Mode>('poetry-cloud');
  const [search, setSearch] = useState('');
  const [filterDynasty, setFilterDynasty] = useState<Dynasty | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPoet, setExpandedPoet] = useState<string | null>(null);
  
  // Async Data State
  const [poems, setPoems] = useState<Poem[] | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('连接宇宙数据库...');

  const poetryCloudRef = useRef<{ flyToPoem: (poemId: string) => void }>(null);

  useEffect(() => {
    setLoadingMsg('下载十万诗词星图...');
    fetch('/data/poems-all.json')
      .then(res => res.json())
      .then(data => {
        setLoadingMsg('点亮星系...');
        setTimeout(() => setPoems(data), 100);
      })
      .catch(err => {
        console.error('Failed to load poems:', err);
        setPoems([]);
      });
  }, []);

  const poetList = usePoetList(poems);
  const dynasties: Dynasty[] = ['唐', '宋', '其他'];

  const filteredPoets = useMemo(() => {
    if (!search) return poetList;
    const s = search.toLowerCase();
    return poetList.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.poems.some(poem => poem.title.toLowerCase().includes(s))
    );
  }, [poetList, search]);

  const handlePoemSelect = (poemId: string) => {
    if (poetryCloudRef.current) {
      poetryCloudRef.current.flyToPoem(poemId);
    }
  };

  if (!poems) {
    return (
      <div className="h-[calc(100vh-4rem)] relative flex flex-col items-center justify-center bg-black text-[#c4b5fd]">
        <div className="w-16 h-16 border-4 border-[#7c5cff] border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(124,92,255,0.5)]"></div>
        <h2 className="text-2xl font-['Ma_Shan_Zheng'] tracking-widest text-[#f0edff] mb-2">{loadingMsg}</h2>
        <p className="text-sm opacity-60">首次加载包含约数十万颗粒子的全量数据，需要 1-3 秒</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative overflow-hidden bg-black">

      {/* Top control bar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/90 border border-white/10 rounded-full px-2 py-1 backdrop-blur pointer-events-none">
        <button
          onClick={() => setMode('poetry-cloud')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition pointer-events-auto ${mode === 'poetry-cloud' ? 'bg-[#7c5cff] text-white' : 'text-[#8a87a8] hover:text-white hover:bg-white/5'}`}
        >
          诗云模式
        </button>
        <button
          onClick={() => setMode('relationship')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition pointer-events-auto ${mode === 'relationship' ? 'bg-[#7c5cff] text-white' : 'text-[#8a87a8] hover:text-white hover:bg-white/5'}`}
        >
          关系图模式
        </button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={mode === 'poetry-cloud' ? '搜索诗词或诗人...' : '搜索诗人...'}
          className="w-52 bg-black/40 border-white/15 h-8 text-sm pointer-events-auto rounded-full px-4 text-white placeholder:text-[#6c678f]"
        />

        {/* Sidebar toggle */}
        {mode === 'poetry-cloud' && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 py-1.5 text-sm font-medium rounded-full border border-white/15 text-[#c4b5fd] hover:bg-white/5 pointer-events-auto transition ml-1 bg-black/40"
          >
            {sidebarOpen ? '隐藏诗人' : '诗人列表'}
          </button>
        )}
      </div>

      {/* ===== Left Sidebar: Poet List ===== */}
      {mode === 'poetry-cloud' && sidebarOpen && (
        <div className="absolute top-14 left-0 bottom-0 w-64 z-40 bg-black/85 border-r border-white/8 backdrop-blur-sm overflow-y-auto custom-poem-scroll pointer-events-auto">
          <div className="p-3 pt-5">
            <h3 className="text-xs text-[#8a87a8] uppercase tracking-widest mb-3">诗人列表 · {filteredPoets.length}</h3>
            {filteredPoets.map((poet) => (
              <div key={poet.name} className="mb-1">
                <button
                  onClick={() => setExpandedPoet(expandedPoet === poet.name ? null : poet.name)}
                  className="w-full text-left px-3 py-1.5 rounded text-sm hover:bg-white/5 transition flex justify-between items-center group"
                >
                  <span className="text-[#e0d4ff] group-hover:text-white">{poet.name}</span>
                  <span className="text-[10px] text-[#6c678f]">{poet.dynasty} · {poet.poems.length}首</span>
                </button>
                {expandedPoet === poet.name && (
                  <div className="ml-4 mt-1 mb-2 border-l border-white/8 pl-3">
                    {poet.poems.map((poem) => (
                      <button
                        key={poem.id}
                        onClick={() => handlePoemSelect(poem.id)}
                        className="block w-full text-left text-xs text-[#9f9ac8] hover:text-[#f4d35e] py-1 transition truncate"
                        title={poem.title}
                      >
                        {poem.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      {mode === 'poetry-cloud' ? (
        <div className="h-full">
          <PoetryCloud ref={poetryCloudRef} poems={poems} filterDynasty={filterDynasty} searchTerm={search} />
        </div>
      ) : (
        <div className="h-full">
          <StarMap 
            externalSearch={search} 
            externalDynastyFilter={filterDynasty} 
          />
        </div>
      )}

      {mode !== 'poetry-cloud' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[#6c678f] z-40 pointer-events-none">
          诗人关系星图 · 拖拽 · 点击诗人查看
        </div>
      )}
    </div>
  );
}
