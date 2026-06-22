'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Heart, RefreshCw } from 'lucide-react';
import { GeneratedPoem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { copyToClipboard, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface Props {
  poem: GeneratedPoem;
  onRegenerate?: () => void;
}

export function PoemCard({ poem, onRegenerate }: Props) {
  const { addFavorite, removeFavorite, favorites } = useAppStore();
  const isFav = favorites.some((f) => f.id === poem.id);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    const text = `${poem.title}\n\n${poem.content.join('\n')}`;
    await copyToClipboard(text);
    toast.success('已复制到剪贴板');
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a14',
        scale: 2,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${poem.title || '诗云'}.png`;
      a.click();
      toast.success('图片已导出');
    } catch (e) {
      toast.error('导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFav = () => {
    if (isFav) {
      removeFavorite(poem.id);
      toast('已从收藏移除');
    } else {
      addFavorite(poem);
      toast.success('已收藏');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      className="floating-poem cosmic-card rounded-2xl p-7 w-full max-w-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[#f4d35e] text-xl font-semibold tracking-tight">{poem.title}</div>
          <div className="text-xs text-[#7c5cff] mt-0.5 flex items-center gap-2">
            {poem.form} · {poem.source === 'local' ? '本地引擎' : poem.source.toUpperCase()}
            <span className="text-[#6c678f]">· {formatDateTime(poem.generatedAt)}</span>
          </div>
        </div>
        <button onClick={toggleFav} className="text-[#f4d35e] hover:text-white transition">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="poem-text text-[15px] leading-[1.85] text-[#e0d4ff] tracking-[0.015em] mb-6">
        {poem.content.map((line, idx) => (
          <span key={idx} className="poem-line block">{line}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {poem.tags?.slice(0, 3).map((t, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[#c2b8ff]">{t}</span>
        ))}

        <div className="flex-1" />

        {onRegenerate && (
          <Button variant="ghost" size="sm" onClick={onRegenerate} className="h-7 text-[#c2b8ff]">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> 重新生成
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7">
          <Copy className="w-3.5 h-3.5 mr-1" /> 复制
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport} disabled={isExporting} className="h-7">
          <Download className="w-3.5 h-3.5 mr-1" /> 图片
        </Button>
      </div>
    </motion.div>
  );
}
