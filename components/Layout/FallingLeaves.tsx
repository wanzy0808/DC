"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeProvider";

const COUNT = 14;

type LeafState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  size: number;
  depth: number;
};

const LIGHT_LEAVES = ["#8B6F52", "#A4815F", "#6F654A", "#B09369"];
const DARK_LEAVES = ["#D6B38C", "#BE936D", "#E1C39B", "#9E765B"];

/**
 * Shared Undara ambient leaves.
 * Kept sparse and behind content so long-form pages stay readable.
 */
export default function FallingLeaves({ className = "" }: { className?: string }) {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { isDarkMode } = useTheme();
  const palette = isDarkMode ? DARK_LEAVES : LIGHT_LEAVES;

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

    const leaves: LeafState[] = nodes.map((_, index) => ({
      x: ((index * 0.61803398875) % 1) * width,
      y: ((index * 0.38196601125) % 1) * height,
      vx: 0,
      vy: 0,
      spin: index % 2 ? 1 : -1,
      angle: index * 39,
      size: 10 + (index % 5) * 2.5,
      depth: 0.62 + (index % 4) * 0.13,
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };

    const move = (event: PointerEvent) => {
      const dx = lastPointerX < 0 ? 0 : event.clientX - lastPointerX;
      const dy = lastPointerY < 0 ? 0 : event.clientY - lastPointerY;
      windX = Math.max(-15, Math.min(15, windX + dx * 0.24));
      windY = Math.max(-9, Math.min(9, windY + dy * 0.13));
      pointerX = lastPointerX = event.clientX;
      pointerY = lastPointerY = event.clientY;
    };

    const leave = () => {
      pointerX = -1000;
      pointerY = -1000;
      lastPointerX = -1000;
      lastPointerY = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);

    const tick = (now: number) => {
      const dt = Math.min(2, (now - previous) / 16.67);
      previous = now;
      windX *= Math.pow(0.94, dt);
      windY *= Math.pow(0.93, dt);

      leaves.forEach((leaf, index) => {
        const dx = leaf.x - pointerX;
        const dy = leaf.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const nearby = Math.max(0, 1 - distance / 210);
        const gust = nearby * nearby;
        const drift = Math.sin(now * 0.00075 + index * 1.7);

        leaf.vx =
          (leaf.vx + (windX * gust + (dx / (distance || 1)) * gust * 2.1 + drift * 0.055) * dt) *
          Math.pow(0.96, dt);
        leaf.vy =
          (leaf.vy + (windY * gust + (dy / (distance || 1)) * gust * 0.9 + 0.01) * dt) *
          Math.pow(0.965, dt);
        leaf.x += (leaf.vx + 0.12 + Math.sin(now * 0.00045 + index) * 0.14) * dt * leaf.depth;
        leaf.y += (leaf.vy + 0.34 + leaf.depth * 0.22) * dt;
        leaf.angle += (leaf.spin * (0.22 + Math.abs(leaf.vx) * 0.1) + gust * windX * 0.2) * dt;

        if (leaf.y > height + 40) {
          leaf.y = -40;
          leaf.x = (((index * 0.61803398875) + now * 0.000006) % 1) * width;
          leaf.vx = 0;
          leaf.vy = 0;
        }
        if (leaf.x > width + 40) leaf.x = -40;
        if (leaf.x < -40) leaf.x = width + 40;

        nodes[index].style.transform =
          `translate3d(${leaf.x}px,${leaf.y}px,0) rotate(${leaf.angle}deg) rotateY(${Math.sin(now * 0.0015 + index) * 58}deg)`;
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
    <div
      ref={layer}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[4] overflow-hidden ${className}`}
    >
      {Array.from({ length: COUNT }, (_, index) => {
        const size = 10 + (index % 5) * 2.5;
        const color = palette[index % palette.length];

        return (
          <span
            key={index}
            className="absolute left-0 top-0 block will-change-transform"
            style={{
              width: size,
              height: size * 1.7,
              opacity: (isDarkMode ? 0.28 : 0.22) + (index % 4) * 0.055,
            }}
          >
            <span
              className="relative block h-full w-full rounded-[88%_18%_82%_22%] shadow-[0_3px_8px_rgba(72,49,35,0.10)]"
              style={{
                background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 64%, transparent))`,
              }}
            >
              <span className="absolute left-1/2 top-[12%] h-[76%] w-px -translate-x-1/2 rotate-[18deg] bg-white/24 dark:bg-[#703B3B]/22" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
