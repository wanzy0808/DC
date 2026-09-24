"use client";

import { displayTitleCase } from "@/lib/text/display-title-case";

type ZenAtelierSceneProps = {
  names: string;
  date: string;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
  isWedding?: boolean;
  hashtag?: string | null;
};

const root = "/templates/";
const paper = "radial-gradient(ellipse at 45% 20%, var(--inv-scene-surface, #fffaf0) 0%, var(--inv-scene-bg, #f3eddf) 72%, var(--inv-scene-soft, #e7dfd0) 160%)";

/** A paper-and-ink composition based on the Zen Atelier sample mobile screens.
 * These are decorative public assets, not customer portraits or private masters. */
export default function ZenAtelierScene({
  names,
  date,
  stage,
  onOpen,
  preview = false,
  isWedding = true,
  hashtag,
}: ZenAtelierSceneProps) {
  const envelope = stage === "envelope";
  const title = displayTitleCase(names);
  const couple = isWedding ? title.split(/\s*&\s*/).filter(Boolean) : [];
  const twoNames = couple.length === 2;

  return (
    <section
      data-invitation-section={stage}
      aria-label={envelope ? "Amplop undangan Zen Atelier" : "Sampul undangan Zen Atelier"}
      className="relative isolate flex min-h-[760px] flex-col items-center overflow-hidden px-6 pb-16 pt-12 text-center sm:px-12"
      style={{ background: "var(--inv-scene-bg, #f3eddf)", color: "var(--inv-scene-ink, #343b34)", backgroundImage: paper }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.035]" style={{backgroundImage:"repeating-linear-gradient(0deg, #3b3026 0px, transparent 1px, transparent 4px)"}} />

      {envelope ? (
        <>
          <p className="relative z-10 mt-16 max-w-[250px] text-[13px] leading-7 tracking-[.035em]">
            Sebuah undangan<br />untuk orang istimewa
          </p>
          <span aria-hidden="true" className="relative z-10 mt-5 h-px w-8 bg-[var(--inv-scene-ink,#343b34)] opacity-60" />
          <div className="relative z-10 mt-11 flex w-full max-w-[440px] justify-center">
            <img
              src={root + "amplop1.png"}
              alt="Amplop kertas Zen Atelier dengan segel berwarna terakota"
              fetchPriority="high"
              className="aspect-[4/5] w-full max-w-[380px] object-contain drop-shadow-[0_18px_21px_rgba(40,35,26,.14)]"
            />
          </div>
          <button type="button" onClick={onOpen} className="relative z-20 mt-6 flex min-h-14 flex-col items-center gap-3 px-6 text-[12px] tracking-[.06em] transition duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--inv-scene-accent,#a9513b)]">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--inv-scene-ink,#343b34)]/65 text-base">✉</span>
            Ketuk untuk membuka
          </button>
          {preview && <p className="relative z-10 mt-4 text-[11px] opacity-55">Pratinjau undangan</p>}
        </>
      ) : (
        <>
          <img src={root + "bunga0001.png"} alt="" aria-hidden="true" loading="eager" className="pointer-events-none absolute -left-12 -top-4 z-[1] w-[65%] max-w-[355px] object-contain opacity-95 sm:-left-8" />
          <img src={root + "bunga0002.png"} alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute -right-20 bottom-14 z-[1] w-[62%] max-w-[280px] rotate-180 object-contain opacity-85" />
          <img src={root + "redsun1.png"} alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute bottom-[100px] left-[16%] z-[1] w-28 object-contain opacity-85" />
          <img src={root + "inkmountain.png"} alt="" aria-hidden="true" loading="eager" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[215px] w-full object-cover object-bottom opacity-80 sm:h-[255px]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-20 bg-gradient-to-t from-[#c8cabf]/15 to-transparent" />
          <p className="relative z-10 mt-[190px] text-[10px] uppercase tracking-[.30em] opacity-80 sm:mt-[200px]">
            {isWedding ? "The Wedding Of" : "Sebuah Undangan"}
          </p>
          <h1 className="relative z-10 mt-7 max-w-[360px] break-words text-[clamp(2.8rem,11vw,4.1rem)] leading-[1.07] tracking-[-.045em]" style={{ fontFamily: "var(--inv-heading, Georgia), Georgia, serif" }}>
            {twoNames ? <>{couple[0]}<span className="my-2 block text-[.55em] leading-none">&amp;</span>{couple[1]}</> : title}
          </h1>
          <p className="relative z-10 mt-8 text-xs tracking-[.2em]">{date}</p>
          {hashtag?.trim() && <p className="relative z-10 mt-6 max-w-[280px] break-words text-[10px] tracking-[.09em] opacity-75">{hashtag}</p>}
          
          <button
            type="button"
            onClick={(event) => {
              const next = event.currentTarget.closest('[data-invitation-section="cover"]')?.nextElementSibling;
              next?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
            }}
            className="relative z-20 mt-auto flex min-h-14 flex-col items-center gap-2 pb-6 pt-12 text-[11px] tracking-[.09em] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--inv-scene-accent,#a9513b)]"
          >
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--inv-scene-accent,#a9513b)] text-xl text-white shadow-md">↓</span>
            Lihat Undangan
          </button>
        </>
      )}
    </section>
  );
}
