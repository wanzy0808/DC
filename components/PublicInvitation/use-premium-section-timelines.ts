"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import {
  getPremiumSectionTimelinePreset,
  premiumTimelineSectionKeys,
  type InvitationPremiumTimeline,
} from "@/lib/templates/premium-timelines";
import { MAX_PREMIUM_TIMELINE_ITEMS } from "@/lib/templates/motion-performance";

type TimelineTarget = {
  section: HTMLElement;
  key: InvitationSectionKey;
  timeline: InvitationPremiumTimeline;
};

function storyItems(section: HTMLElement) {
  const nodes = Array.from(section.querySelectorAll<HTMLElement>(
    'h1,h2,h3,[data-studio-copy-field],[data-invitation-photo-slot],p',
  ));
  return nodes
    .filter((node) =>
      node.closest<HTMLElement>("[data-invitation-section]") === section &&
      !node.closest("form") &&
      !node.closest('[data-studio-rsvp-element="inputs"]'),
    )
    .slice(0, MAX_PREMIUM_TIMELINE_ITEMS);
}

function rootFrom(timeline: InvitationPremiumTimeline) {
  switch (timeline) {
    case "romantic-cascade":
      return { opacity: 0, y: 22, filter: "blur(5px)" };
    case "editorial-sequence":
      return { opacity: 0, x: -18, clipPath: "inset(0 8% 0 0)" };
    case "luxe-cinematic":
      return { opacity: 0, scale: 1.025, filter: "blur(8px)" };
    case "paper-story":
      return { opacity: 0, y: 18, rotation: -0.6 };
  }
}

function itemFrom(timeline: InvitationPremiumTimeline) {
  switch (timeline) {
    case "romantic-cascade":
      return { opacity: 0, y: 28, scale: 0.985, filter: "blur(4px)" };
    case "editorial-sequence":
      return { opacity: 0, x: -26 };
    case "luxe-cinematic":
      return { opacity: 0, y: 32, scale: 0.97, filter: "blur(7px)" };
    case "paper-story":
      return { opacity: 0, y: 22, rotation: -1.2 };
  }
}

export function usePremiumSectionTimelines(
  rootRef: RefObject<HTMLElement | null>,
  styles: InvitationSectionStyles,
  revision = "",
) {
  const timelineKey = JSON.stringify(
    Object.fromEntries(
      Object.entries(styles)
        .filter(([, style]) => style?.timeline)
        .map(([key, style]) => [key, style?.timeline]),
    ),
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const configured = JSON.parse(timelineKey) as Partial<Record<InvitationSectionKey, InvitationPremiumTimeline>>;
    const targets: TimelineTarget[] = [];

    for (const [rawKey, timeline] of Object.entries(configured)) {
      const key = rawKey as InvitationSectionKey;
      if (!timeline || !premiumTimelineSectionKeys.has(key)) continue;
      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(`[data-invitation-section="${key}"]`),
      );
      const section = candidates.find((node) => {
        const parent = node.parentElement?.closest<HTMLElement>(
          `[data-invitation-section="${key}"]`,
        );
        return !parent;
      }) ?? candidates[0];
      if (section) targets.push({ section, key, timeline });
    }

    if (!targets.length) return;

    let alive = true;
    let dispose = () => {};

    void (async () => {
      const { gsap } = await import("gsap");
      if (!alive) return;

      const animations = new Map<HTMLElement, ReturnType<typeof gsap.timeline>>();
      const allAnimated = new Set<HTMLElement>();

      const prepare = ({ section, timeline }: TimelineTarget) => {
        const preset = getPremiumSectionTimelinePreset(timeline);
        if (!preset) return null;
        const items = storyItems(section);
        allAnimated.add(section);
        items.forEach((item) => allAnimated.add(item));

        const sequence = gsap.timeline({ paused: true });
        sequence.from(section, {
          ...rootFrom(timeline),
          duration: Math.max(0.4, preset.duration * 0.7),
          ease: preset.ease,
          clearProps: "opacity,transform,filter,clipPath",
        });
        if (items.length) {
          sequence.from(items, {
            ...itemFrom(timeline),
            duration: preset.duration,
            stagger: preset.stagger,
            ease: preset.ease,
            clearProps: "opacity,transform,filter,clipPath",
          }, "-=0.25");
        }
        animations.set(section, sequence);
        return sequence;
      };

      targets.forEach(prepare);

      const play = (section: HTMLElement) => {
        const sequence = animations.get(section);
        if (sequence && sequence.paused()) sequence.play(0);
      };

      let observer: IntersectionObserver | null = null;
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
              const section = entry.target as HTMLElement;
              play(section);
              observer?.unobserve(section);
            }
          }
        }, { threshold: [0.14] });
        targets.forEach(({ section }) => observer?.observe(section));
      } else {
        targets.forEach(({ section }) => play(section));
      }

      dispose = () => {
        observer?.disconnect();
        animations.forEach((sequence) => sequence.kill());
        if (allAnimated.size) {
          gsap.set(Array.from(allAnimated), {
            clearProps: "opacity,transform,filter,clipPath",
          });
        }
      };
    })();

    return () => {
      alive = false;
      dispose();
    };
  }, [rootRef, timelineKey, revision]);
}
