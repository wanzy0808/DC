"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type Props = {
  children: ReactNode;
  className: string;
  scrollRoot: RefObject<HTMLElement | null>;
  ready: boolean;
  locale: string;
};

/**
 * Text-only repeatable entrance motion inside the framed marketing scroller.
 * An item resets after it leaves the *scroll panel*, then replays on re-entry.
 * No split words/letters or DOM copies: the original text and interactions stay intact.
 */
export default function MarketingTextReveal({ children, className, scrollRoot, ready, locale }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = scrollRoot.current;
    const content = contentRef.current;
    if (!ready || !panel || !content || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("dc-invitation-text-inview", entry.isIntersecting);
        }
      },
      { root: panel, rootMargin: "0px 0px -4% 0px", threshold: 0.04 },
    );

    const selector = "h1, h2, h3, p, li, [data-dc-text-reveal]";
    function register(node: Element) {
      if (
        node.closest("button, a, [inert], .invitation-phone-scroll, [aria-hidden='true']") ||
        node.classList.contains("dc-invitation-text-ready")
      ) return;
      node.classList.add("dc-invitation-text-ready");
      intersection.observe(node);
    }

    function scan(element: Element) {
      if (element.matches(selector)) register(element);
      element.querySelectorAll(selector).forEach(register);
    }

    scan(content);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) scan(node);
        }
      }
    });
    mutations.observe(content, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      intersection.disconnect();
      content.querySelectorAll(".dc-invitation-text-ready").forEach((element) => {
        element.classList.remove("dc-invitation-text-ready", "dc-invitation-text-inview");
      });
    };
  }, [ready, scrollRoot, locale]);

  return (
    <>
      <div ref={contentRef} className={className}>{children}</div>
      <style jsx global>{`
        .dc-invitation-text-ready {
          opacity: 0;
          transform: translate3d(0, 14px, 0);
        }
        .dc-invitation-text-ready.dc-invitation-text-inview {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .dc-invitation-text-ready,
          .dc-invitation-text-ready.dc-invitation-text-inview {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
