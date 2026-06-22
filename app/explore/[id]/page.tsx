'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import poetsData from '@/data/poets.json';
import poemsData from '@/data/poems.json';
import relationsData from '@/data/relations.json';
import { Poet, Poem, Relation } from '@/lib/types';
import { Button } from '@/components/ui/button';

const poets = poetsData as Poet[];
const poems = poemsData as Poem[];
const relations = relationsData as Relation[];

export default function PoetDetail() {
  const params = useParams<{ id: string }>();
  const poet = poets.find((p) => p.id === params.id);

  if (!poet) {
    return <div className="p-12">诗人未找到 <Link href="/explore">返回</Link></div>;
  }

  const poetPoems = poems.filter((p) => p.poetId === poet.id);
  const related = relations
    .filter((r) => r.from === poet.id || r.to === poet.id)
    .map((r) => {
      const oid = r.from === poet.id ? r.to : r.from;
      return { poet: poets.find((pp) => pp.id === oid)!, relation: r };
    })
    .filter((x) => x.poet);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <Link href="/explore" className="text-xs text-[#7c5cff]">← 返回列表</Link>

      <div className="mt-4 flex items-end gap-4">
        <h1 className="text-6xl font-semibold tracking-[-2px]">{poet.name}</h1>
        <span className="text-2xl text-[#c2b8ff] mb-2">{poet.dynasty}</span>
      </div>
      <p className="mt-1 text-[#9f9ac8]">{poet.bio}</p>

      <div className="mt-10">
        <div className="uppercase text-xs tracking-[2px] text-[#7c5cff] mb-3">全部作品</div>
        <div className="space-y-8">
          {poetPoems.length ? poetPoems.map((p) => (
            <div key={p.id} className="border-l-2 border-[#7c5cff] pl-6">
              <div className="text-[#f4d35e] mb-1">{p.title}</div>
              <div className="poem-text leading-relaxed text-lg text-[#e0d4ff]">
                {p.content.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          )) : <div className="text-sm text-[#6c678f]">暂无作品数据（mock）</div>}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <div className="uppercase text-xs tracking-[2px] text-[#7c5cff] mb-3">关系网络</div>
          <div className="flex flex-wrap gap-2">
            {related.map(({ poet: rp, relation }) => (
              <Link key={rp.id} href={`/explore/${rp.id}`}>
                <div className="cosmic-card px-4 py-2 text-sm rounded-xl inline-flex items-center gap-2 hover:border-[#7c5cff]">
                  {rp.name} <span className="text-[#7c5cff] text-xs">· {relation.type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link href={`/generator?inspire=${poet.id}`}>
          <Button className="cosmic-btn">以 {poet.name} 风格生成新诗</Button>
        </Link>
      </div>
    </div>
  );
}
