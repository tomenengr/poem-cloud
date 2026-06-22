'use client';

import React, { useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Poem, Dynasty } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DYNASTY_COLORS: Record<Dynasty, string> = {
  '唐': '#f4c95d',
  '宋': '#a78bfa',
  '元': '#60b3c9',
  '明': '#f472b6',
  '清': '#34d399',
  '其他': '#c4b5fd',
};

// Extract poet name from poetId like "poet_李白"
export function getPoetName(poetId: string): string {
  return poetId.replace('poet_', '');
}

// Guess dynasty from poem tags
export function getPoetDynasty(poem: Poem): string {
  if (poem.tags?.includes('唐诗')) return '唐';
  if (poem.tags?.includes('宋词')) return '宋';
  return '其他';
}

// Soft circular alpha texture for round particles
function createCircleTexture(size = 64): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const cx = size / 2;
  const r = size * 0.48;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, r);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.95)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function getPoemForIndex(poems: Poem[], i: number): Poem {
  if (!poems || poems.length === 0) {
    return { id: 'fallback', poetId: '', title: '', content: [''], form: '其他' } as Poem;
  }
  return poems[i % poems.length];
}

function isPoemMatch(poem: Poem, filterDynasty: Dynasty | null | undefined, searchTerm: string | undefined): boolean {
  if (filterDynasty) {
    const d = getPoetDynasty(poem);
    if (d !== filterDynasty) return false;
  }
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    const name = getPoetName(poem.poetId);
    if (!poem.title.toLowerCase().includes(s) &&
        !name.toLowerCase().includes(s) &&
        !poem.content.some(line => line.toLowerCase().includes(s))) {
      return false;
    }
  }
  return true;
}

// ===== 3D FBM Noise for Organic Gas Simulation =====
function fbm3d(x: number, y: number, z: number): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  for (let i = 0; i < 4; i++) {
    const noise = Math.sin(x * frequency) * Math.cos(y * frequency + 1.2) * Math.sin(z * frequency + 2.4);
    total += noise * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return (total / maxValue);
}

// ===== Volumetric Galaxy Disk =====
function generateVolumetricNebula(count: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const brightnesses = new Float32Array(count);
  const sizesBase = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  
  const radius = 60.0;
  
  const colorCore = new THREE.Color('#fff7e6'); // Hot white-gold core
  const colorDense = new THREE.Color('#f43f5e'); // Rose/Magenta (H-alpha)
  const colorSparse = new THREE.Color('#0ea5e9'); // Deep Teal/Cyan (O-III)
  const colorDust = new THREE.Color('#0f172a'); // Very dark blue/black for dust
  
  const tempColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const w = Math.random();
    
    // 1. Organic distribution (Ellipsoid with heavy center cluster)
    const rDist = Math.pow(u, 1.8) * radius; 
    
    const theta = v * Math.PI * 2;
    const phi = Math.acos(2 * w - 1);
    
    let x = rDist * Math.sin(phi) * Math.cos(theta);
    let y = rDist * Math.cos(phi) * 0.25; // Flattened Y
    let z = rDist * Math.sin(phi) * Math.sin(theta);
    
    // 2. Compute 3D Noise for this position
    const noiseScale = 0.08;
    const n = fbm3d(x * noiseScale, y * noiseScale * 2.0, z * noiseScale);
    
    // 3. Shape the Nebula (Dust lanes & Clumps)
    const displace = n * 8.0; 
    x += Math.sin(y) * displace;
    y += Math.cos(x) * displace * 0.5;
    z += Math.sin(x) * displace;
    
    const distToCenter = Math.sqrt(x*x + y*y + z*z);
    
    // 4. Calculate Density and Appearance
    const coreFactor = Math.max(0, 1.0 - distToCenter / (radius * 0.25));
    const density = Math.max(0, Math.min(1, (n * 0.5 + 0.5) + coreFactor * 1.5));
    
    let sizeMultiplier = 1.0;
    let brightnessMultiplier = 1.0;
    
    if (density < 0.2) {
      // Dust Lane / Sparse area
      sizeMultiplier = 2.0 + Math.random() * 2.0; 
      brightnessMultiplier = 0.05 + Math.random() * 0.1;
      tempColor.copy(colorDust).lerp(colorSparse, density / 0.2);
    } else if (density < 0.7) {
      // Mid density
      sizeMultiplier = 1.0 + Math.random() * 1.5;
      brightnessMultiplier = 0.3 + Math.random() * 0.4;
      const factor = (density - 0.2) / 0.5;
      tempColor.copy(colorSparse).lerp(colorDense, factor);
    } else {
      // High density / Core
      sizeMultiplier = 0.5 + Math.random() * 0.8;
      brightnessMultiplier = 0.8 + Math.random() * 0.8;
      const factor = Math.min(1.0, (density - 0.7) / 0.5); 
      tempColor.copy(colorDense).lerp(colorCore, factor);
    }
    
    // Apply a slight spiral twist just for an overarching galaxy flow
    const twist = distToCenter * 0.03;
    const nx = x * Math.cos(twist) - z * Math.sin(twist);
    const nz = x * Math.sin(twist) + z * Math.cos(twist);
    x = nx;
    z = nz;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    phases[i] = Math.random() * Math.PI * 2;
    sizesBase[i] = sizeMultiplier;
    brightnesses[i] = brightnessMultiplier;

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }
  
  return { positions, phases, brightnesses, sizesBase, colors };
}

// ===== Camera Controller — smooth fly-to =====
function CameraController({
  flyTarget,
  onArrived,
  controlsRef,
}: {
  flyTarget: THREE.Vector3 | null;
  onArrived: () => void;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isFlying = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const arrivedRef = useRef(false);

  React.useEffect(() => {
    if (flyTarget) {
      // Compute camera destination: offset from target, looking at target
      const dir = flyTarget.clone().normalize();
      const offset = dir.multiplyScalar(6); // fly to 6 units away from target
      targetPos.current.copy(flyTarget).add(new THREE.Vector3(offset.x, 2, offset.z));
      targetLookAt.current.copy(flyTarget);
      isFlying.current = true;
      arrivedRef.current = false;
      // Disable controls during flight
      if (controlsRef.current) controlsRef.current.enabled = false;
    }
  }, [flyTarget, controlsRef, camera]);

  useFrame(() => {
    if (!isFlying.current || !flyTarget) return;

    camera.position.lerp(targetPos.current, 0.035);
    // Also smoothly update controls target
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.035);
    }

    const dist = camera.position.distanceTo(targetPos.current);
    if (dist < 0.3 && !arrivedRef.current) {
      arrivedRef.current = true;
      isFlying.current = false;
      if (controlsRef.current) controlsRef.current.enabled = true;
      onArrived();
    }
  });

  return null;
}

// ===== ParticleCloud inner component (inside Canvas) =====
interface ParticleCloudProps {
  poems: Poem[];
  onPoemClick: (poem: Poem, index: number) => void;
  filterDynasty?: Dynasty | null;
  searchTerm?: string;
  highlightIndex?: number | null;
}

const ParticleCloud = forwardRef<{ getPosition: (i: number) => THREE.Vector3 }, ParticleCloudProps>(
  function ParticleCloud({ poems, onPoemClick, filterDynasty, searchTerm, highlightIndex }, ref) {
    const pointsRef = useRef<THREE.Points>(null!);
    const linesRef = useRef<THREE.LineSegments>(null!);
    const { raycaster } = useThree();
    
    // Performance limit for optimal FPS
    const particleCount = Math.min(50000, poems.length);

    React.useEffect(() => {
      if (raycaster.params.Points) {
        raycaster.params.Points.threshold = 0.5;
      }
    }, [raycaster]);

    // Stable particle data
    const { positions, phases, brightnesses, sizesBase, colors } = useMemo(() => {
      return generateVolumetricNebula(particleCount);
    }, [particleCount]);

    // Ensure we have a pre-allocated buffer ready for the connecting lines (max 10000 segments)
    const linesGeometry = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      const maxSegments = 10000;
      const pos = new Float32Array(maxSegments * 6);
      const col = new Float32Array(maxSegments * 6);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setDrawRange(0, 0);
      return geo;
    }, []);

    // Expose position getter
    useImperativeHandle(ref, () => ({
      getPosition: (i: number) => {
        return new THREE.Vector3(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        );
      },
    }), [positions]);

    // Match factors for filtering
    const matchFactors = useMemo(() => {
      const factors = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        const poem = getPoemForIndex(poems, i);
        factors[i] = isPoemMatch(poem, filterDynasty, searchTerm) ? 1.0 : 0.12;
      }
      return factors;
    }, [filterDynasty, searchTerm, poems, particleCount]);

    const { currentSizes, currentBrightness } = useMemo(() => {
      const effSize = new Float32Array(particleCount);
      const effBright = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        const m = matchFactors[i];
        effSize[i] = sizesBase[i] * (0.5 + m * 0.6);
        effBright[i] = brightnesses[i] * (0.4 + m * 0.8);
      }
      return { currentSizes: effSize, currentBrightness: effBright };
    }, [matchFactors, sizesBase, brightnesses, particleCount]);

    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(currentSizes, 1));
      geo.setAttribute('aBrightness', new THREE.BufferAttribute(currentBrightness, 1));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      return geo;
    }, [positions, currentSizes, currentBrightness, phases, colors]);

    useFrame((state) => {
      if (!pointsRef.current) return;
      const t = state.clock.elapsedTime * 0.9;
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      if (mat?.uniforms?.uTime) mat.uniforms.uTime.value = t;

      // Highlight selected/fly-target particle
      const brightAttr = (pointsRef.current.geometry as THREE.BufferGeometry).attributes.aBrightness as THREE.BufferAttribute;
      if (brightAttr && highlightIndex !== null && highlightIndex !== undefined && highlightIndex < particleCount) {
        const baseB = currentBrightness[highlightIndex] || 1.0;
        const boosted = baseB * (2.0 + Math.sin(t * 6.0) * 2.0);
        brightAttr.setX(highlightIndex, Math.min(5.0, boosted));
        brightAttr.needsUpdate = true;
      }

      // Update connecting lines dynamically based on camera proximity
      if (linesRef.current) {
         const camDist = state.camera.position.length();
         const isZoomed = camDist < 30;
         const hasHighlight = highlightIndex !== null && highlightIndex !== undefined && highlightIndex < particleCount;
         
         const geo = linesRef.current.geometry as THREE.BufferGeometry;
         const posAttr = geo.attributes.position as THREE.BufferAttribute;
         const colAttr = geo.attributes.color as THREE.BufferAttribute;
         
         if (isZoomed || hasHighlight) {
            let toDraw: number[] = [];
            
            if (isZoomed) {
               const cx = state.camera.position.x;
               const cy = state.camera.position.y;
               const cz = state.camera.position.z;
               
               // Collect closest particles
               const dists: {i: number, d2: number}[] = [];
               for (let i = 0; i < particleCount; i++) {
                  const dx = positions[i*3] - cx;
                  const dy = positions[i*3+1] - cy;
                  const dz = positions[i*3+2] - cz;
                  const distSq = dx*dx + dy*dy + dz*dz;
                  
                  if (distSq < 400) { // dist < 20
                     dists.push({i, d2: distSq});
                  }
               }
               // Sort and take top 50
               dists.sort((a,b) => a.d2 - b.d2);
               toDraw = dists.slice(0, 50).map(item => item.i);
            }
            
            // Collect cultural connections if highlighted
            let cultureGroup: number[] = [];
            if (hasHighlight) {
               const hlPoem = getPoemForIndex(poems, highlightIndex as number);
               if (hlPoem) {
                   const poetMatch = hlPoem.poetId;
                   const dMatch = getPoetDynasty(hlPoem);
                   
                   const hlx = positions[(highlightIndex as number)*3];
                   const hly = positions[(highlightIndex as number)*3+1];
                   const hlz = positions[(highlightIndex as number)*3+2];
                   
                   const scores: {i: number, score: number}[] = [];
                   for (let i = 0; i < particleCount; i++) {
                      if (i === (highlightIndex as number)) continue;
                      const p = getPoemForIndex(poems, i);
                      if (!p) continue;
                      let matchLevel = 0;
                      if (p.poetId === poetMatch) matchLevel = 2; // Same poet is stronger
                      else if (getPoetDynasty(p) === dMatch) matchLevel = 1; // Same dynasty is weaker
                      
                      if (matchLevel > 0) {
                         const dx = positions[i*3] - hlx;
                         const dy = positions[i*3+1] - hly;
                         const dz = positions[i*3+2] - hlz;
                         const distSq = dx*dx + dy*dy + dz*dz;
                         // Score: match level divided by distance (higher is better)
                         scores.push({i, score: matchLevel / (distSq + 1)});
                      }
                   }
                   scores.sort((a,b) => b.score - a.score);
                   cultureGroup = scores.slice(0, 15).map(item => item.i);
               }
            }
            
            let segmentCount = 0;
            const maxSegments = 10000;
            const posArray = posAttr.array as Float32Array;
            const colArray = colAttr.array as Float32Array;
            
            // Helper to draw a quadratic bezier curve
            const drawCurve = (iA: number, iB: number, rA: number, gA: number, bA: number, rB: number, gB: number, bB: number, intensityA: number, intensityB: number) => {
               if (segmentCount >= maxSegments - 15) return;
               
               const ax = positions[iA*3], ay = positions[iA*3+1], az = positions[iA*3+2];
               const bx = positions[iB*3], by = positions[iB*3+1], bz = positions[iB*3+2];
               
               // Pseudo-random value between -1 and 1 based on IDs for deterministic randomness
               const rand1 = ((iA * 137 + iB * 149) % 100) / 50.0 - 1.0;
               const rand2 = ((iA * 151 + iB * 163) % 100) / 50.0 - 1.0;
               const rand3 = ((iA * 167 + iB * 179) % 100) / 50.0 - 1.0;
               
               // Control point: mid point pulled outward randomly to create organic, unpredictable arcs
               const mx = (ax + bx) * 0.5;
               const my = (ay + by) * 0.5;
               const mz = (az + bz) * 0.5;
               
               const dist = Math.sqrt(Math.pow(ax-bx, 2) + Math.pow(ay-by, 2) + Math.pow(az-bz, 2));
               const curveAmp = Math.max(0.5, dist * 0.3); // Scale curve by distance
               
               const cx = mx + rand1 * curveAmp;
               const cy = my + curveAmp * 0.5 + Math.abs(rand2) * curveAmp; // slightly upwards bias
               const cz = mz + rand3 * curveAmp;
               
               const segments = 12;
               let prevX = ax, prevY = ay, prevZ = az;
               for (let s = 1; s <= segments; s++) {
                  const t2 = s / segments;
                  const t1 = 1 - t2;
                  
                  // Quadratic bezier
                  const nx = t1*t1*ax + 2*t1*t2*cx + t2*t2*bx;
                  const ny = t1*t1*ay + 2*t1*t2*cy + t2*t2*by;
                  const nz = t1*t1*az + 2*t1*t2*cz + t2*t2*bz;
                  
                  const offset = segmentCount * 6;
                  
                  // Color interpolation
                  const ir = rA * t1 + rB * t2;
                  const ig = gA * t1 + gB * t2;
                  const ib = bA * t1 + bB * t2;
                  const iIntensity = intensityA * t1 + intensityB * t2;
                  
                  posArray[offset]   = prevX; posArray[offset+1] = prevY; posArray[offset+2] = prevZ;
                  colArray[offset]   = ir * iIntensity; colArray[offset+1] = ig * iIntensity; colArray[offset+2] = ib * iIntensity;
                  
                  posArray[offset+3] = nx; posArray[offset+4] = ny; posArray[offset+5] = nz;
                  colArray[offset+3] = ir * iIntensity; colArray[offset+4] = ig * iIntensity; colArray[offset+5] = ib * iIntensity;
                  
                  prevX = nx; prevY = ny; prevZ = nz;
                  segmentCount++;
               }
            };
            
            // 1. Draw zoomed constellation networking
            if (isZoomed && toDraw.length > 0) {
               // For each particle, connect to its closest 2 neighbors within the subset
               for (let i = 0; i < toDraw.length; i++) {
                  const iA = toDraw[i];
                  const ax = positions[iA*3], ay = positions[iA*3+1], az = positions[iA*3+2];
                  const distA = Math.sqrt(Math.pow(ax - state.camera.position.x, 2) + Math.pow(ay - state.camera.position.y, 2) + Math.pow(az - state.camera.position.z, 2));
                  const intensityA = Math.max(0, Math.min(1, (20 - distA) / 8)) * 0.4; // 40% opacity for normal constellation
                  
                  if (intensityA < 0.01) continue;
                  
                  // Find neighbors in `toDraw`
                  const neighbors = [];
                  for (let j = 0; j < toDraw.length; j++) {
                     if (i === j) continue;
                     const iB = toDraw[j];
                     const bx = positions[iB*3], by = positions[iB*3+1], bz = positions[iB*3+2];
                     const dSq = Math.pow(ax-bx, 2) + Math.pow(ay-by, 2) + Math.pow(az-bz, 2);
                     neighbors.push({idx: iB, dSq});
                  }
                  neighbors.sort((a,b) => a.dSq - b.dSq);
                  
                  const rA = colors[iA*3], gA = colors[iA*3+1], bA = colors[iA*3+2];
                  
                  // Break uniformity: Use particle ID to seed connection count (1 to 3 connections)
                  const numConnections = 1 + ((iA * 13) % 3);
                  
                  // Connect to pseudo-random neighbors from the top nearest 6
                  let connected = 0;
                  for (let k = 0; k < Math.min(6, neighbors.length); k++) {
                     if (connected >= numConnections) break;
                     
                     const iB = neighbors[k].idx;
                     
                     // Introduce 33% chance to skip a close neighbor to create organic asymmetry
                     if (k < 3 && ((iA + iB) % 3) === 0 && neighbors.length > 3) continue;
                     
                     // Only draw if iA < iB to avoid drawing lines twice
                     if (iA > iB) continue;
                     
                     const bx = positions[iB*3], by = positions[iB*3+1], bz = positions[iB*3+2];
                     const distB = Math.sqrt(Math.pow(bx - state.camera.position.x, 2) + Math.pow(by - state.camera.position.y, 2) + Math.pow(bz - state.camera.position.z, 2));
                     const intensityB = Math.max(0, Math.min(1, (20 - distB) / 8)) * 0.4;
                     
                     const rB = colors[iB*3], gB = colors[iB*3+1], bB = colors[iB*3+2];
                     
                     drawCurve(iA, iB, rA, gA, bA, rB, gB, bB, intensityA, intensityB);
                     connected++;
                  }
               }
            }
            
            // 2. Draw Culture Connections (Golden curves!)
            if (hasHighlight) {
                const iA = highlightIndex as number;
                const ax = positions[iA*3], ay = positions[iA*3+1], az = positions[iA*3+2];
                // Base colors for culture lines: Gold / Bright Amber
                const rA = 1.0, gA = 0.84, bA = 0.0;
                
                // Pulsing intensity
                const pulse = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 3.0);
                const intensityA = pulse;
                
                cultureGroup.forEach(iB => {
                   const intensityB = pulse * 0.6; // slightly dimmer at the end
                   drawCurve(iA, iB, rA, gA, bA, rA, gA, bA, intensityA, intensityB);
                });
            }
            
            geo.setDrawRange(0, segmentCount * 2);
            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
         } else if (geo.drawRange.count > 0) {
            geo.setDrawRange(0, 0);
         }
      }
    });

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      // Ignore click if the user dragged more than 3 pixels
      if (event.delta && event.delta > 3) return;
      if (event.index === undefined) return;
      const idx = event.index;
      const poem = getPoemForIndex(poems, idx);
      if (poem) onPoemClick(poem, idx);
    };

    const particleMaterial = useMemo(() => {
      createCircleTexture(64); // warm up

      const uniforms = {
        uTime: { value: 0 },
        uBaseSize: { value: 0.4 }, // slightly smaller base size since we have so many
      };

      const vertexShader = `
        uniform float uTime;
        uniform float uBaseSize;
        attribute float aSize;
        attribute float aBrightness;
        attribute float aPhase;
        attribute vec3 aColor;

        varying float vBrightness;
        varying float vPhase;
        varying vec3 vColor;

        void main() {
          vBrightness = aBrightness;
          vPhase = aPhase;
          vColor = aColor;

          vec3 pos = position;
          float dist = length(pos.xz);
          
          // Enhanced breathing and drift
          float driftScale = 0.1 + smoothstep(0.0, 48.0, dist) * 1.5; // Outer particles wander more
          pos.y += sin(uTime * 0.2 + aPhase * 4.0) * 0.6 * (1.0 + driftScale); // Y breathing
          pos.x += cos(uTime * 0.1 + aPhase * 2.0) * 1.2 * driftScale; // Wander
          pos.z += sin(uTime * 0.12 + aPhase * 3.0) * 1.2 * driftScale;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float pulse = 1.0 + sin(uTime * 0.8 + aPhase) * 0.22;
          gl_PointSize = uBaseSize * aSize * pulse * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;

      const fragmentShader = `
        varying float vBrightness;
        varying float vPhase;
        varying vec3 vColor;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          
          // Glowing star with soft halo, fixes mushiness and overdraw lag
          float core = exp(-dist * dist * 40.0);
          float halo = exp(-dist * 5.0) * 0.5;
          float alpha = max(core, halo) * (1.0 - smoothstep(0.4, 0.5, dist));

          vec3 base = vColor * vBrightness;
          gl_FragColor = vec4(base, alpha);
        }
      `;

      return new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    }, []);

    return (
      <group>
        <points
          ref={pointsRef}
          geometry={geometry}
          material={particleMaterial}
          onClick={handleClick}
        />
        <lineSegments ref={linesRef} geometry={linesGeometry}>
          <lineBasicMaterial 
            vertexColors={true} 
            transparent={true} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            opacity={0.6}
          />
        </lineSegments>
      </group>
    );
  }
);

// ===== Main PoetryCloud component =====
export interface PoetryCloudHandle {
  flyToPoem: (poemId: string) => void;
}

interface PoetryCloudProps {
  poems: Poem[];
  filterDynasty?: Dynasty | null;
  searchTerm?: string;
}

const PoetryCloud = forwardRef<PoetryCloudHandle, PoetryCloudProps>(
  function PoetryCloud({ poems, filterDynasty, searchTerm }, ref) {
    const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
    const [isRotating, setIsRotating] = useState(true);
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
    const controlsRef = useRef<any>(null);
    const particleRef = useRef<{ getPosition: (i: number) => THREE.Vector3 }>(null);
    
    const particleCount = Math.min(350000, poems.length);

    const handlePoemClick = useCallback((poem: Poem, index: number) => {
      setHighlightIndex(index);
      setSelectedPoem(poem);
    }, []);

    // Expose flyToPoem for external use (sidebar)
    useImperativeHandle(ref, () => ({
      flyToPoem: (poemId: string) => {
        const index = poems.findIndex(p => p.id === poemId);
        if (index === -1) return;
        const poem = poems[index];
        handlePoemClick(poem, index);
      },
    }), [handlePoemClick, poems]);

    const closeModal = () => {
      setSelectedPoem(null);
      setHighlightIndex(null);
    };

    const copyPoem = () => {
      if (!selectedPoem) return;
      const text = `${selectedPoem.title}\n${getPoetName(selectedPoem.poetId)}\n\n${selectedPoem.content.join('\n')}`;
      navigator.clipboard.writeText(text);
      toast.success('诗词已复制');
    };

    const filteredCount = useMemo(() => {
      let bright = 0;
      for (let i = 0; i < particleCount; i++) {
        const poem = getPoemForIndex(poems, i);
        if (isPoemMatch(poem, filterDynasty, searchTerm)) bright++;
      }
      return bright;
    }, [filterDynasty, searchTerm, poems, particleCount]);

    return (
      <>
        <Canvas
          camera={{ position: [0, 10, 40], fov: 50 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.06} />
          <pointLight position={[42, 28, -18]} intensity={0.5} color="#e8e0ff" />

          <EffectComposer>
            <Bloom
              mipmapBlur
              luminanceThreshold={0.3}
              luminanceSmoothing={0.65}
              intensity={1.6}
              radius={0.6}
            />
          </EffectComposer>

          <ParticleCloud
            ref={particleRef}
            poems={poems}
            onPoemClick={handlePoemClick}
            filterDynasty={filterDynasty}
            searchTerm={searchTerm}
            highlightIndex={highlightIndex}
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping
            dampingFactor={0.1}
            autoRotate={isRotating}
            autoRotateSpeed={0.07}
            minDistance={5}
            maxDistance={120}
          />
        </Canvas>


        {/* Auto-rotate toggle */}
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="absolute bottom-6 right-6 text-xs px-4 py-1.5 rounded border border-white/15 bg-black/40 hover:bg-white/5 transition pointer-events-auto"
        >
          {isRotating ? '停止旋转' : '自动旋转星云'}
        </button>

        {/* ===== Poem Modal (Draggable, High Contrast) ===== */}
        <AnimatePresence>
          {selectedPoem && (
            <motion.div 
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-[90vw] max-w-4xl h-[70vh] z-50 rounded-2xl overflow-hidden pointer-events-auto"
              style={{
                // Transparent background as requested
                background: 'transparent',
              }}
            >
              <div className="flex flex-col h-full w-full relative">
                {/* Drag handle area (invisible but covers top) */}
                <div className="absolute top-0 left-0 w-full h-[15%] cursor-move z-20 opacity-0" />
                
                {/* Vertical Layout Container */}
                <div className="flex-1 w-full flex justify-center items-center px-8 py-16 vertical-layout gap-10 overflow-x-auto custom-poem-scroll">
                  {/* Title */}
                  <div className="poem-title-art text-[#FFD700]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}>
                    {selectedPoem.title}
                  </div>

                  {/* Author */}
                  <div className="poem-meta mt-4 text-[#FDE047]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.8)' }}>
                    {getPoetName(selectedPoem.poetId)} · {getPoetDynasty(selectedPoem)}
                  </div>

                  {/* Poem body */}
                  <div className="poem-text font-bold" style={{ color: '#FFD700', textShadow: '0 2px 12px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.9)' }}>
                    {selectedPoem.content.map((line, i) => (
                      <span key={i} className="poem-line">{line}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="absolute bottom-5 w-full flex justify-center gap-4 px-8 z-30">
                  <Button onClick={copyPoem} className="cosmic-btn bg-black/40 hover:bg-black/60 border-[#FFD700]/30 text-[#FFD700] text-sm cursor-pointer">
                    复制全文
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const q = encodeURIComponent(`模仿${getPoetName(selectedPoem.poetId)}风格`);
                      window.location.href = `/generator?prompt=${q}`;
                    }}
                    className="bg-black/40 border-[#FFD700]/30 hover:bg-black/60 text-[#FFD700] text-sm cursor-pointer"
                  >
                    用此风格生成
                  </Button>
                  <Button variant="secondary" className="bg-black/40 hover:bg-red-900/60 text-red-200 text-sm border border-red-500/30 cursor-pointer" onClick={closeModal}>
                    关闭
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

export default PoetryCloud;
