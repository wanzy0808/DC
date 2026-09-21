"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COUNT = 18;
type Petal = { x: number; y: number; vx: number; vy: number; spin: number; angle: number; size: number; depth: number };

export default function WindRosePetals() {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = layer.current;
    if (!root || reduced) return;
    const nodes = Array.from(root.children) as HTMLSpanElement[];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let previous = performance.now();
    let pointerX = -1000;
    let pointerY = -1000;
    let windX = 0;
    let windY = 0;
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    const petals: Petal[] = nodes.map((_, i) => ({
      x: (i * 0.61803398875 % 1) * width,
      y: (i * 0.38196601125 % 1) * height,
      vx: 0, vy: 0, spin: i % 2 ? 1 : -1, angle: i * 47,
      size: 9 + (i % 5) * 3, depth: 0.65 + (i % 4) * 0.15,
    }));

    const resize = () => { width = window.innerWidth; height = window.innerHeight; };
    const move = (event: PointerEvent) => {
      const dx = lastPointerX < 0 ? 0 : event.clientX - lastPointerX;
      const dy = lastPointerY < 0 ? 0 : event.clientY - lastPointerY;
      windX = Math.max(-18, Math.min(18, windX + dx * 0.32));
      windY = Math.max(-12, Math.min(12, windY + dy * 0.18));
      pointerX = lastPointerX = event.clientX;
      pointerY = lastPointerY = event.clientY;
    };
    const leave = () => { pointerX = pointerY = -1000; lastPointerX = lastPointerY = -1000; };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    const tick = (now: number) => {
      const dt = Math.min(2, (now - previous) / 16.67);
      previous = now;
      windX *= Math.pow(0.93, dt);
      windY *= Math.pow(0.92, dt);
      petals.forEach((petal, i) => {
        const dx = petal.x - pointerX;
        const dy = petal.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const nearby = Math.max(0, 1 - distance / 220);
        const gust = nearby * nearby;
        const swirl = Math.sin(now * 0.0011 + i * 2.1);
        petal.vx = (petal.vx + (windX * gust + dx / (distance || 1) * gust * 2.8 + swirl * 0.075) * dt) * Math.pow(0.955, dt);
        petal.vy = (petal.vy + (windY * gust + dy / (distance || 1) * gust * 1.3 + 0.013) * dt) * Math.pow(0.96, dt);
        petal.x += (petal.vx + 0.23 + Math.sin(now * 0.0006 + i) * 0.18) * dt * petal.depth;
        petal.y += (petal.vy + 0.52 + petal.depth * 0.35) * dt;
        petal.angle += (petal.spin * (0.35 + Math.abs(petal.vx) * 0.15) + gust * windX * 0.3) * dt;
        if (petal.y > height + 35) { petal.y = -35; petal.x = (i * 0.61803398875 + now * 0.00001) % 1 * width; petal.vx = petal.vy = 0; }
        if (petal.x > width + 35) petal.x = -35;
        if (petal.x < -35) petal.x = width + 35;
        nodes[i].style.transform = `translate3d(${petal.x}px,${petal.y}px,0) rotate(${petal.angle}deg) rotateY(${Math.sin(now * 0.002 + i) * 68}deg)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <div ref={layer} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="absolute left-0 top-0 block rounded-br-[85%] rounded-tl-[85%] bg-gradient-to-br from-[#D9A3AA]/65 to-[#C07A84]/30 shadow-[0_0_8px_rgba(192,122,132,0.14)] will-change-transform dark:from-[#D9A3AA]/75 dark:to-[#C07A84]/35" style={{ width: 9 + i % 5 * 3, height: (9 + i % 5 * 3) * 1.3, opacity: 0.48 + i % 4 * 0.11 }} />
      ))}
    </div>
  );
}
