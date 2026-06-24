'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import poetsData from '@/data/poets.json';
import poemsData from '@/data/poems.json';
import relationsData from '@/data/relations.json';
import { Poet, Poem, Relation, Dynasty } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const poets = poetsData as Poet[];
const poems = poemsData as Poem[];
const relations = relationsData as Relation[];

const DYNASTY_COLORS: Record<Dynasty, string> = {
  '唐': '#f4c95d',   // 温暖金橙（唐诗盛世）
  '宋': '#a78bfa',   // 冷艳紫蓝（宋词婉约）
  '元': '#60b3c9',
  '明': '#f472b6',
  '清': '#34d399',
  '其他': '#c4b5fd',
};

function getPosition(id: string, idx: number, total: number): [number, number, number] {
  // Fibonacci sphere distribution for perfectly even spacing
  const phi = Math.acos(1 - 2 * (idx + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * idx;

  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = 38 + (hash % 12); // expanded base radius from 22 to 38

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta) * 0.85; // slightly squashed y for a galaxy feel
  const z = r * Math.cos(phi);
  return [x, y, z];
}

interface PoetNodeProps {
  poet: Poet;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  visible: boolean;
}

function PoetNode({ poet, position, isSelected, onClick, visible }: PoetNodeProps) {
  const color = DYNASTY_COLORS[poet.dynasty];
  const baseSize = Math.max(0.7, Math.min(1.75, 0.65 + poet.worksCount / 62));
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const glowRef = React.useRef<THREE.Mesh>(null!);
  const outerRef = React.useRef<THREE.Mesh>(null!);

  const isMatch = visible; // 搜索时外部会控制 visible 更亮

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 1.6 + poet.worksCount) * 0.045;

    // 核心轻微脉动
    const yBob = Math.sin(t * 0.5 + (poet.worksCount % 5)) * 0.2;
    meshRef.current.position.set(position[0], position[1] + yBob, position[2]);
    
    // Pulse the core intensely
    meshRef.current.scale.setScalar(pulse * (isSelected ? 1.5 : 1));

    if (glowRef.current) {
      glowRef.current.position.set(position[0], position[1] + yBob, position[2]);
      glowRef.current.scale.setScalar(pulse * 1.8 * (isSelected ? 1.5 : 1));
      // Rotate glow slightly
      glowRef.current.rotation.y = t * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.position.set(position[0], position[1] + yBob, position[2]);
      outerRef.current.scale.setScalar(2.5 + Math.sin(t * 1.2) * 0.15);
      outerRef.current.rotation.z = t * -0.15;
    }
  });

  if (!visible) return null;

  const hoverScale = isSelected ? 1.32 : 1;

  return (
    <group>
      {/* 外层大气光晕 - Additive blending for true glow */}
      <mesh
        ref={outerRef}
        position={position}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[baseSize * 1.2, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.3 : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 中层高亮柔和发光球 */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[baseSize * 0.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.6 : 0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 核心实体星体（纯白核心 + Bloom） */}
      <mesh
        ref={meshRef}
        position={position}
      >
        <sphereGeometry args={[baseSize * 0.35, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isSelected ? 1 : 0.8} />
      </mesh>

      {/* 动态星轨内环 */}
      <mesh position={position} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <ringGeometry args={[baseSize * 1.6, baseSize * 1.65, 64]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.8 : 0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 名字标签 */}
      <Html position={[position[0], position[1] + baseSize * 2.5, position[2]]} center style={{ pointerEvents: 'none' }} zIndexRange={[0, 0]}>
        <div 
          className={`star-label px-3 py-px rounded-md transition-all ${isSelected ? 'text-white bg-[#7c5cff]/80 scale-110' : 'text-[#e0d4ff]/95'}`}
          style={{ 
            textShadow: isSelected ? '0 0 8px rgba(124,92,255,0.8)' : '0 1px 4px rgba(0,0,0,0.75)',
            fontSize: isSelected ? '14px' : '12.5px'
          }}
        >
          {poet.name}
        </div>
      </Html>
    </group>
  );
}

interface RelationLineProps {
  fromPos: [number, number, number];
  toPos: [number, number, number];
  visible: boolean;
}

function RelationLine({ fromPos, toPos, visible }: RelationLineProps) {
  const points = useMemo(() => {
    const mid: [number, number, number] = [
      (fromPos[0] + toPos[0]) / 2,
      (fromPos[1] + toPos[1]) / 2 + 5.0, // Majestic arch
      (fromPos[2] + toPos[2]) / 2,
    ];
    return [
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...toPos),
    ];
  }, [fromPos, toPos]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.015, 8, false), [curve]);
  const glowTube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.08, 8, false), [curve]);

  if (!visible) return null;

  return (
    <group>
      {/* 外层绚烂柔光能量带 */}
      <mesh geometry={glowTube}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 核心高亮光束 */}
      <mesh geometry={tube}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

interface SceneProps {
  visiblePoets: Poet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchTerm: string;
  showPoemRelationsOnly?: boolean;
}

function Scene({ visiblePoets, selectedId, onSelect, searchTerm, showPoemRelationsOnly = false }: SceneProps) {
  const { camera } = useThree();
  const poetPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    visiblePoets.forEach((p, i) => map.set(p.id, getPosition(p.id, i, visiblePoets.length)));
    return map;
  }, [visiblePoets]);

  // Filter relations to only those between visible poets
  const visibleRelations = useMemo(() => {
    const ids = new Set(visiblePoets.map((p) => p.id));
    let rels = relations.filter((r) => ids.has(r.from) && ids.has(r.to));

    if (showPoemRelationsOnly) {
      rels = rels.filter(r => r.note && r.note.length > 2);
    }
    return rels;
  }, [visiblePoets, showPoemRelationsOnly]);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[30, 40, -20]} intensity={0.6} color="#c4b5fd" />

      {/* Background stars */}
      <Stars radius={260} depth={40} count={420} factor={2.8} saturation={0} fade speed={0.4} />

      {/* Poet nodes - search 时高亮匹配 */}
      {visiblePoets.map((poet, idx) => {
        const pos = poetPositions.get(poet.id)!;
        const matchesSearch = !searchTerm || poet.name.includes(searchTerm) || poet.dynasty.includes(searchTerm);
        return (
          <PoetNode
            key={poet.id}
            poet={poet}
            position={pos}
            isSelected={selectedId === poet.id}
            onClick={() => onSelect(poet.id)}
            visible={matchesSearch}
          />
        );
      })}

      {/* Relations */}
      {visibleRelations.map((rel, idx) => {
        const a = poetPositions.get(rel.from);
        const b = poetPositions.get(rel.to);
        if (!a || !b) return null;
        return <RelationLine key={idx} fromPos={a} toPos={b} visible />;
      })}

      {/* Cinematic Post Processing for StarMap */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.0} mipmapBlur />
        {/* @ts-ignore */}
        <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} blendFunction={BlendFunction.NORMAL} />
        <Vignette eskil={false} offset={0.1} darkness={0.9} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.08}
        autoRotate={!selectedId} // Auto rotate when not zoomed in on someone
        autoRotateSpeed={0.8}
        minDistance={8}
        maxDistance={120}
      />
    </>
  );
}

interface StarMapProps {
  externalSearch?: string;
  externalDynastyFilter?: Dynasty | null;
}

export default function StarMap({ externalSearch = '', externalDynastyFilter = null }: StarMapProps) {
  const [search, setSearch] = useState('');
  const [selectedDynasties, setSelectedDynasties] = useState<Dynasty[]>(['唐', '宋', '其他']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPoemRelationsOnly, setShowPoemRelationsOnly] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const allDynasties: Dynasty[] = ['唐', '宋', '其他'];

  const effectiveSearch = externalSearch || search;
  const effectiveFilter = externalDynastyFilter || (selectedDynasties.length < 3 ? selectedDynasties[0] : null);

  const filteredPoets = useMemo(() => {
    return poets.filter((p) => {
      const matchesDyn = !effectiveFilter || p.dynasty === effectiveFilter;
      const matchesSearch = !effectiveSearch || p.name.includes(effectiveSearch);
      return matchesDyn && matchesSearch;
    });
  }, [effectiveSearch, effectiveFilter, selectedDynasties]);

  const selectedPoet = selectedId ? poets.find((p) => p.id === selectedId) : null;
  const relatedPoets = useMemo(() => {
    if (!selectedId) return [];
    return relations
      .filter((r) => r.from === selectedId || r.to === selectedId)
      .map((r) => {
        const otherId = r.from === selectedId ? r.to : r.from;
        return poets.find((p) => p.id === otherId)!;
      })
      .filter(Boolean);
  }, [selectedId]);

  const poetPoems = useMemo(() => {
    if (!selectedId) return [];
    return poems.filter((p) => p.poetId === selectedId).slice(0, 4);
  }, [selectedId]);

  function toggleDynasty(d: Dynasty) {
    setSelectedDynasties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setShowModal(true);
  }

  function resetView() {
    // 强制 remount Canvas 以重置相机与控制器（干净的视角重置）
    setCanvasKey((k) => k + 1);
    setSelectedId(null);
    setShowModal(false);
  }

  function randomHighlight() {
    if (filteredPoets.length === 0) return;
    const random = filteredPoets[Math.floor(Math.random() * filteredPoets.length)];
    setSelectedId(random.id);
    setShowModal(true);
  }

  const visibleCount = filteredPoets.length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Controls bar - 隐藏当外部控制接管时 */}
      {!externalSearch && !externalDynastyFilter && (
      <div className="border-b border-white/10 bg-black/95 backdrop-blur px-6 py-3 flex flex-wrap items-center gap-3 z-40">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索诗人姓名..."
          className="w-64 bg-black/40 border-white/15"
        />

        <div className="flex items-center gap-1.5">
          {allDynasties.map((d) => (
            <button
              key={d}
              onClick={() => toggleDynasty(d)}
              className={`px-3 py-1 text-xs rounded-full border transition ${selectedDynasties.includes(d) ? 'bg-white/10 border-[#7c5cff] text-white' : 'border-white/10 text-[#8a87a8] hover:bg-white/5'}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 mr-3">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer text-[#8a87a8]">
            <input 
              type="checkbox" 
              checked={showPoemRelationsOnly}
              onChange={(e) => setShowPoemRelationsOnly(e.target.checked)}
              className="accent-[#7c5cff]"
            />
            仅显示诗词连线
          </label>
        </div>

        <div className="text-xs text-[#8a87a8] mr-3">
          可见节点：<span className="text-[#c2b8ff]">{visibleCount}</span> / {poets.length}
        </div>

        <Button variant="outline" size="sm" onClick={resetView} className="border-white/20 hover:bg-white/5">
          重置视角
        </Button>
        <Button variant="outline" size="sm" onClick={randomHighlight} className="border-white/20 hover:bg-white/5 glow-purple">
          随机高亮
        </Button>
      </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-black">
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 12, 48], fov: 48 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        >
          <Scene
            visiblePoets={filteredPoets}
            selectedId={selectedId}
            onSelect={handleSelect}
            searchTerm={search}
            showPoemRelationsOnly={showPoemRelationsOnly}
          />
        </Canvas>

        {/* Floating legend */}
        <div className="absolute bottom-6 right-6 bg-black/60 border border-white/10 backdrop-blur rounded-xl px-4 py-3 text-xs">
          <div className="flex gap-4 flex-wrap">
            {Object.entries(DYNASTY_COLORS).map(([d, c]) => (
              <div key={d} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span>{d}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-[#6c678f] mt-1.5">拖拽旋转 · 滚轮缩放 · 点击节点查看</div>
        </div>
      </div>

      {/* Detail Modal - 绚烂升级版 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent showCloseButton={false} className="dialog-content w-[90vw] max-w-[90vw] sm:max-w-3xl max-h-[85vh] text-[#f0edff] bg-[#0c0c18] border border-white/10 p-0 overflow-y-auto custom-poem-scroll">
          <DialogTitle className="sr-only">诗人详情</DialogTitle>
          <DialogDescription className="sr-only">诗人生平与传世名篇</DialogDescription>
          {selectedPoet && (
            <>
              {/* 头部 - 绚烂诗人头像占位 + 大名 */}
              <div className="px-8 pt-7 pb-5 border-b border-white/10 bg-gradient-to-b from-black/40 to-transparent">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#0c0c18] ring-white/20"
                    style={{ background: `${DYNASTY_COLORS[selectedPoet.dynasty]}25` }}
                  >
                    <div className="w-8 h-8 rounded-full" style={{ background: DYNASTY_COLORS[selectedPoet.dynasty] }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-semibold tracking-tight">{selectedPoet.name}</span>
                      <Badge variant="outline" className="text-sm border-white/25 text-[#d8d1ff]">{selectedPoet.dynasty}</Badge>
                    </div>
                    <div className="text-sm text-[#9f9ac8] mt-0.5">
                      {selectedPoet.birthYear && selectedPoet.deathYear ? `${selectedPoet.birthYear} — ${selectedPoet.deathYear} · ` : ''}
                      {selectedPoet.worksCount} 首传世
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                {/* 左侧：简介 + 关系 */}
                <div>
                  <div className="uppercase tracking-[1.5px] text-xs text-[#7c5cff] mb-2">诗人小传</div>
                  <p className="text-[#d8d1ff] leading-relaxed mb-6 pr-2">{selectedPoet.bio}</p>

                  {relatedPoets.length > 0 && (
                    <div>
                      <div className="uppercase tracking-[1.5px] text-xs text-[#7c5cff] mb-2.5">关系诗人</div>
                      <div className="flex flex-wrap gap-1.5">
                        {relatedPoets.map((rp) => (
                          <button
                            key={rp.id}
                            onClick={() => setSelectedId(rp.id)}
                            className="px-3 py-1 text-xs rounded-full border border-white/15 hover:bg-white/5 hover:border-[#7c5cff] transition active:scale-[0.985]"
                          >
                            {rp.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 右侧：真实诗词（核心） */}
                <div>
                  <div className="uppercase tracking-[1.5px] text-xs text-[#7c5cff] mb-2 flex items-center justify-between">
                    <span>真实诗词</span>
                    <span className="normal-case text-[#6c678f] font-normal">{poetPoems.length} 首</span>
                  </div>

                  <div className="space-y-4 max-h-[265px] overflow-auto pr-2 custom-poem-scroll">
                    {poetPoems.length > 0 ? (
                      poetPoems.map((p) => (
                        <div key={p.id} className="p-4 rounded-xl border border-white/10 bg-[#0a0a14]/70">
                          <div className="font-medium text-[#f4d35e] mb-1.5 tracking-tight">{p.title}</div>
                          <div className="poem-text text-[14.2px] leading-[1.82] text-[#e0d4ff] mb-3">
                            {p.content.map((line, i) => (
                              <span key={i} className="poem-line block">{line}</span>
                            ))}
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[#c2b8ff]" 
                              onClick={() => { navigator.clipboard.writeText(`${p.title}\n\n${p.content.join('\n')}`); }}
                            >
                              复制
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[#c2b8ff]" 
                              onClick={() => {
                                const q = encodeURIComponent(`模仿${selectedPoet?.name}风格`);
                                window.location.href = `/generator?prompt=${q}`;
                              }}
                            >
                              在生成器中使用此风格
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[#6c678f] text-sm py-6">暂无诗词数据（请先运行数据脚本）</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-7 pb-7 pt-1 border-t border-white/10 bg-black/20">
                <Button 
                  onClick={() => window.open(`/generator?inspire=${selectedPoet.id}`, '_self')} 
                  className="flex-1 cosmic-btn h-11 text-base"
                >
                  以 {selectedPoet.name} 风格生成新诗
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 h-11 border-white/15">
                  关闭星图详情
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
