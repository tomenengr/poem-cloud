'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function StoryPage() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { author: '伊依', text: '技术能穷尽所有诗，但能否穷尽美？' },
    { author: '大牙', text: '智慧生命的精华和本质，真的是技术无法触及的吗？' },
  ]);

  function postComment() {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, { author: '你', text: comment.trim() }]);
    setComment('');
    toast.success('思考已记录');
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-14">
      <div className="uppercase tracking-[3px] text-xs text-[#7c5cff] mb-3">BEYOND TECHNOLOGY</div>
      <h1 className="text-6xl font-semibold tracking-[-2.2px] mb-8">诗云：碳基与硅基的共鸣</h1>

      <div className="prose prose-invert max-w-none text-[#d8d1ff] leading-relaxed">
        <p className="text-xl text-[#f0edff]">
          在这个由人工智能（LLM）驱动的“赛博诗云”中，我们试图致敬刘慈欣先生的科幻巨作《诗云》。在原著里，神级文明“李白”试图利用毁灭太阳系的庞大物质，通过终极量子计算穷举出所有汉字的排列组合，以此来写出超越人类李白的巅峰之作。
        </p>

        <blockquote className="border-l-2 border-[#7c5cff] pl-6 my-9 text-2xl tracking-tight font-serif italic text-white/90">
          “诗的灵魂不在于汉字的物理组合，而在于能否在无尽的乱码中，检索出那一首蕴含着宇宙间最高美学的排列。”
        </blockquote>

        <p>
          如今，我们不再需要消耗太阳系的质量来穷尽组合。大语言模型和 3D 渲染技术就像是一个微缩版的“诗云引擎”，它通过百亿参数的概率推演，瞬间捕捉人类文明沉淀了五千年的美学规律。从星图的拓扑关系，到粒子长河里的每一次雪花闪烁，都是对中国古典文化在数字时代的震撼重构。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10 text-sm">
          {[
            "“我终于明白，那些写满汉字的存储体，就像银河系一样浩瀚而冰冷。”",
            "“算法能算出平仄的概率，但算不出那份跨越千年的‘怅然若失’。”",
            "“当代码开始吟唱，数字本身就成了浪漫的载体。”",
            "“智慧生命的精华和本质，真的是技术无法触及的吗？”",
          ].map((q, i) => (
            <div key={i} className="cosmic-card p-6 rounded-xl text-[#b8b1e6] leading-relaxed">{q}</div>
          ))}
        </div>
      </div>

      {/* Discussion */}
      <div className="mt-14 border-t border-white/10 pt-10">
        <h3 className="font-semibold mb-4 tracking-tight">哲思讨论区</h3>
        <div className="space-y-3 mb-4">
          {comments.map((c, idx) => (
            <div key={idx} className="cosmic-card px-5 py-3.5 rounded-xl text-sm flex gap-3">
              <div className="text-[#7c5cff] font-medium w-12 shrink-0">{c.author}</div>
              <div className="text-[#e0d4ff]">{c.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="写下你的思考..."
            className="flex-1 bg-black/40 min-h-[72px]"
          />
          <Button onClick={postComment} className="self-end">发布</Button>
        </div>
        <div className="text-[10px] text-[#6c678f] mt-2">仅保存在你浏览器本地</div>
      </div>
    </div>
  );
}
