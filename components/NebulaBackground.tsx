'use client';

import React, { useEffect, useRef } from 'react';

/**
 * 诗云背景：活的、缓慢、寒冷的星云
 * 极致暗黑 + 冷调紫靛 + 体积雾 + 极慢漂移
 * 为首页“诗云”意境服务
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

    // 更冷的星星（少量、细微、银蓝调）
    const stars: Array<{
      x: number; y: number; size: number; alpha: number; speed: number; hue: number;
    }> = [];

    // 体积星云团（冷紫、靛青、极低饱和）
    const nebulae: Array<{
      x: number; y: number; radius: number; alpha: number; hue: number; phase: number; driftX: number; driftY: number;
    }> = [];

    // 初始化星星 —— 更稀疏、更冷、更小
    const starCount = Math.floor(Math.min(width, height) / 5.2);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.98,
        size: Math.random() * 1.1 + 0.35,
        alpha: Math.random() * 0.55 + 0.18,
        speed: Math.random() * 0.004 + 0.0008,
        hue: Math.random() > 0.7 ? 218 : (Math.random() > 0.5 ? 265 : 235)
      });
    }

    // 初始化多层冷调星云
    const nebulaCount = 11;
    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.92,
        radius: 140 + Math.random() * 310,
        alpha: 0.018 + Math.random() * 0.032,
        hue: 252 + Math.random() * 22, // 冷紫靛主调
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.018,
        driftY: (Math.random() - 0.5) * 0.011
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const t = Date.now() / 1000;

      // 极深的宇宙底 + 中心略亮的虚空感
      const baseGrad = ctx.createRadialGradient(
        width * 0.48, height * 0.38, 80,
        width * 0.5, height * 0.55, Math.max(width, height) * 0.95
      );
      baseGrad.addColorStop(0, 'rgba(6, 5, 14, 0.35)');
      baseGrad.addColorStop(0.42, 'rgba(3, 2, 9, 0.08)');
      baseGrad.addColorStop(1, 'rgba(1, 1, 3, 0.0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 多层冷星云气体（体积感）
      nebulae.forEach((n, i) => {
        const slow = t * 0.028;
        const px = n.x + Math.sin(slow * 0.7 + n.phase + i) * 26 * (i % 3 === 0 ? 1.2 : 0.7);
        const py = n.y + Math.cos(slow * 0.5 + n.phase * 1.3) * 18;

        // 柔和多重径向渐变模拟体积云
        const g1 = ctx.createRadialGradient(
          px - 18, py - 24, n.radius * 0.08,
          px + Math.sin(slow * 0.3 + i) * 9, py, n.radius * 0.92
        );
        const a = n.alpha * (0.82 + Math.sin(t * 0.11 + i) * 0.18);

        g1.addColorStop(0, `hsla(${n.hue}, 68%, 78%, ${a * 1.15})`);
        g1.addColorStop(0.35, `hsla(${n.hue + 8}, 52%, 64%, ${a * 0.72})`);
        g1.addColorStop(0.68, `hsla(${n.hue + 14}, 38%, 52%, ${a * 0.38})`);
        g1.addColorStop(1, 'transparent');

        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(px, py, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // 第二层更淡的延伸（让云有形状）
        const g2 = ctx.createRadialGradient(
          px + 30, py + 12, n.radius * 0.22,
          px + 42, py - 8, n.radius * 1.35
        );
        g2.addColorStop(0, `hsla(${n.hue - 6}, 45%, 70%, ${a * 0.55})`);
        g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(px + 28, py + 6, n.radius * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // 极慢漂移
        n.x += n.driftX + Math.sin(t * 0.009 + i) * 0.008;
        n.y += n.driftY + Math.cos(t * 0.007 + i * 0.7) * 0.007;

        // 边界循环
        if (n.x < -80) n.x = width + 60;
        if (n.x > width + 80) n.x = -60;
        if (n.y < -60) n.y = height + 40;
        if (n.y > height + 50) n.y = -40;
      });

      // 冷调细星 + 极淡光晕
      stars.forEach((s, i) => {
        const twinkle = Math.sin(t * 0.9 + i * 1.7) * 0.5 + 0.5;
        const a = s.alpha * (0.55 + twinkle * 0.45);

        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `hsl(${s.hue}, 62%, 91%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // 非常细微的光晕（只给稍大的星）
        if (s.size > 0.9) {
          ctx.globalAlpha = a * 0.16;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 极缓慢垂直漂移 + 微横移
        s.y += s.speed;
        s.x += Math.sin(t * 0.12 + i) * 0.012;

        if (s.y > height * 0.995) {
          s.y = -4;
          s.x = Math.random() * width;
        }
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
      });

      // 极淡的整体冷雾层（增加空气感）
      const mist = ctx.createRadialGradient(
        width * 0.5, height * 0.42, height * 0.2,
        width * 0.5, height * 0.58, height * 1.05
      );
      mist.addColorStop(0, 'hsla(258, 40%, 88%, 0.015)');
      mist.addColorStop(0.6, 'hsla(245, 30%, 80%, 0.006)');
      mist.addColorStop(1, 'transparent');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, width, height);

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
      style={{ mixBlendMode: 'screen', opacity: 0.96 }}
    />
  );
}
