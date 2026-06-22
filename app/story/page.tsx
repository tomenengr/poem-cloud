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
      <div className="uppercase tracking-[3px] text-xs text-[#7c5cff] mb-3">THE POETRY CLOUD</div>
      <h1 className="text-6xl font-semibold tracking-[-2.2px] mb-8">原著与哲思</h1>

      <div className="prose prose-invert max-w-none text-[#d8d1ff] leading-relaxed">
        <p className="text-xl">
          《诗云》是刘慈欣“大艺术系列”之一。神级文明化身李白，试图用穷举所有汉字组合的方式超越李白，创造“诗云”——包含一切可能诗篇的实体。
        </p>

        <blockquote className="border-l-2 border-[#7c5cff] pl-6 my-9 text-2xl tracking-tight">
          “技术能穷尽所有诗，但能否穷尽美？”
        </blockquote>

        <p>
          最终，神放弃了单纯的穷举，转而将诗云留给了人类。它在南极的空心地球内侧，用宇宙尺度保存了每一首可能的诗。然而，美，始终需要有温度的读者去发现。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10 text-sm">
          {[
            "今天，天空和海水都很清澈，对于做诗来说，世界显得太透明了。",
            "这就是新世界的创造者，伟大的——李白。",
            "智慧生命的精华和本质，真的是技术无法触及的吗？",
          ].map((q, i) => (
            <div key={i} className="cosmic-card p-6 rounded-xl text-[#b8b1e6]">{q}</div>
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
