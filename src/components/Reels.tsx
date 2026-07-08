import React, { useState, useEffect, useRef } from 'react';
import type { SubState, SpinInfo, GameState } from '../hooks/usePachinko';
import { PseudoRen } from './PseudoRen';
import './Reels.css';

interface ReelState {
  position: number;
  speed: number;
  target: number;
  phase: 'IDLE' | 'SPINNING' | 'DECELERATING' | 'SLIDING' | 'BOUNCING';
  remainingDist: number;
  bounceOffset: number;
  bounceVelocity: number;
}

interface ReelsProps {
  subState: SubState;
  spinInfo: SpinInfo | null;
  speedMode: 0 | 1 | 2;
  gameState: GameState;
}

export const Reels: React.FC<ReelsProps> = ({ subState, spinInfo, speedMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number | null>(null);
  const [pseudoFlash, setPseudoFlash] = useState(false);
  const [isReachActive, setIsReachActive] = useState(false);
  const [pseudoPhase, setPseudoPhase] = useState(0);
  const [pseudoFail, setPseudoFail] = useState(false);

  const reelsRef = useRef<ReelState[]>([
    { position: 0, speed: 0, target: 0, phase: 'IDLE', remainingDist: 0, bounceOffset: 0, bounceVelocity: 0 },
    { position: 0, speed: 0, target: 0, phase: 'IDLE', remainingDist: 0, bounceOffset: 0, bounceVelocity: 0 },
    { position: 0, speed: 0, target: 0, phase: 'IDLE', remainingDist: 0, bounceOffset: 0, bounceVelocity: 0 },
  ]);

  // Load images
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= 9; i++) {
      const img = new Image();
      img.src = `/${i}.png`;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Main Canvas Render Loop
  // ... (keep rendering logic unchanged)
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const reelWidth = width / 3;
      const symbolHeight = height / 1.6;
      const images = imagesRef.current;

      reelsRef.current.forEach((r, i) => {
        // Physical update
        if (r.phase === 'SPINNING') {
          r.position = (r.position + r.speed) % 9;
        } else if (r.phase === 'DECELERATING') {
          r.remainingDist -= r.speed;
          if (r.remainingDist <= 0) {
            r.position = r.target;
            r.phase = 'BOUNCING';
            r.bounceVelocity = Math.min(r.speed * 0.4, 0.3);
            r.speed = 0;
          } else {
            r.speed = Math.max(0.04, r.remainingDist * 0.08);
            r.position = (r.target - r.remainingDist + 900) % 9;
          }
        } else if (r.phase === 'SLIDING') {
          r.position = (r.position + r.speed) % 9;
        } else if (r.phase === 'BOUNCING') {
          r.bounceOffset += r.bounceVelocity;
          r.bounceVelocity -= r.bounceOffset * 0.5; // Spring stiffness
          r.bounceVelocity *= 0.6; // Friction
          if (Math.abs(r.bounceOffset) < 0.005 && Math.abs(r.bounceVelocity) < 0.005) {
            r.bounceOffset = 0;
            r.phase = 'IDLE';
          }
        }

        // --- DRAWING ---
        ctx.save();
        
        // Reel Background
        ctx.fillStyle = 'rgba(10, 0, 0, 0.8)';
        ctx.fillRect(i * reelWidth + 10, 10, reelWidth - 20, height - 20);
        
        // Clip to reel bounds
        ctx.beginPath();
        ctx.rect(i * reelWidth + 10, 10, reelWidth - 20, height - 20);
        ctx.clip();

        // Calculate symbol positions
        const centerIndex = Math.floor(r.position);
        const offset = r.position - centerIndex + r.bounceOffset;

        // Draw symbols (current, previous, next)
        for (let offsetIndex = -2; offsetIndex <= 2; offsetIndex++) {
          let drawIndex = (centerIndex + offsetIndex + 9) % 9;
          const img = images[drawIndex];
          if (img && img.complete) {
            const yPos = height / 2 - symbolHeight / 2 + (offsetIndex - offset) * symbolHeight;
            
            // Motion Blur
            if (r.phase === 'SPINNING' || r.speed > 0.3) {
              ctx.globalAlpha = 0.5;
              ctx.drawImage(img, i * reelWidth + 20, yPos - 20, reelWidth - 40, symbolHeight + 40);
              ctx.globalAlpha = 1.0;
            } else {
              ctx.drawImage(img, i * reelWidth + 20, yPos, reelWidth - 40, symbolHeight);
            }
          }
        }

        // Inner shadow effect
        const gradient = ctx.createLinearGradient(0, 10, 0, height - 10);
        gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(0.2, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.8, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(i * reelWidth + 10, 10, reelWidth - 20, height - 20);

        // Cyber-punk border
        ctx.strokeStyle = r.phase === 'IDLE' ? '#550011' : '#ff0055';
        ctx.lineWidth = 4;
        ctx.strokeRect(i * reelWidth + 10, 10, reelWidth - 20, height - 20);
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Animation Sequence Logic
  useEffect(() => {
    if (subState !== 'SPINNING' || !spinInfo) {
      setPseudoPhase(0);
      setPseudoFail(false);
      return;
    }

    let isCancelled = false;
    let timers: number[] = [];

    const wait = (ms: number) => new Promise<void>(resolve => {
      const t = setTimeout(() => resolve(), ms);
      timers.push(t);
    });

    const stopReel = (index: number, target: number, extraSpins: number = 1) => {
      const r = reelsRef.current[index];
      r.target = target;
      let dist = target - r.position;
      while (dist < 0) dist += 9;
      r.remainingDist = dist + 9 * extraSpins;
      r.phase = 'DECELERATING';
    };

      const runSequence = async () => {
      setIsReachActive(false);

      if (spinInfo.hasPseudoAnim) {
        setPseudoPhase(1); // Initial scatter
        await wait(500);
      }

      for (let p = 0; p <= spinInfo.pseudoCount; p++) {
        if (isCancelled) break;
        
        const isLast = p === spinInfo.pseudoCount;
        let targets = spinInfo.finalReels.map(n => parseInt(n) - 1);
        
        if (!isLast) {
          const reach = Math.floor(Math.random() * 9);
          const miss = (reach + 1) % 9;
          targets = [reach, miss, reach];
        }

        // SPIN ALL
        reelsRef.current.forEach(r => {
          if (r.phase === 'IDLE' || r.phase === 'BOUNCING') {
            r.phase = 'SPINNING';
            r.speed = 0.5 + Math.random() * 0.1;
          }
        });

        const L_STOP = speedMode === 2 ? 100 : speedMode === 1 ? 300 : 500;
        const R_STOP = speedMode === 2 ? 100 : speedMode === 1 ? 300 : 500;

        await wait(L_STOP);
        if (isCancelled) break;
        stopReel(0, targets[0], 1); // LEFT REEL

        await wait(R_STOP);
        if (isCancelled) break;
        stopReel(2, targets[2], 1); // RIGHT REEL

        if (isLast) {
          if (spinInfo.hasPseudoAnim) {
            setPseudoFail(true);
          }
          
          if (spinInfo.isReach) {
            await wait(300);
            if (isCancelled) break;
            setIsReachActive(true);
            reelsRef.current[1].phase = 'SLIDING';
            reelsRef.current[1].speed = 0.04; // Very slow slide
            await wait(2000); // Dramatic reach tease
            setIsReachActive(false);
          } else {
            await wait(300);
          }

          if (isCancelled) break;
          stopReel(1, targets[1], 0.5); // CENTER REEL
          await wait(600);
        } else {
          // INTERMEDIATE PSEUDO SPIN
          await wait(300); // Short reach tease

          if (isCancelled) break;
          setPseudoPhase(p * 2 + 2); // Keizoku
          setPseudoFlash(true);
          await wait(200);
          setPseudoFlash(false);
          await wait(700); // Show Keizoku
          setPseudoPhase(p * 2 + 3); // Scatter
          await wait(200);
          
          // Center reel remains spinning into next loop!
        }
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      timers.forEach(clearTimeout);
      if (spinInfo) {
        reelsRef.current.forEach((r, i) => {
          r.phase = 'IDLE';
          r.speed = 0;
          r.position = parseInt(spinInfo.finalReels[i]) - 1;
        });
      }
    };
  }, [subState, spinInfo, speedMode]);

  return (
    <div className={`reels-container ${isReachActive ? 'shake-hard' : ''}`}>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={320} 
        style={{ width: '90%', maxWidth: '100%', borderRadius: '10px', boxShadow: '0 0 15px rgba(255, 0, 85, 0.4)' }}
      />
      <div className={`reach-flash ${isReachActive ? 'active' : ''}`} />
      <div className={`pseudo-flash ${pseudoFlash ? 'active' : ''}`} />
      <PseudoRen phase={pseudoPhase} showFail={pseudoFail} />
    </div>
  );
};
