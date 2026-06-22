'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { PoemCard } from '@/components/PoemCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearAllData } = useAppStore();

  function handleRemove(id: string) {
    removeFavorite(id);
    toast('已移除');
  }

  function handleRegenerate(poem: any) {
    // Use the poem's title + tags as inspiration to generator
    const base = poem.title || '月夜';
    const q = encodeURIComponent(`模仿古典风格续写：${base}`);
    window.location.href = `/generator?prompt=${q}`;
  }

  function clearAll() {
    if (!confirm('清空所有收藏的诗？')) return;
    // Only clear favorites, keep other data
    // Since store has no partial clear exposed, we manually set via direct? For simplicity re-use or direct
    // We can iterate remove, but better expose or just for now:
    favorites.forEach(p => removeFavorite(p.id));
    toast.success('收藏已全部清空');
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="uppercase tracking-[2px] text-xs text-[#7c5cff] mb-1">COLLECTION</div>
          <h1 className="text-5xl font-semibold tracking-[-1.5px]">我的收藏</h1>
          <p className="text-[#8a87a8] mt-1">在生成器里用 ❤️ 收藏的诗会保存在这里（浏览器本地）</p>
        </div>
        {favorites.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="border-white/15 text-[#8a87a8]">
            清空收藏
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="cosmic-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">✧</div>
          <div className="text-xl mb-2">还没有收藏任何诗</div>
          <p className="text-[#8a87a8] mb-6">去「诗词生成器」生成几首，点击诗卡上的心形收藏吧</p>
          <Link href="/generator">
            <Button className="cosmic-btn">前往生成器</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {favorites.map((poem) => (
            <div key={poem.id} className="relative group">
              <PoemCard 
                poem={poem} 
                onRegenerate={() => handleRegenerate(poem)} 
              />
              <button
                onClick={() => handleRemove(poem.id)}
                className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-black/50 text-[#c2b8ff] hover:bg-red-500/20 hover:text-red-300 opacity-70 group-hover:opacity-100 transition"
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-xs text-[#6c678f]">
        收藏数据仅存储在你的浏览器（localStorage）。清除浏览器数据或使用「设置」里的「清除所有本地数据」会丢失它们。
      </div>
    </div>
  );
}
