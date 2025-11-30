import React, { useRef, useEffect, useCallback } from 'react';
import { Vector2, Entity, Particle, SoundType, Jellyfish, Seaweed, PreyEntity, PreyType } from '../types';
import { soundService } from '../utils/soundService';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  isRoaring: boolean;
  bioluminescence: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate, isRoaring, bioluminescence }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Vector2>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const keysRef = useRef<Set<string>>(new Set());
  
  // Game State Refs
  const titanRef = useRef<Vector2>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const titanBodyRef = useRef<Vector2[]>([]);
  const preyRef = useRef<PreyEntity[]>([]);
  const jellyfishRef = useRef<Jellyfish[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const seaweedRef = useRef<Seaweed[]>([]);
  const initializedRef = useRef(false);
  
  // Configuration
  const SEGMENT_COUNT = 24; 
  const SEGMENT_SPACING = 18;
  const PREY_COUNT = 30; // Increased count
  const JELLY_COUNT = 6;
  const SEAWEED_COUNT = 40;

  // Initialize World
  useEffect(() => {
    if (initializedRef.current) return;
    
    // 1. Initialize Titan Body
    const body: Vector2[] = [];
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      body.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 + i * SEGMENT_SPACING });
    }
    titanBodyRef.current = body;

    // 2. Initialize Prey (Diverse Ecosystem)
    const initialPrey: PreyEntity[] = [];
    for (let i = 0; i < PREY_COUNT; i++) {
      initialPrey.push(createRandomPrey());
    }
    preyRef.current = initialPrey;

    // 3. Initialize Jellyfish (Deepstaria inspired)
    const jellies: Jellyfish[] = [];
    for (let i = 0; i < JELLY_COUNT; i++) {
      jellies.push({
        id: `jelly-${i}`,
        position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
        velocity: { x: (Math.random() - 0.5) * 0.2, y: -0.1 - Math.random() * 0.3 },
        radius: 20 + Math.random() * 30,
        color: `hsla(${260 + Math.random() * 60}, 60%, 60%, 0.4)`,
        tentacleOffset: Math.random() * 100,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    jellyfishRef.current = jellies;

    // 4. Initialize Tube Worms / Kelp
    const weeds: Seaweed[] = [];
    for (let i = 0; i < SEAWEED_COUNT; i++) {
      weeds.push({
        x: Math.random() * window.innerWidth,
        height: 150 + Math.random() * 250,
        segments: 15,
        color: Math.random() > 0.5 ? '#881111' : '#aa2222', // Giant Tube Worm colors
        phaseOffset: Math.random() * Math.PI * 2
      });
    }
    seaweedRef.current = weeds;

    initializedRef.current = true;
  }, []);

  // Helper to spawn diverse prey
  const createRandomPrey = (x?: number, y?: number): PreyEntity => {
      const rand = Math.random();
      const pos = {
          x: x ?? (Math.random() * window.innerWidth),
          y: y ?? (Math.random() * window.innerHeight)
      };

      if (rand < 0.5) {
          // 50% Lanternfish
          return {
            id: Math.random().toString(36),
            type: PreyType.LANTERNFISH,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 },
            radius: 6,
            color: '#aaddff',
            angle: 0
          };
      } else if (rand < 0.8) {
          // 30% Ammonite (Slower, tankier)
          return {
            id: Math.random().toString(36),
            type: PreyType.AMMONITE,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
            radius: 12, // Bigger
            color: '#cdb499', // Shell color
            angle: 0
          };
      } else {
          // 20% Vampire Squid (Drifts, bursts)
          return {
            id: Math.random().toString(36),
            type: PreyType.SQUID,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
            radius: 10,
            color: '#660000', // Deep red
            angle: 0,
            tailPhase: Math.random() * Math.PI
          };
      }
  };

  // --- Input Handling ---

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only update if keys aren't actively driving, or to just update reference
    // We update reference but the game loop decides priority
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      keysRef.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleKeyUp]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const time = frameCount * 0.015;

      // --- 1. Background (The Abyss) ---
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#001a2c');
      gradient.addColorStop(0.4, '#000810'); 
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- 2. Flora (Tube Worms) ---
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      seaweedRef.current.forEach(weed => {
        // Tube body
        ctx.strokeStyle = '#221111';
        ctx.lineWidth = 10;
        ctx.beginPath();
        let cx = weed.x;
        let cy = canvas.height;
        ctx.moveTo(cx, cy);
        for (let i = 0; i < weed.segments; i++) {
          const sway = Math.sin(time + weed.phaseOffset + i * 0.3) * (i * 0.8);
          cx += sway * 0.3;
          cy -= weed.height / weed.segments;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Plume (Red tip)
        ctx.strokeStyle = weed.color;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(time * 2 + weed.phaseOffset) * 5, cy - 20);
        ctx.stroke();
      });

      // --- 3. Jellyfish ---
      jellyfishRef.current.forEach(jelly => {
        jelly.position.y += jelly.velocity.y;
        jelly.position.x += Math.sin(time + jelly.pulsePhase) * 0.1;
        
        if (jelly.position.y < -100) jelly.position.y = canvas.height + 100;

        const pulse = Math.sin(time * 2 + jelly.pulsePhase) * 0.05 + 1;
        
        ctx.fillStyle = jelly.color;
        ctx.shadowBlur = bioluminescence ? 40 : 0;
        ctx.shadowColor = jelly.color;
        
        // Bell
        ctx.beginPath();
        ctx.ellipse(jelly.position.x, jelly.position.y, jelly.radius * pulse, jelly.radius * 0.8 * pulse, 0, Math.PI, 0);
        ctx.bezierCurveTo(
          jelly.position.x + jelly.radius, jelly.position.y + 15,
          jelly.position.x - jelly.radius, jelly.position.y + 15,
          jelly.position.x - jelly.radius * pulse, jelly.position.y
        );
        ctx.fill();

        // Oral arms / Tentacles
        ctx.strokeStyle = jelly.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<5; i++) {
           const offsetX = (i - 2) * 8;
           ctx.moveTo(jelly.position.x + offsetX, jelly.position.y);
           ctx.bezierCurveTo(
             jelly.position.x + offsetX + Math.sin(time * 3 + i) * 20, jelly.position.y + 40,
             jelly.position.x + offsetX - Math.sin(time * 3 + i) * 20, jelly.position.y + 80,
             jelly.position.x + offsetX, jelly.position.y + 120
           );
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // --- 4. Prey Logic & Rendering ---
      let nearestPreyDist = Infinity;
      const titanHeadPos = titanRef.current;

      preyRef.current = preyRef.current.filter(prey => {
        const distHeadX = prey.position.x - titanHeadPos.x;
        const distHeadY = prey.position.y - titanHeadPos.y;
        const distToHead = Math.sqrt(distHeadX * distHeadX + distHeadY * distHeadY);

        if (distToHead < nearestPreyDist) nearestPreyDist = distToHead;

        // PREDATION: Eat check
        // Larger prey needs slightly closer bite
        const biteRadius = prey.radius + 50; 
        if (distToHead < biteRadius) {
          soundService.play(SoundType.EAT);
          // Score depends on type
          const points = prey.type === PreyType.AMMONITE ? 3 : (prey.type === PreyType.SQUID ? 2 : 1);
          onScoreUpdate(points);
          
          // Blood/Debris
          for(let k=0; k<6; k++) {
             particlesRef.current.push({
               id: Math.random().toString(),
               position: { ...prey.position },
               velocity: { x: (Math.random()-0.5)*5, y: (Math.random()-0.5)*5 },
               life: 1.0,
               maxLife: 1.0,
               size: Math.random() * 4 + 2,
               color: prey.type === PreyType.AMMONITE ? '#cdb499' : '#aa0000',
               radius: 0
             });
          }
          return false; // Remove prey
        }

        // Behavior: Flee or Move
        let fleeSpeed = 1.0;
        if (prey.type === PreyType.AMMONITE) fleeSpeed = 0.5;
        if (prey.type === PreyType.SQUID) fleeSpeed = 1.2;

        if (isRoaring) {
           prey.velocity.x += (prey.position.x - titanHeadPos.x) / distToHead * 1.5 * fleeSpeed;
           prey.velocity.y += (prey.position.y - titanHeadPos.y) / distToHead * 1.5 * fleeSpeed;
        } else if (distToHead < 300) {
           prey.velocity.x += (prey.position.x - titanHeadPos.x) / distToHead * 0.2 * fleeSpeed;
           prey.velocity.y += (prey.position.y - titanHeadPos.y) / distToHead * 0.2 * fleeSpeed;
        }

        // Natural movement updates
        if (prey.type === PreyType.SQUID) {
            // Squid bursts
            if (Math.random() < 0.02) {
                prey.velocity.x += (Math.random()-0.5) * 5;
                prey.velocity.y += (Math.random()-0.5) * 5;
            }
            prey.velocity.x *= 0.96; // More drag
            prey.velocity.y *= 0.96;
        } else {
            prey.velocity.x *= 0.98;
            prey.velocity.y *= 0.98;
        }

        prey.position.x += prey.velocity.x;
        prey.position.y += prey.velocity.y;

        // Min Speed Check
        const speed = Math.hypot(prey.velocity.x, prey.velocity.y);
        const minSpeed = prey.type === PreyType.AMMONITE ? 0.5 : 2;
        if (speed < minSpeed) {
            prey.velocity.x += (Math.random() - 0.5) * 0.5;
            prey.velocity.y += (Math.random() - 0.5) * 0.5;
        }

        // Orientation
        prey.angle = Math.atan2(prey.velocity.y, prey.velocity.x);

        // Screen Wrap
        if (prey.position.x < -50) prey.position.x = canvas.width + 50;
        if (prey.position.x > canvas.width + 50) prey.position.x = -50;
        if (prey.position.y < -50) prey.position.y = canvas.height + 50;
        if (prey.position.y > canvas.height + 50) prey.position.y = -50;

        // --- RENDER PREY ---
        ctx.save();
        ctx.translate(prey.position.x, prey.position.y);
        ctx.rotate(prey.angle); // Angle matches velocity direction
        
        if (prey.type === PreyType.LANTERNFISH) {
            // Rotated PI to face correct way for fish sprite logic
            ctx.rotate(Math.PI);
            ctx.fillStyle = '#b0c4de';
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            if (bioluminescence) {
                ctx.fillStyle = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.arc(-3, 2, 1, 0, Math.PI*2);
                ctx.arc(0, 3, 1, 0, Math.PI*2);
                ctx.arc(3, 2, 1, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-4, -1, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; 
            ctx.beginPath(); ctx.arc(-5, -1.5, 0.8, 0, Math.PI*2); ctx.fill();

        } else if (prey.type === PreyType.AMMONITE) {
            // Spiral Shell
            // Ammonites swim backwards, shell first. Velocity aligns to movement.
            // So shell should be "front" in velocity terms? No, they jet backwards.
            // Let's assume standard swimming visual: Tentacles trailing.
            
            // Draw Shell (Spiral approximation)
            ctx.fillStyle = '#cdb499';
            ctx.strokeStyle = '#8b7355';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2); // Main chamber
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(-6, 2, 7, 0, Math.PI * 2); // Inner whorl
            ctx.fill(); ctx.stroke();

            // Tentacles (Trailing behind, opposite to velocity which is angle 0)
            ctx.rotate(Math.PI); // Face backwards
            ctx.strokeStyle = '#cdb499';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let t=-1; t<=1; t++) {
               ctx.moveTo(8, t*3);
               ctx.quadraticCurveTo(15, t*5, 18 + Math.sin(time * 5 + t)*3, t*4);
            }
            ctx.stroke();

        } else if (prey.type === PreyType.SQUID) {
            // Vampire Squid
            // Pointy mantle, webbed arms
            ctx.rotate(-Math.PI/2); // Fix rotation to point velocity up relative to drawing
            
            // Mantle (Deep Red)
            ctx.fillStyle = '#660000';
            ctx.beginPath();
            ctx.moveTo(0, -12); // Tip
            ctx.bezierCurveTo(8, -5, 8, 5, 0, 8); // Right side
            ctx.bezierCurveTo(-8, 5, -8, -5, 0, -12); // Left side
            ctx.fill();

            // Web/Tentacles (Trailing)
            ctx.fillStyle = '#440000'; // Darker web
            ctx.beginPath();
            ctx.moveTo(-6, 5);
            ctx.lineTo(6, 5);
            ctx.lineTo(0, 15 + Math.sin(time*10)*3); // Pulsing tip
            ctx.fill();

            // Glowing Eyes (Blue)
            if (bioluminescence) {
                ctx.fillStyle = '#4488ff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#0000ff';
                ctx.beginPath();
                ctx.arc(-3, -2, 2, 0, Math.PI*2);
                ctx.arc(3, -2, 2, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        ctx.restore();
        return true;
      });

      // Respawn Prey
      if (preyRef.current.length < PREY_COUNT) {
         if (Math.random() < 0.05) {
            const spawnEdge = Math.random() < 0.5 ? 'x' : 'y';
            let sx, sy;
            if (spawnEdge === 'x') {
                sx = Math.random() < 0.5 ? -40 : canvas.width + 40;
                sy = Math.random() * canvas.height;
            } else {
                sx = Math.random() * canvas.width;
                sy = Math.random() < 0.5 ? -40 : canvas.height + 40;
            }
            preyRef.current.push(createRandomPrey(sx, sy));
         }
      }

      // --- 5. Titan Movement & Skinning ---
      
      // MOVEMENT LOGIC (Hybrid: Keyboard + Mouse)
      const baseMoveSpeed = isRoaring ? 0.08 : 0.05; 
      let vx = 0;
      let vy = 0;
      
      // Keyboard input
      const keys = keysRef.current;
      if (keys.has('ArrowUp')) vy -= 1;
      if (keys.has('ArrowDown')) vy += 1;
      if (keys.has('ArrowLeft')) vx -= 1;
      if (keys.has('ArrowRight')) vx += 1;

      if (vx !== 0 || vy !== 0) {
          // Keyboard driving
          const len = Math.hypot(vx, vy);
          const kSpeed = isRoaring ? 8 : 4; // Absolute pixels/frame for keyboard
          titanRef.current.x += (vx / len) * kSpeed;
          titanRef.current.y += (vy / len) * kSpeed;
          
          // Sync mouse target so it doesn't snap back when keys released
          mouseRef.current = { ...titanRef.current };
      } else {
          // Mouse/Touch driving
          const dx = mouseRef.current.x - titanRef.current.x;
          const dy = mouseRef.current.y - titanRef.current.y;
          titanRef.current.x += dx * baseMoveSpeed;
          titanRef.current.y += dy * baseMoveSpeed;
      }

      // Inverse Kinematics for Spine
      let prevPos = titanRef.current;
      const spine: Vector2[] = [prevPos];
      
      let headAngle = 0;

      const currentBody = titanBodyRef.current.length > 0 ? titanBodyRef.current : [];
      if (currentBody.length === 0) {
         for(let i=0; i<SEGMENT_COUNT; i++) currentBody.push(titanRef.current);
      }

      const newBody: Vector2[] = [];
      
      for (let i = 0; i < currentBody.length; i++) {
        const currentPos = currentBody[i];
        const distX = prevPos.x - currentPos.x;
        const distY = prevPos.y - currentPos.y;
        const angle = Math.atan2(distY, distX);
        
        if (i === 0) headAngle = angle;

        const segmentSize = SEGMENT_SPACING;
        const tx = prevPos.x - Math.cos(angle) * segmentSize;
        const ty = prevPos.y - Math.sin(angle) * segmentSize;
        
        // Fluid drag
        const drag = 0.4;
        const nx = currentPos.x + (tx - currentPos.x) * drag;
        const ny = currentPos.y + (ty - currentPos.y) * drag;
        
        newBody.push({ x: nx, y: ny });
        spine.push({ x: nx, y: ny });
        prevPos = { x: nx, y: ny };
      }
      titanBodyRef.current = newBody;

      // --- Rendering the Mosasaur Skin ---
      ctx.save();
      
      // Dynamic Jaw Opening
      const jawOpenTarget = nearestPreyDist < 180 ? Math.min(1, (180 - nearestPreyDist) / 100) : 0;
      const jawAngle = 0.1 + (jawOpenTarget * 0.5) + (isRoaring ? 0.6 : 0);

      // 1. Calculate ribs
      const leftPoints: Vector2[] = [];
      const rightPoints: Vector2[] = [];
      
      const getWidth = (i: number) => {
        if (i < 4) return 30 + i * 8; 
        if (i < 12) return 60 + Math.sin(i * 0.3) * 10;
        return Math.max(5, 60 - (i-12) * 5); 
      };

      for(let i=0; i<spine.length; i++) {
         let normalAngle = 0;
         if (i < spine.length - 1) {
             normalAngle = Math.atan2(spine[i+1].y - spine[i].y, spine[i+1].x - spine[i].x) + Math.PI/2;
         } else {
             normalAngle = Math.atan2(spine[i].y - spine[i-1].y, spine[i].x - spine[i-1].x) + Math.PI/2;
         }

         const w = getWidth(i);
         leftPoints.push({
             x: spine[i].x + Math.cos(normalAngle) * w,
             y: spine[i].y + Math.sin(normalAngle) * w
         });
         rightPoints.push({
             x: spine[i].x + Math.cos(normalAngle + Math.PI) * w,
             y: spine[i].y + Math.sin(normalAngle + Math.PI) * w
         });
      }

      // 2. Draw Fins (Paddles)
      const drawFin = (spineIdx: number, size: number, isRight: boolean) => {
          if (!spine[spineIdx] || !spine[spineIdx+1]) return;
          const pos = spine[spineIdx];
          const angle = Math.atan2(spine[spineIdx].y - spine[spineIdx+1].y, spine[spineIdx].x - spine[spineIdx+1].x);
          const finAngle = angle + (isRight ? Math.PI/2 : -Math.PI/2) - (Math.sin(time * 5) * 0.2);
          
          ctx.fillStyle = '#0f2430'; 
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x + Math.cos(finAngle) * size, pos.y + Math.sin(finAngle) * size);
          ctx.lineTo(pos.x + Math.cos(finAngle - 0.5) * (size*0.6), pos.y + Math.sin(finAngle - 0.5) * (size*0.6));
          ctx.fill();
      };
      
      drawFin(4, 90, true); 
      drawFin(4, 90, false); 
      drawFin(14, 60, true); 
      drawFin(14, 60, false); 

      // 3. Draw Body Skin
      ctx.beginPath();
      ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
      for(let i=1; i<leftPoints.length; i++) {
          const p = leftPoints[i];
          const prev = leftPoints[i-1];
          const cp = { x: (prev.x + p.x)/2, y: (prev.y + p.y)/2 };
          ctx.quadraticCurveTo(prev.x, prev.y, cp.x, cp.y);
      }
      ctx.lineTo(spine[spine.length-1].x, spine[spine.length-1].y); 
      
      for(let i=rightPoints.length-1; i>=0; i--) {
          const p = rightPoints[i];
          if (i < rightPoints.length-1) {
             const prev = rightPoints[i+1];
             const cp = { x: (prev.x + p.x)/2, y: (prev.y + p.y)/2 };
             ctx.quadraticCurveTo(prev.x, prev.y, cp.x, cp.y);
          } else {
             ctx.lineTo(p.x, p.y);
          }
      }
      ctx.closePath();

      const titanGrad = ctx.createLinearGradient(spine[0].x, spine[0].y, spine[spine.length-1].x, spine[spine.length-1].y);
      titanGrad.addColorStop(0, '#1a2e3b'); 
      titanGrad.addColorStop(0.5, '#0d161c'); 
      titanGrad.addColorStop(1, '#080f14'); 
      ctx.fillStyle = titanGrad;
      ctx.fill();

      // Scutes / Ridge
      ctx.strokeStyle = '#233845';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for(let i=3; i<spine.length - 3; i++) {
         ctx.moveTo(spine[i].x, spine[i].y);
         ctx.lineTo(spine[i+1].x, spine[i+1].y);
      }
      ctx.stroke();

      // 4. Draw Head
      ctx.save();
      ctx.translate(spine[0].x, spine[0].y);
      ctx.rotate(headAngle);

      // Lower Jaw
      ctx.fillStyle = '#152026';
      ctx.beginPath();
      ctx.rotate(jawAngle); 
      ctx.moveTo(0, 5);
      ctx.lineTo(50, 8);
      ctx.lineTo(55, 15);
      ctx.lineTo(10, 25);
      ctx.closePath();
      ctx.fill();
      
      // Teeth (Lower)
      ctx.fillStyle = '#eaddcf';
      for(let t=0; t<5; t++) {
          ctx.beginPath();
          ctx.moveTo(15 + t*8, 8);
          ctx.lineTo(18 + t*8, -4); 
          ctx.lineTo(21 + t*8, 8);
          ctx.fill();
      }
      ctx.rotate(-jawAngle); 

      // Upper Jaw
      ctx.fillStyle = '#1a2e3b';
      ctx.beginPath();
      ctx.rotate(-jawAngle * 0.3); 
      ctx.moveTo(0, -5);
      ctx.lineTo(60, -10); 
      ctx.lineTo(55, -25); 
      ctx.lineTo(10, -35); 
      ctx.closePath();
      ctx.fill();

      // Teeth (Upper)
      ctx.fillStyle = '#eaddcf';
      for(let t=0; t<6; t++) {
          ctx.beginPath();
          ctx.moveTo(15 + t*8, -10);
          ctx.lineTo(18 + t*8, 2); 
          ctx.lineTo(21 + t*8, -10);
          ctx.fill();
      }

      // Eye
      const eyeGlow = isRoaring ? '#ff3333' : '#ffff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = eyeGlow;
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(15, -20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Nostril
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(45, -18, 2, 1, 0, 0, Math.PI*2);
      ctx.fill();

      ctx.restore(); 
      ctx.restore(); 

      // 6. Particles
      if (vx !== 0 || vy !== 0 || Math.hypot(mouseRef.current.x - titanRef.current.x, mouseRef.current.y - titanRef.current.y) > 5) {
          particlesRef.current.push({
            id: Math.random().toString(),
            position: { 
                x: spine[4].x + (Math.random()-0.5)*10, 
                y: spine[4].y + (Math.random()-0.5)*10 
            },
            velocity: { x: (Math.random()-0.5), y: -Math.random()*2 - 0.5 },
            life: 0.8,
            maxLife: 1.0,
            size: Math.random() * 3,
            color: 'rgba(255, 255, 255, 0.2)',
            radius: 0
          });
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        p.life -= 0.01;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        return p.life > 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onScoreUpdate, isRoaring, bioluminescence]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 block" />;
};

export default GameCanvas;