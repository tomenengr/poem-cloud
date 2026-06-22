'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Sparkles, BookOpen, Compass, Settings } from 'lucide-react';

const cards = [
  { href: '/star-map', label: '诗云星图', desc: '3D 交互式诗人星云图，探索赠诗与提及的隐秘关系', icon: Star, color: '#7c5cff' },
  { href: '/generator', label: '诗词生成器', desc: '自然语言提示 → 古典风格诗词。支持本地与 LLM 双引擎', icon: Sparkles, color: '#f4d35e' },
  { href: '/story', label: '原著与哲思', desc: '《诗云》故事摘要与“技术能否穷尽美”的终极追问', icon: BookOpen, color: '#a78bfa' },
  { href: '/explore', label: '诗人探索', desc: '按朝代与作品量浏览诗人，查看全集与关系网络', icon: Compass, color: '#60a5fa' },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden nebula-bg">
      {/* Background subtle stars */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2744_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-50" />

      <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-[3px] mb-6 text-[#c2b8ff]">
          LIU CIXIN × CLASSICAL POETRY × AI
        </div>

        <h1 className="text-[92px] leading-[82px] font-semibold tracking-[-4.2px] mb-4">
          诗云
        </h1>
        <p className="text-2xl text-[#b8b1e6] mb-3 tracking-tight">
          技术穷尽了所有诗<br />却未必穷尽美
        </p>
        <p className="max-w-lg text-[#8a87a8] mb-12">
          源自刘慈欣《诗云》 · 古典诗词星图与 AI 共振
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link key={idx} href={card.href}>
                <motion.div
                  whileHover={{ scale: 1.015, y: -4 }}
                  whileTap={{ scale: 0.985 }}
                  className="cosmic-card group rounded-2xl p-7 text-left h-full flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20`, color: card.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-semibold tracking-tight group-hover:text-white transition">{card.label}</div>
                  </div>
                  <p className="text-[#9f9ac8] flex-1">{card.desc}</p>
                  <div className="text-xs mt-6 text-[#7c5cff] group-hover:translate-x-0.5 transition">进入 →</div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-xs text-[#6c678f]">
          暗黑宇宙风 · 纯前端可运行 · 支持 Grok / Claude / OpenAI 密钥
        </div>
      </div>
    </div>
  );
}
