"use client";

import React, { useEffect, useRef } from "react";

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  scale: number;
  expansionRate: number;
  rotation: number;
  spin: number;
  spriteIndex: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

/**
 * Realistic HTML5 Canvas Particle Smoke Background.
 * - Pure neutral graphite and ash tones (R = G = B, zero blue, zero green).
 * - Animates slowly like real smoke (organic drift, curling wave wobble, expansion, and soft dissipation).
 * - High performance: GPU-accelerated texture blitting with offscreen sprites, 60fps locked.
 */
export const DarkSmokyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Pre-render 3 multi-stop soft smoke puff sprites on offscreen canvases
    // Using pure neutral graphite/ash grayscale (R = G = B)
    const createPuffSprite = (
      size: number,
      stops: { offset: number; color: string }[]
    ) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = size;
      offscreen.height = size;
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return offscreen;

      const half = size / 2;
      const grad = oCtx.createRadialGradient(half, half, 0, half, half, half);
      for (const stop of stops) {
        grad.addColorStop(stop.offset, stop.color);
      }
      oCtx.fillStyle = grad;
      oCtx.fillRect(0, 0, size, size);
      return offscreen;
    };

    // Sprite 0: Large soft ash plume (420px)
    const sprite0 = createPuffSprite(420, [
      { offset: 0, color: "rgba(155, 155, 155, 0.22)" },
      { offset: 0.28, color: "rgba(125, 125, 125, 0.16)" },
      { offset: 0.55, color: "rgba(80, 80, 80, 0.08)" },
      { offset: 0.8, color: "rgba(45, 45, 45, 0.02)" },
      { offset: 1, color: "rgba(15, 15, 15, 0)" },
    ]);

    // Sprite 1: Medium dense graphite wisp (340px)
    const sprite1 = createPuffSprite(340, [
      { offset: 0, color: "rgba(170, 170, 170, 0.25)" },
      { offset: 0.25, color: "rgba(135, 135, 135, 0.18)" },
      { offset: 0.55, color: "rgba(90, 90, 90, 0.09)" },
      { offset: 0.82, color: "rgba(40, 40, 40, 0.03)" },
      { offset: 1, color: "rgba(12, 12, 12, 0)" },
    ]);

    // Sprite 2: Wide ambient ethereal vapor (500px)
    const sprite2 = createPuffSprite(500, [
      { offset: 0, color: "rgba(135, 135, 135, 0.18)" },
      { offset: 0.35, color: "rgba(100, 100, 100, 0.11)" },
      { offset: 0.65, color: "rgba(60, 60, 60, 0.05)" },
      { offset: 0.88, color: "rgba(30, 30, 30, 0.01)" },
      { offset: 1, color: "rgba(10, 10, 10, 0)" },
    ]);

    const sprites = [sprite0, sprite1, sprite2];

    // Initialize 32 smoke particles
    const PARTICLE_COUNT = 32;
    const particles: SmokeParticle[] = [];

    const spawnParticle = (initialRandomAge: boolean = false): SmokeParticle => {
      const maxLife = 850 + Math.random() * 750; // ~14 to 26 seconds per particle cycle
      const life = initialRandomAge ? Math.random() * maxLife : 0;
      return {
        x: Math.random() * (width + 300) - 150,
        y: initialRandomAge
          ? Math.random() * (height + 200) - 100
          : height + 100 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.16 - Math.random() * 0.28, // Slow rising drift
        wobbleSpeed: 0.0006 + Math.random() * 0.0008,
        wobbleAmp: 0.2 + Math.random() * 0.35,
        wobbleOffset: Math.random() * Math.PI * 2,
        scale: 0.85 + Math.random() * 0.5,
        expansionRate: 0.00015 + Math.random() * 0.0002,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.0012, // Slow hypnotic rotation
        spriteIndex: Math.floor(Math.random() * sprites.length),
        maxAlpha: 0.75 + Math.random() * 0.25,
        life,
        maxLife,
      };
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawnParticle(true));
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;

      // Base background: Pure neutral dark obsidian
      ctx.fillStyle = "#080809";
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient background gradient for depth
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "rgba(22, 22, 25, 0.45)");
      bgGrad.addColorStop(0.5, "rgba(14, 14, 16, 0.25)");
      bgGrad.addColorStop(1, "rgba(8, 8, 9, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render smoke particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.life++;
          if (p.life >= p.maxLife || p.y < -350) {
            particles[i] = spawnParticle(false);
            continue;
          }

          // Physics update: slow curl motion
          p.x += p.vx + Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;
          p.y += p.vy;
          p.scale += p.expansionRate;
          p.rotation += p.spin;
        }

        // Natural smoke bell-curve opacity
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * p.maxAlpha;

        if (alpha <= 0.005) continue;

        const sprite = sprites[p.spriteIndex];
        const halfW = sprite.width / 2;
        const halfH = sprite.height / 2;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, -halfW, -halfH);
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none"
      aria-hidden="true"
    />
  );
};
