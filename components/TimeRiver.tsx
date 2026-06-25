'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

const POEM_LINES = [
  "君不见黄河之水天上来", "奔流到海不复回",
  "高堂明镜悲白发", "朝如青丝暮成雪",
  "人生得意须尽欢", "莫使金樽空对月",
  "天生我材必有用", "千金散尽还复来",
  "大漠孤烟直", "长河落日圆",
  "念天地之悠悠", "独怆然而涕下",
  "星垂平野阔", "月涌大江流",
  "白日依山尽", "黄河入海流",
  "海上生明月", "天涯共此时"
];

const POETS = ['李白', '杜甫', '苏轼', '王维', '李清照', '辛弃疾', '白居易', '陶渊明'];
const ANCIENT_THINGS = ['古琴', '孤鹤', '残月', '孤舟', '苍松', '翠竹', '飞剑', '古亭'];

type ElementType = 'poem' | 'poet' | 'thing' | 'title';

function createTextTexture(text: string, type: ElementType): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  
  let fontSize = 64;
  if (type === 'title') fontSize = 150;
  if (type === 'poet') fontSize = 110;
  if (type === 'thing') fontSize = 90;
  
  canvas.width = 512;
  canvas.height = 1024;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const chars = text.split('');
  const totalHeight = chars.length * fontSize * 1.1;
  const startY = (canvas.height - totalHeight) / 2 + fontSize / 2;

  const cw = canvas.width;
  const ch = canvas.height;

  // Elaborate, high-quality backgrounds for text
  if (type === 'poet') {
    // Glowing aura
    const grad = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, 300);
    grad.addColorStop(0, 'rgba(255, 180, 50, 0.4)');
    grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    
    // Dark golden background block (Plaque style)
    ctx.fillStyle = 'rgba(30, 20, 0, 0.7)';
    ctx.fillRect(cw/2 - 80, startY - fontSize * 1.2, 160, totalHeight + fontSize * 2);
    
    // Double golden borders
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 4;
    ctx.strokeRect(cw/2 - 80, startY - fontSize * 1.2, 160, totalHeight + fontSize * 2);
    ctx.lineWidth = 1;
    ctx.strokeRect(cw/2 - 70, startY - fontSize * 1.2 + 10, 140, totalHeight + fontSize * 2 - 20);
  } else if (type === 'poem') {
    // Base semi-transparent dark background (Bamboo Slip style)
    ctx.fillStyle = 'rgba(0, 10, 20, 0.6)';
    ctx.fillRect(canvas.width/2 - 70, startY - fontSize, 140, totalHeight + fontSize * 2);
    
    // Draw individual bamboo strips (vertical lines)
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.15)';
    ctx.lineWidth = 1;
    for(let i = -60; i <= 60; i += 15) {
      ctx.beginPath();
      ctx.moveTo(canvas.width/2 + i, startY - fontSize);
      ctx.lineTo(canvas.width/2 + i, startY + totalHeight + fontSize);
      ctx.stroke();
    }
    
    // Draw thick elegant border
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 70, startY - fontSize, 140, totalHeight + fontSize * 2);
    
    // Draw corner brackets
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.fillRect(canvas.width/2 - 70, startY - fontSize, 20, 4);
    ctx.fillRect(canvas.width/2 - 70, startY - fontSize, 4, 20);
    ctx.fillRect(canvas.width/2 + 50, startY - fontSize, 20, 4);
    ctx.fillRect(canvas.width/2 + 66, startY - fontSize, 4, 20);
    
    ctx.fillRect(canvas.width/2 - 70, startY + totalHeight + fontSize - 4, 20, 4);
    ctx.fillRect(canvas.width/2 - 70, startY + totalHeight + fontSize - 20, 4, 20);
    ctx.fillRect(canvas.width/2 + 50, startY + totalHeight + fontSize - 4, 20, 4);
    ctx.fillRect(canvas.width/2 + 66, startY + totalHeight + fontSize - 20, 4, 20);
  } else if (type === 'thing') {
    // Tai Chi / Mystic array circle background
    ctx.strokeStyle = 'rgba(50, 255, 150, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cw/2, ch/2, 160, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.arc(cw/2, ch/2, 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const grad = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, 250);
    grad.addColorStop(0, 'rgba(20, 200, 150, 0.4)');
    grad.addColorStop(1, 'rgba(20, 200, 150, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }
  
  ctx.save();
  ctx.font = `${fontSize}px 'Zhi Mang Xing', cursive, 'KaiTi', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const drawPass = (blur: number, color: string, alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    
    if (type === 'title' || type === 'poet') {
      ctx.shadowColor = '#ffcc55';
    } else if (type === 'thing') {
      ctx.shadowColor = '#55ffcc';
    } else {
      ctx.shadowColor = '#88bbff';
    }
    
    ctx.shadowBlur = blur;
    chars.forEach((char, i) => {
      ctx.fillText(char, canvas.width / 2, startY + i * fontSize * 1.1);
    });
  };

  if (type === 'title' || type === 'poet') {
    drawPass(50, '#d4af37', 0.5);
    drawPass(20, '#fff5d7', 0.8);
    drawPass(0, '#ffffff', 1.0);
  } else if (type === 'thing') {
    drawPass(40, '#22ccaa', 0.5);
    drawPass(15, '#aaffee', 0.8);
    drawPass(0, '#ffffff', 0.95);
  } else {
    drawPass(40, '#4477ff', 0.5);
    drawPass(15, '#ccddff', 0.8);
    drawPass(0, '#ffffff', 0.95);
  }
  ctx.restore();

  // Authentic realistic red seal (印章) for poets
  if (type === 'poet') {
    ctx.save();
    const sealY = startY + totalHeight + 45;
    ctx.translate(canvas.width/2, sealY);
    ctx.rotate(0.08); // Slight rotation for realism
    
    ctx.fillStyle = '#cc1111';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(-35, -35, 70, 70);
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-31, -31, 62, 62);

    ctx.fillStyle = '#ffffff';
    ctx.font = `32px 'KaiTi'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('印', 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

function getCircleTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// Draw realistic fluffy snow texture
function getFluffySnowTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

function getRiverCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 500, -3000),
    new THREE.Vector3(1500, 350, -1500),
    new THREE.Vector3(400, 200, 0),
    new THREE.Vector3(1200, 50, 1500),
    new THREE.Vector3(-500, -50, 2500),
    new THREE.Vector3(-1500, 100, 1000),
    new THREE.Vector3(-800, 250, -500),
    new THREE.Vector3(-1200, 400, -1800),
  ], true, 'catmullrom', 0.5);
}

interface Particle { t: number; speed: number; radius: number; angle: number; twinklePhase: number; twinkleSpeed: number; }

function RiverParticles() {
  const count = 20000;
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const curve = useMemo(() => getRiverCurve(), []);
  const circleTexture = useMemo(() => getCircleTexture(), []);
  
  const particlesRef = useRef<Particle[]>([]);
  useEffect(() => {
    particlesRef.current = Array.from({ length: count }, () => ({
      t: Math.random(),
      speed: 0.01 + Math.random() * 0.015,
      radius: Math.sqrt(Math.random()) * 140 + 10,
      angle: Math.random() * Math.PI * 2,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 1 + Math.random() * 2,
    }));
  }, [count]);
  
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }, delta) => {
    if (!geomRef.current) return;
    const particles = particlesRef.current;
    if (particles.length === 0) return;

    const pos = geomRef.current.attributes.position.array as Float32Array;
    const col = geomRef.current.attributes.color.array as Float32Array;
    
    const time = clock.getElapsedTime();
    const d = Math.min(delta, 0.1);
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.t -= p.speed * d;
      if (p.t < 0) p.t += 1;
      
      const point = curve.getPointAt(p.t);
      const tangent = curve.getTangentAt(p.t);
      const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
      const binormal = normal.clone().cross(tangent).normalize();
      
      const twist = p.t * Math.PI * 8; 
      const xOff = Math.cos(p.angle + twist) * p.radius;
      const yOff = Math.sin(p.angle + twist) * p.radius * 0.35;
      
      const finalPos = point.clone().add(normal.multiplyScalar(xOff)).add(binormal.multiplyScalar(yOff));
      
      pos[i*3] = finalPos.x;
      pos[i*3+1] = finalPos.y;
      pos[i*3+2] = finalPos.z;
      
      const color = new THREE.Color();
      const colorProgress = p.t;
      if (colorProgress < 0.33) {
        color.lerpColors(new THREE.Color('#00e5ff'), new THREE.Color('#9d00ff'), colorProgress * 3);
      } else if (colorProgress < 0.66) {
        color.lerpColors(new THREE.Color('#9d00ff'), new THREE.Color('#ffaa00'), (colorProgress - 0.33) * 3);
      } else {
        color.lerpColors(new THREE.Color('#ffaa00'), new THREE.Color('#00e5ff'), (colorProgress - 0.66) * 3);
      }
      
      const twinkle = 0.5 + Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.5;
      const intensity = 0.8 + (1 - p.radius / 150) * 1.5; 
      color.multiplyScalar(intensity * twinkle);
      
      col[i*3] = color.r;
      col[i*3+1] = color.g;
      col[i*3+2] = color.b;
    }
    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.attributes.color.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        map={circleTexture} 
        transparent 
        alphaTest={0.05}
        size={1.8} 
        vertexColors 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
        sizeAttenuation 
      />
    </points>
  );
}

interface EnvParticle { x: number; y: number; z: number; speedY: number; speedX: number; wobbleSpeed: number; wobblePhase: number; }

function SnowParticles() {
  const count = 4000;
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const snowTex = useMemo(() => getFluffySnowTexture(), []);
  
  const particlesRef = useRef<EnvParticle[]>([]);
  useEffect(() => {
    particlesRef.current = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8000,
      y: Math.random() * 4000 - 1000,
      z: (Math.random() - 0.5) * 8000,
      speedY: 2.0 + Math.random() * 3.0,
      speedX: (Math.random() - 0.5) * 3.0,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      wobblePhase: Math.random() * Math.PI * 2,
    }));
  }, []);
  
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!geomRef.current) return;
    const particles = particlesRef.current;
    if (particles.length === 0) return;
    
    const time = clock.getElapsedTime();
    const pos = geomRef.current.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y -= p.speedY; // fall down
      if (p.y < -1500) {
        p.y = 3000;
        p.x = (Math.random() - 0.5) * 8000;
        p.z = (Math.random() - 0.5) * 8000;
      }
      
      p.x += Math.sin(time * p.wobbleSpeed + p.wobblePhase) * 1.5; 
      
      pos[i*3] = p.x;
      pos[i*3+1] = p.y;
      pos[i*3+2] = p.z;
    }
    geomRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        map={snowTex}
        size={25} 
        color="#ffffff"
        transparent 
        opacity={0.5}
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
        sizeAttenuation 
      />
    </points>
  );
}

function FloatingEntity({ text, type, tOffset, side }: { text: string, type: ElementType, tOffset: number, side: number }) {
  const tex = useMemo(() => createTextTexture(text, type), [text, type]);
  const ref = useRef<THREE.Sprite>(null);
  const curve = useMemo(() => getRiverCurve(), []);
  const [[r1, r2]] = useState(() => [Math.random(), Math.random()]);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime();
    ref.current.position.y += Math.sin(time * 0.8 + r1 * Math.PI * 2) * 0.1;
  });

  if (!tex) return null;

  const point = curve.getPointAt(tOffset);
  const tangent = curve.getTangentAt(tOffset);
  const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
  
  const distance = type === 'poem' ? 140 : (type === 'poet' ? 90 : 160);
  const pos = point.clone().add(normal.multiplyScalar(side * (distance + r1 * 60)));
  pos.y += (type === 'thing' ? -20 : 40) + r2 * 60; 
  
  let scaleX = 70, scaleY = 140;
  if (type === 'poet') { scaleX = 100; scaleY = 200; }
  if (type === 'thing') { scaleX = 55; scaleY = 110; }

  return (
    <sprite position={pos} scale={[scaleX, scaleY, 1]} ref={ref}>
      <spriteMaterial map={tex} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
}

function GiantMoon() {
  return (
    <mesh position={[0, 1500, -4500]}>
      <circleGeometry args={[800, 64]} />
      <meshBasicMaterial color="#ffeedd" transparent opacity={0.8} fog={false} />
    </mesh>
  );
}

function CameraController() {
  const { camera, scene } = useThree();
  const curve = useMemo(() => getRiverCurve(), []);
  const progressRef = useRef(0.05);
  
  // WSAD Keyboard controls
  const keys = useRef({ w: false, s: false, a: false, d: false });
  const currentSpeed = useRef(0.018);
  const currentTurn = useRef(0);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    scene.fog = new THREE.FogExp2('#000000', 0.0004); 
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scene]);
  
  useFrame(({ pointer }, delta) => {
    const d = Math.min(delta, 0.1);
    
    // Process keyboard controls
    let targetSpeed = 0.018; // Default cruise speed
    if (keys.current.w) targetSpeed = 0.045; // Accelerate
    if (keys.current.s) targetSpeed = 0.002; // Decelerate
    currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.1;
    
    let targetTurn = 0;
    if (keys.current.a) targetTurn = -1; // Turn left
    if (keys.current.d) targetTurn = 1;  // Turn right
    currentTurn.current += (targetTurn - currentTurn.current) * 0.1;

    progressRef.current += d * currentSpeed.current;
    if (progressRef.current > 1) progressRef.current -= 1;
    
    const t = progressRef.current;
    const camPos = curve.getPointAt(t);
    const lookAtPos = curve.getPointAt((t + 0.03) % 1); 
    
    camPos.y += 90;
    
    const tangent = curve.getTangentAt(t);
    const upVector = new THREE.Vector3(0, 1, 0);
    
    const normal = new THREE.Vector3().crossVectors(upVector, tangent);
    if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);
    else normal.normalize();
    
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    
    const swayX = pointer.x * 25; 
    const swayY = pointer.y * 15; 
    
    camPos.add(normal.multiplyScalar(swayX)).add(binormal.multiplyScalar(swayY));
    
    // Apply keyboard turning by offsetting the lookAt position horizontally
    lookAtPos.add(normal.clone().multiplyScalar(currentTurn.current * 500));
    
    camera.position.lerp(camPos, 0.08);
    
    const bankAngle = pointer.x * -0.25 + currentTurn.current * -0.4; 
    camera.up.set(0, 1, 0).applyAxisAngle(tangent, bankAngle);
    
    camera.lookAt(lookAtPos);
  });
  
  return null;
}

export function TimeRiver() {
  const router = useRouter();

  const allElements = useMemo(() => {
    const arr = [
      ...POEM_LINES.map(t => ({ text: t, type: 'poem' as ElementType })),
      ...POETS.map(t => ({ text: t, type: 'poet' as ElementType })),
      ...ANCIENT_THINGS.map(t => ({ text: t, type: 'thing' as ElementType }))
    ];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.sin(i * 123.456) * 10000) % (i + 1);
      const absJ = Math.abs(j);
      [arr[i], arr[absJ]] = [arr[absJ], arr[i]];
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 z-10 select-none bg-[#000000]">
      <Canvas
        camera={{ fov: 65, near: 1, far: 8000 }}
        style={{ background: '#000000' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <CameraController />
          
          <RiverParticles />
          <SnowParticles />
          <GiantMoon />
          
          {allElements.map((el, i) => (
            <FloatingEntity 
              key={i} 
              text={el.text} 
              type={el.type}
              tOffset={i / allElements.length} 
              side={i % 2 === 0 ? 1 : -1} 
            />
          ))}
          
          <ambientLight intensity={0.15} color="#050515" />
          
          {[0, 0.25, 0.5, 0.75].map((t, i) => {
            const curve = getRiverCurve();
            const pos = curve.getPointAt(t);
            const color = i % 2 === 0 ? "#ff9900" : "#00eeff";
            return <pointLight key={i} position={[pos.x, pos.y + 100, pos.z]} intensity={2.0} color={color} distance={1500} />;
          })}
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={2.0} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 text-center pointer-events-auto">
        <button 
          onClick={() => router.push('/star-map')}
          className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full border border-white/10 hover:border-white/40 transition-all duration-700 backdrop-blur-md shadow-[0_0_30px_rgba(100,150,255,0.1)] hover:shadow-[0_0_50px_rgba(100,150,255,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <span className="relative text-white/80 group-hover:text-white text-[15px] tracking-[10px] font-light transition-colors duration-500 pl-2">
            进入诗云 (W加速/S减速/A左转/D右转)
          </span>
        </button>
      </div>
      
      <div className="absolute bottom-8 right-10 z-40 text-[11px] tracking-[5px] text-white/30 pointer-events-none font-['Zhi_Mang_Xing']">
        无尽长河 · 漫游诗云
      </div>
    </div>
  );
}
