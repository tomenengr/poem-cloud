'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import poetsData from '@/data/poets.json';
import poemsData from '@/data/poems.json';
import { Poet } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const poets = poetsData as Poet[];

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'works' | 'name'>('works');

  const filtered = useMemo(() => {
    let list = [...poets];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((p) => p.name.includes(search) || p.dynasty.includes(search));
    }
    if (sort === 'works') {
      list.sort((a, b) => b.worksCount - a.worksCount);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    }
    return list;
  }, [search, sort]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="text-5xl font-semibold tracking-tight mb-7">探索诗人</h1>

      <div className="flex gap-3 mb-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索姓名或朝代..."
          className="max-w-xs"
        />
        <Button variant="outline" onClick={() => setSort(sort === 'works' ? 'name' : 'works')}>
          按{sort === 'works' ? '作品数' : '姓名'}排序
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((poet) => (
          <Link key={poet.id} href={`/explore/${poet.id}`}>
            <div className="cosmic-card p-6 rounded-2xl group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl tracking-tight font-semibold group-hover:text-[#7c5cff]">{poet.name}</div>
                  <div className="text-[#7c5cff] text-sm">{poet.dynasty}</div>
                </div>
                <div className="text-right text-xs text-[#9f9ac8]">
                  {poet.worksCount} 首
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-[#b8b1e6]">{poet.bio}</p>
              <div className="text-xs mt-5 text-[#6c678f] group-hover:text-[#c2b8ff]">查看全部作品与关系 →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
