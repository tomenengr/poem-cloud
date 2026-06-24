'use client';

import { TimeRiver } from '@/components/TimeRiver';
import { NebulaBackground } from '@/components/NebulaBackground';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[#010104]">
      {/* 极冷星云体积层 —— 为全景增加空气与深度 */}
      <NebulaBackground />

      {/* 3D 宏大诗云时间长河主场景：逆流而上、飞入诗云 —— 全景动态 */}
      <TimeRiver />

      {/* 多层底部渐隐 + 边缘暗角，强化沉浸宏大感 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none bg-gradient-to-t from-[#010104] via-[#010104]/90 to-transparent" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_50%_42%,transparent_46%,rgba(1,1,4,0.38)_78%,rgba(1,1,3,0.55)_94%)]" />
    </div>
  );
}
