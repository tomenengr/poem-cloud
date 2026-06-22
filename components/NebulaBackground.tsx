'use client';

import React, { useEffect, useRef } from 'react';

/**
 * 绚烂星云背景（2D Canvas）
 * 放在 3D Canvas 之下，提供柔和的星云雾 + 缓慢漂浮的星星
 * 让画面明显更“诗云”与宏大绚烂
 */
export function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: Array<{x: number; y: number; size: number; alpha: number; speed: number; hue: number}> = [];
    const nebulae: Array<{x: number; y: number; radius: number; alpha: number; hue: number}> = [];

    // 初始化星星
    for (let i = 0; i < 280; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.95,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.25,
        speed: Math.random() * 0.012 + 0.003,
        hue: Math.random() > 0.6 ? 260 : (Math.random() > 0.5 ? 42 : 195)
      });
    }

    // 柔和星云团
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        radius: 180 + Math.random() * 260,
        alpha: 0.035 + Math.random() * 0.045,
        hue: i % 2 === 0 ? 265 : 48
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 极淡的整体宇宙渐变
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.4, 120, width * 0.5, height * 0.6, Math.max(width, height) * 0.9);
      grad.addColorStop(0, 'rgba(12, 10, 28, 0.15)');
      grad.addColorStop(1, 'rgba(5, 5, 10, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 绘制星云雾团
      nebulae.forEach((n, i) => {
        const g = ctx.createRadialGradient(n.x, n.y, n.radius * 0.1, n.x + Math.sin(Date.now() / 18000 + i) * 12, n.y, n.radius);
        g.addColorStop(0, `hsla(${n.hue}, 65%, 72%, ${n.alpha})`);
        g.addColorStop(0.55, `hsla(${n.hue + 20}, 55%, 55%, ${n.alpha * 0.55})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // 轻微漂移
        n.x += Math.sin(Date.now() / 26000 + i) * 0.12;
        n.y += Math.cos(Date.now() / 31000 + i) * 0.08;
      });

      // 绘制星星
      stars.forEach((s, i) => {
        ctx.save();
        ctx.globalAlpha = s.alpha * (0.6 + Math.sin(Date.now() / 420 + i) * 0.4);
        ctx.fillStyle = `hsl(${s.hue}, 80%, 92%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // 极细的闪烁光晕
        if (s.size > 1.1) {
          ctx.globalAlpha = s.alpha * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 缓慢漂浮
        s.y += s.speed;
        if (s.y > height * 0.97) {
          s.y = 8;
          s.x = Math.random() * width;
        }
      });

      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: 'screen', opacity: 0.92 }}
    />
  );
}
