import React, { useRef, useEffect, useCallback } from 'react';
import { Vector2, Entity, Particle, SoundType, Jellyfish, Seaweed, PreyEntity, PreyType, Vent, Anemone } from '../types';
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
  const ventsRef = useRef<Vent[]>([]);
  const anemonesRef = useRef<Anemone[]>([]);
  const initializedRef = useRef(false);
  
  // Configuration
  const SEGMENT_COUNT = 24; 
  const SEGMENT_SPACING = 18;
  const PREY_COUNT = 35; 
  const JELLY_COUNT = 6;
  const SEAWEED_COUNT = 30;
  const VENT_COUNT = 3;
  const ANEMONE_COUNT = 15;

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

    // 5. Initialize Vents
    const vents: Vent[] = [];
    for (let i = 0; i < VENT_COUNT; i++) {
      vents.push({
        x: Math.random() * window.innerWidth,
        height: 60 + Math.random() * 80,
        width: 30 + Math.random() * 40
      });
    }
    ventsRef.current = vents;

    // 6. Initialize Anemones
    const anemones: Anemone[] = [];
    for (let i = 0; i < ANEMONE_COUNT; i++) {
      anemones.push({
        x: Math.random() * window.innerWidth,
        radius: 10 + Math.random() * 10,
        tentacleLength: 20 + Math.random() * 20,
        color: `hsl(${Math.random() * 60 + 160}, 80%, 60%)`, // Cyan/Teal range
        phaseOffset: Math.random() * Math.PI * 2
      });
    }
    anemonesRef.current = anemones;

    initializedRef.current = true;
  }, []);

  // Helper to spawn diverse prey
  const createRandomPrey = (x?: number, y?: number): PreyEntity => {
      const rand = Math.random();
      const pos = {
          x: x ?? (Math.random() * window.innerWidth),
          y: y ?? (Math.random() * window.innerHeight)
      };

      // Weights for spawn rates
      if (rand < 0.35) {
          // 35% Lanternfish
          return {
            id: Math.random().toString(36),
            type: PreyType.LANTERNFISH,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 },
            radius: 6,
            color: '#aaddff',
            angle: 0
          };
      } else if (rand < 0.50) {
          // 15% Ammonite (Slower, tankier)
          return {
            id: Math.random().toString(36),
            type: PreyType.AMMONITE,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
            radius: 12, 
            color: '#cdb499',
            angle: 0
          };
      } else if (rand < 0.60) {
          // 10% Vampire Squid (Drifts, bursts)
          return {
            id: Math.random().toString(36),
            type: PreyType.SQUID,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
            radius: 10,
            color: '#660000',
            angle: 0,
            tailPhase: Math.random() * Math.PI
          };
      } else if (rand < 0.75) {
          // 15% Anglerfish (Lurker) - INCREASED SIZE (Approx 1/3 Titan width)
          return {
            id: Math.random().toString(36),
            type: PreyType.ANGLERFISH,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 1, y: (Math.random() - 0.5) * 0.5 },
            radius: 28, // Significantly bigger
            color: '#221100',
            angle: 0
          };
      } else if (rand < 0.85) {
          // 10% Gulper Eel (Serpentine)
          return {
            id: Math.random().toString(36),
            type: PreyType.GULPER_EEL,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 2.5, y: (Math.random() - 0.5) * 1 },
            radius: 11,
            color: '#111111',
            angle: 0,
            tailPhase: Math.random() * Math.PI
          };
      } else if (rand < 0.93) {
          // 8% Lancetfish (Fast, large)
          return {
            id: Math.random().toString(36),
            type: PreyType.LANCETFISH,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 3 },
            radius: 18,
            color: '#c0c0c0',
            angle: 0
          };
      } else {
          // 7% Coelacanth (Heavy tank)
          return {
            id: Math.random().toString(36),
            type: PreyType.COELACANTH,
            position: pos,
            velocity: { x: (Math.random() - 0.5) * 1, y: (Math.random() - 0.5) * 0.5 },
            radius: 25,
            color: '#2a3b55',
            angle: 0
          };
      }
  };

  // --- Input Handling ---

  const handleMouseMove = useCallback((e: MouseEvent) => {
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

      // --- 2. Flora (Vents, Anemones, Worms) ---
      
      // Hydrothermal Vents
      ventsRef.current.forEach(vent => {
         const bx = vent.x;
         const by = canvas.height;
         
         // Draw Vent Stack
         const ventGrad = ctx.createLinearGradient(bx, by - vent.height, bx, by);
         ventGrad.addColorStop(0, '#333');
         ventGrad.addColorStop(1, '#111');
         ctx.fillStyle = ventGrad;
         ctx.beginPath();
         ctx.moveTo(bx - vent.width/2, by);
         ctx.lineTo(bx - vent.width/4, by - vent.height);
         ctx.lineTo(bx + vent.width/4, by - vent.height);
         ctx.lineTo(bx + vent.width/2, by);
         ctx.fill();

         // Emit Particles (Smokers)
         if (Math.random() < 0.2) {
             particlesRef.current.push({
                 id: `smoke-${Math.random()}`,
                 position: { x: bx + (Math.random()-0.5)*10, y: by - vent.height },
                 velocity: { x: (Math.random()-0.5)*0.5, y: -1 - Math.random() },
                 life: 1.5,
                 maxLife: 1.5,
                 size: 4 + Math.random() * 6,
                 color: 'rgba(20, 20, 20, 0.6)', // Dark smoke
                 radius: 0
             });
         }
      });

      // Anemones
      anemonesRef.current.forEach(anemone => {
         const ax = anemone.x;
         const ay = canvas.height;
         
         ctx.fillStyle = '#221122';
         ctx.beginPath();
         ctx.arc(ax, ay, anemone.radius, Math.PI, 0); // Dome base
         ctx.fill();

         ctx.strokeStyle = anemone.color;
         ctx.lineWidth = 2;
         ctx.shadowColor = anemone.color;
         ctx.shadowBlur = bioluminescence ? 10 : 0;
         
         for(let i=0; i<12; i++) {
            const angle = (Math.PI / 12) * i + Math.PI + (Math.PI/24);
            const sway = Math.sin(time * 2 + anemone.phaseOffset + i) * 10;
            ctx.beginPath();
            ctx.moveTo(ax + Math.cos(angle)*anemone.radius*0.5, ay - Math.sin(angle)*2);
            ctx.quadraticCurveTo(
               ax + Math.cos(angle)*anemone.tentacleLength + sway, 
               ay + Math.sin(angle)*anemone.tentacleLength - anemone.tentacleLength,
               ax + Math.cos(angle)*anemone.tentacleLength + sway*1.5,
               ay + Math.sin(angle)*anemone.tentacleLength - anemone.tentacleLength*1.5
            );
            ctx.stroke();
         }
         ctx.shadowBlur = 0;
      });

      // Tube Worms (Existing)
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
        const biteRadius = prey.radius + 60; 
        if (distToHead < biteRadius) {
          soundService.play(SoundType.EAT);
          // Score depends on type
          let points = 1;
          if (prey.type === PreyType.AMMONITE) points = 3;
          if (prey.type === PreyType.SQUID) points = 2;
          if (prey.type === PreyType.ANGLERFISH) points = 4;
          if (prey.type === PreyType.GULPER_EEL) points = 5;
          if (prey.type === PreyType.COELACANTH) points = 10;
          if (prey.type === PreyType.LANCETFISH) points = 8;

          onScoreUpdate(points);
          
          // Blood/Debris
          const pCount = prey.radius > 15 ? 12 : 6;
          for(let k=0; k<pCount; k++) {
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

        // Behavior: Flee, Move or ATTRACT
        let fleeSpeed = 1.0;
        if (prey.type === PreyType.AMMONITE || prey.type === PreyType.ANGLERFISH || prey.type === PreyType.COELACANTH) fleeSpeed = 0.5;
        if (prey.type === PreyType.SQUID || prey.type === PreyType.GULPER_EEL || prey.type === PreyType.LANCETFISH) fleeSpeed = 1.3;

        // ATTRACTION MECHANIC (The Lantern)
        // If lantern is on, not roaring, and prey is in medium range
        if (bioluminescence && !isRoaring && distToHead > 150 && distToHead < 600) {
            // Stronger pull for smaller/phototactic prey
            const attractionStrength = 0.05 * fleeSpeed;
            prey.velocity.x -= (prey.position.x - titanHeadPos.x) / distToHead * attractionStrength;
            prey.velocity.y -= (prey.position.y - titanHeadPos.y) / distToHead * attractionStrength;
        }

        if (isRoaring) {
           prey.velocity.x += (prey.position.x - titanHeadPos.x) / distToHead * 1.5 * fleeSpeed;
           prey.velocity.y += (prey.position.y - titanHeadPos.y) / distToHead * 1.5 * fleeSpeed;
        } else if (distToHead < 300) {
           // Normal proximity avoidance
           prey.velocity.x += (prey.position.x - titanHeadPos.x) / distToHead * 0.2 * fleeSpeed;
           prey.velocity.y += (prey.position.y - titanHeadPos.y) / distToHead * 0.2 * fleeSpeed;
        }

        // Natural movement updates
        if (prey.type === PreyType.SQUID || prey.type === PreyType.GULPER_EEL || prey.type === PreyType.LANCETFISH) {
            // Bursts/Undulation
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
        const minSpeed = (prey.type === PreyType.AMMONITE || prey.type === PreyType.ANGLERFISH || prey.type === PreyType.COELACANTH) ? 0.3 : 2;
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
        ctx.rotate(prey.angle); 
        
        if (prey.type === PreyType.LANTERNFISH) {
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
            ctx.fillStyle = '#cdb499';
            ctx.strokeStyle = '#8b7355';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(-6, 2, 7, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();

            ctx.rotate(Math.PI); 
            ctx.strokeStyle = '#cdb499';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let t=-1; t<=1; t++) {
               ctx.moveTo(8, t*3);
               ctx.quadraticCurveTo(15, t*5, 18 + Math.sin(time * 5 + t)*3, t*4);
            }
            ctx.stroke();

        } else if (prey.type === PreyType.SQUID) {
            ctx.rotate(-Math.PI/2); 
            ctx.fillStyle = '#660000';
            ctx.beginPath();
            ctx.moveTo(0, -12); 
            ctx.bezierCurveTo(8, -5, 8, 5, 0, 8); 
            ctx.bezierCurveTo(-8, 5, -8, -5, 0, -12); 
            ctx.fill();

            ctx.fillStyle = '#440000'; 
            ctx.beginPath();
            ctx.moveTo(-6, 5);
            ctx.lineTo(6, 5);
            ctx.lineTo(0, 15 + Math.sin(time*10)*3); 
            ctx.fill();

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
        } else if (prey.type === PreyType.ANGLERFISH) {
            // Anglerfish Logic
            ctx.rotate(Math.PI);
            ctx.fillStyle = '#1a0a00'; // Dark brown
            ctx.beginPath();
            // SCALED UP BODY for visibility
            ctx.ellipse(0, 0, prey.radius, prey.radius * 0.8, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Lure Stalk
            ctx.strokeStyle = '#332211';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-prey.radius/2, -prey.radius/2); 
            ctx.quadraticCurveTo(-prey.radius*1.5, -prey.radius*1.5, -prey.radius*2, -prey.radius*0.5);
            ctx.stroke();

            // Lure Bulb (Glows)
            ctx.fillStyle = '#ccffcc';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#55ff55';
            ctx.beginPath();
            ctx.arc(-prey.radius*2, -prey.radius*0.5, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Teeth (Visible)
            ctx.fillStyle = '#eeeeee';
            const toothSize = 4;
            ctx.beginPath();
            // Upper
            ctx.moveTo(-prey.radius + 5, 2); ctx.lineTo(-prey.radius + 10, 2 + toothSize); ctx.lineTo(-prey.radius + 15, 2);
            // Lower
            ctx.moveTo(-prey.radius + 8, -2); ctx.lineTo(-prey.radius + 12, -2 - toothSize); ctx.lineTo(-prey.radius + 18, -2);
            ctx.fill();

        } else if (prey.type === PreyType.GULPER_EEL) {
            // Gulper Eel Logic
            ctx.rotate(Math.PI);
            
            // Giant Head/Mouth
            ctx.fillStyle = '#080808';
            ctx.beginPath();
            ctx.ellipse(-5, 0, 10, 8, 0, 0, Math.PI*2);
            ctx.fill();

            // Jaw Line
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-15, 0); ctx.lineTo(5, 0);
            ctx.stroke();

            // Tail (Whip-like, undulating)
            ctx.strokeStyle = '#080808';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(5, 0);
            for(let t=0; t<10; t++) {
               // Sine wave tail
               const tailX = 5 + t * 5;
               const tailY = Math.sin(time * 10 - t) * 4;
               ctx.lineTo(tailX, tailY);
            }
            ctx.stroke();

            // Tiny Eye
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.arc(-10, -3, 1, 0, Math.PI*2); ctx.fill();

        } else if (prey.type === PreyType.COELACANTH) {
            // Coelacanth (Ancient fish, bulky, multiple fins)
            ctx.rotate(Math.PI);
            ctx.fillStyle = '#2a3b55'; // Deep blue/slate
            
            // Body
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI*2);
            ctx.fill();

            // Scales texture (Cross hatch)
            ctx.strokeStyle = '#3a4b65';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-10, -5); ctx.lineTo(0, 5);
            ctx.moveTo(0, -8); ctx.lineTo(10, 2);
            ctx.stroke();

            // Lobed Fins (Distinctive trait)
            const finWag = Math.sin(time * 4) * 0.2;
            ctx.fillStyle = '#223344';
            // Pectoral
            ctx.beginPath(); ctx.ellipse(-5, 8, 6, 3, Math.PI/3 + finWag, 0, Math.PI*2); ctx.fill();
            // Anal/Second dorsal
            ctx.beginPath(); ctx.ellipse(10, 5, 5, 2, Math.PI/4 + finWag, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(10, -5, 5, 2, -Math.PI/4 - finWag, 0, Math.PI*2); ctx.fill();

            // Trilobate Tail
            ctx.beginPath();
            ctx.moveTo(18, -4); ctx.lineTo(25, -6); ctx.lineTo(25, 6); ctx.lineTo(18, 4);
            ctx.moveTo(25, -2); ctx.lineTo(30, 0); ctx.lineTo(25, 2); // Central lobe
            ctx.fill();

            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-12, -2, 2, 0, Math.PI*2); ctx.fill();

        } else if (prey.type === PreyType.LANCETFISH) {
            // Lancetfish (Long, thin, high dorsal fin)
            ctx.rotate(Math.PI);
            ctx.fillStyle = '#c0c0c0'; // Silver
            
            // Long Body
            ctx.beginPath();
            ctx.moveTo(-18, 0); // Nose
            ctx.quadraticCurveTo(0, -6, 20, 0); // Back
            ctx.quadraticCurveTo(0, 6, -18, 0); // Belly
            ctx.fill();

            // High Dorsal Sail
            ctx.fillStyle = '#112233'; // Dark blue fin
            ctx.beginPath();
            ctx.moveTo(-10, -3);
            ctx.lineTo(15, -3);
            ctx.lineTo(5, -15); // High point
            ctx.lineTo(-10, -3);
            ctx.fill();

            // Jaws (Long)
            ctx.strokeStyle = '#a0a0a0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-18, 0); ctx.lineTo(-10, 0);
            ctx.stroke();

            // Tail
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath();
            ctx.moveTo(20, 0); ctx.lineTo(28, -5); ctx.lineTo(25, 0); ctx.lineTo(28, 5);
            ctx.fill();

            // Big Eye
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-12, -2, 3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffff00'; // Reflective eye
            ctx.beginPath(); ctx.arc(-12, -2, 1.5, 0, Math.PI*2); ctx.fill();
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
      
      const baseMoveSpeed = isRoaring ? 0.08 : 0.05; 
      let vx = 0;
      let vy = 0;
      
      const keys = keysRef.current;
      if (keys.has('ArrowUp')) vy -= 1;
      if (keys.has('ArrowDown')) vy += 1;
      if (keys.has('ArrowLeft')) vx -= 1;
      if (keys.has('ArrowRight')) vx += 1;

      if (vx !== 0 || vy !== 0) {
          const len = Math.hypot(vx, vy);
          const kSpeed = isRoaring ? 8 : 4;
          titanRef.current.x += (vx / len) * kSpeed;
          titanRef.current.y += (vy / len) * kSpeed;
          mouseRef.current = { ...titanRef.current };
      } else {
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
      
      const jawOpenTarget = nearestPreyDist < 180 ? Math.min(1, (180 - nearestPreyDist) / 100) : 0;
      const jawAngle = 0.1 + (jawOpenTarget * 0.5) + (isRoaring ? 0.6 : 0);

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

      // Draw Fins
      const drawFin = (spineIdx: number, size: number, isRight: boolean) => {
          if (!spine[spineIdx] || !spine[spineIdx+1]) return;
          const pos = spine[spineIdx];
          const angle = Math.atan2(spine[spineIdx].y - spine[spineIdx+1].y, spine[spineIdx].x - spine[spineIdx+1].x);
          const finAngle = angle + (isRight ? Math.PI/2 : -Math.PI/2) - (Math.sin(time * 5) * 0.2);
          
          ctx.fillStyle = bioluminescence ? '#0f2430' : '#050a0d'; // Darker if no bio
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

      // Draw Body Skin
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

      // Adaptive Camouflage Skin Gradient
      const titanGrad = ctx.createLinearGradient(spine[0].x, spine[0].y, spine[spine.length-1].x, spine[spine.length-1].y);
      if (bioluminescence) {
        // Active mode: Lighter, more detailed
        titanGrad.addColorStop(0, '#1a2e3b'); 
        titanGrad.addColorStop(0.5, '#0d161c'); 
        titanGrad.addColorStop(1, '#080f14'); 
      } else {
        // Stealth/Camouflage mode: Very dark, blends with abyss
        titanGrad.addColorStop(0, '#0a1014'); 
        titanGrad.addColorStop(0.5, '#05080a'); 
        titanGrad.addColorStop(1, '#020202'); 
      }
      ctx.fillStyle = titanGrad;
      ctx.fill();

      // Lateral Line System (Sensory Pores) with Traveling Pulse
      // Pulse calculation: A wave traveling from tail (index high) to head (index 0).
      // spine.length is approx 24.
      const pulseSpeed = 20.0;
      // We want the peak to move from spine.length to 0.
      const pulsePeriod = spine.length + 10;
      const pulsePhase = (time * pulseSpeed) % pulsePeriod; 
      // Current active index in the wave:
      const activePulseIndex = pulsePeriod - pulsePhase;

      for(let i=4; i<spine.length - 4; i+=2) {
         if(!spine[i] || !spine[i+1]) continue;
         const angle = Math.atan2(spine[i+1].y - spine[i].y, spine[i+1].x - spine[i].x) + Math.PI/2;
         const px = spine[i].x + Math.cos(angle) * 10;
         const py = spine[i].y + Math.sin(angle) * 10;
         
         // Base sensory dot (Green fluorescent if active)
         ctx.fillStyle = bioluminescence ? 'rgba(57, 255, 20, 0.3)' : 'rgba(50, 100, 150, 0.1)';
         ctx.beginPath();
         const r = 2 + Math.sin(time * 3 + i) * 1; 
         ctx.arc(px, py, r, 0, Math.PI*2);
         ctx.fill();

         // Intermittent Flash Effect (Traversing Body) - NEON GREEN
         if (bioluminescence) {
             const distFromWave = Math.abs(i - activePulseIndex);
             if (distFromWave < 4) {
                 const intensity = (4 - distFromWave) / 4; // 0 to 1
                 ctx.shadowBlur = 30 * intensity;
                 ctx.shadowColor = '#39ff14'; // Neon Green
                 ctx.fillStyle = `rgba(57, 255, 20, ${intensity})`;
                 
                 // Draw a glowing rib/stripe instead of just a dot for maximum impact
                 const w = getWidth(i);
                 ctx.beginPath();
                 const pLeft = { x: spine[i].x + Math.cos(angle) * (w*0.8), y: spine[i].y + Math.sin(angle) * (w*0.8) };
                 const pRight = { x: spine[i].x - Math.cos(angle) * (w*0.8), y: spine[i].y - Math.sin(angle) * (w*0.8) };
                 
                 // Draw curved stripe
                 ctx.moveTo(pLeft.x, pLeft.y);
                 ctx.quadraticCurveTo(spine[i].x, spine[i].y, pRight.x, pRight.y);
                 ctx.strokeStyle = `rgba(57, 255, 20, ${intensity * 0.8})`;
                 ctx.lineWidth = 6 * intensity;
                 ctx.stroke();
                 
                 ctx.shadowBlur = 0;
             }
         }
      }

      // Scutes / Ridge
      ctx.strokeStyle = bioluminescence ? '#233845' : '#111820';
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

      // --- TITAN LURE (Anglerfish style, Neon Green) ---
      if (bioluminescence) {
          const sway = Math.sin(time * 3) * 0.2;
          ctx.strokeStyle = '#0a1a0a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, -15); // Forehead
          // Organic curve for stalk
          ctx.bezierCurveTo(20, -60, 40 + Math.cos(time)*5, -80, 70 + Math.cos(time*0.8)*10, -50 + Math.sin(time)*10);
          ctx.stroke();

          // Bulb
          const bulbX = 70 + Math.cos(time*0.8)*10;
          const bulbY = -50 + Math.sin(time)*10;
          
          ctx.shadowBlur = 35;
          ctx.shadowColor = '#39ff14'; // Neon Green Glow
          ctx.fillStyle = '#ccffcc';
          ctx.beginPath();
          ctx.arc(bulbX, bulbY, 8, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // Lower Jaw
      ctx.fillStyle = bioluminescence ? '#152026' : '#0a0f12';
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
      ctx.fillStyle = bioluminescence ? '#1a2e3b' : '#0e151a';
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
      const eyeGlow = isRoaring ? '#ff3333' : (bioluminescence ? '#39ff14' : '#444400'); // Green if passive
      ctx.shadowBlur = bioluminescence ? 15 : 0;
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