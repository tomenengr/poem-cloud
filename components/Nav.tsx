'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
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
      </div>
    </nav>
  );
}
