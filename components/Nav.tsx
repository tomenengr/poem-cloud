'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore, hasLLMKey } from '@/lib/store';
import { Sparkles } from 'lucide-react';

const navItems = [
  { href: '/star-map', label: '星图' },
  { href: '/generator', label: '生成器' },
  { href: '/favorites', label: '收藏' },
  { href: '/story', label: '故事' },
  { href: '/explore', label: '探索' },
  { href: '/settings', label: '设置' },
];

export function Nav() {
  const pathname = usePathname();
  const { llmKeys, lastMode } = useAppStore();
  const hasKey = hasLLMKey(llmKeys);

  const statusText = hasKey 
    ? lastMode === 'grok' ? 'Grok 已连接' 
      : lastMode === 'claude' ? 'Claude 已连接'
      : 'LLM 已就绪'
    : '本地模式';

  const statusColor = hasKey ? 'text-emerald-400 border-emerald-500/40' : 'text-amber-400 border-amber-500/30';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#f4d35e] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-2xl font-semibold tracking-tight group-hover:text-[#c2b8ff] transition-colors">诗云</span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link text-sm font-medium ${active ? 'active text-white' : 'text-[#c2b8ff]/70 hover:text-[#c2b8ff]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`status-pill flex items-center gap-1.5 ${statusColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {statusText}
          </div>
          <Link 
            href="/settings" 
            className="text-xs text-[#8a87a8] hover:text-[#c2b8ff] px-3 py-1 rounded-full hover:bg-white/5 transition"
          >
            配置 LLM
          </Link>
        </div>
      </div>
    </nav>
  );
}
