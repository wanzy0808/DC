"use client";

import { BlossomBranch, EnsoSun, InkMountains } from "@/assets/templates/zen-atelier/ZenArtwork";

type ZenAtelierSceneProps = {
  names: string;
  date: string;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
};

/** Deliberately photo-free folded letter and cover, loaded only for zen-atelier. */
export default function ZenAtelierScene({ names, date, stage, onOpen, preview = false }: ZenAtelierSceneProps) {
  const envelope = stage === "envelope";
  return (
    <section
      data-invitation-section={stage}
      className="relative isolate flex min-h-[760px] flex-col items-center justify-center overflow-hidden px-6 py-14 text-center sm:px-10"
      style={{
        background: "var(--inv-scene-bg, #F4F0E6)",
        color: "var(--inv-scene-ink, #373C34)",
        backgroundImage: "radial-gradient(circle at 90% 15%,rgba(132,116,92,.09),transparent 38%),radial-gradient(circle at 10% 85%,rgba(132,116,92,.08),transparent 42%)",
      }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-[14px] border border-current/15" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[21px] border border-current/10" />
      <BlossomBranch className="pointer-events-none absolute -right-12 -top-12 w-[min(80%,330px)] opacity-90" />
      <BlossomBranch className="pointer-events-none absolute -bottom-14 -left-24 w-56 rotate-180 opacity-45" />
      <p className="relative mt-4 text-[10px] uppercase tracking-[.37em] opacity-70">
        {envelope ? "A letter, just for you" : "Zen Atelier"}
      </p>

      {envelope ? (
        <div className="relative mx-auto mt-14 w-full max-w-[320px]">
          <div className="absolute -inset-3 border border-current/20" aria-hidden="true" />
          <div className="relative flex min-h-[310px] flex-col items-center justify-end overflow-hidden border border-[#B7AC96] bg-[var(--inv-scene-surface,#FBF8F0)] px-6 pb-9 pt-28 text-[var(--inv-scene-surface-ink,#373C34)] shadow-[0_24px_58px_rgba(59,49,36,.14)]">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[154px] origin-top bg-[#DDD5C3] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <span aria-hidden="true" className="absolute left-1/2 top-[95px] grid size-14 -translate-x-1/2 place-items-center rounded-full border-4 border-[#FBF8F0] bg-[#A9513B] text-[#FBF8F0] shadow-sm">
              <span className="text-lg leading-none">和</span>
            </span>
            <p className="relative text-[10px] uppercase tracking-[.28em] opacity-65">Undangan untuk</p>
            <h1 className="relative mt-4 break-words text-[27px] leading-tight" style={{ fontFamily: "var(--inv-heading, Georgia), Georgia, serif" }}>{names}</h1>
            <span aria-hidden="true" className="relative my-5 h-px w-16 bg-[#A9513B]/60" />
            <p className="relative text-xs tracking-[.09em]">{date}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mt-8 flex h-[270px] w-[min(86vw,390px)] items-center justify-center">
            <EnsoSun className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2" />
            <InkMountains className="absolute bottom-0 left-1/2 w-[110%] max-w-none -translate-x-1/2" />
          </div>
          <span className="relative mt-6 text-[10px] uppercase tracking-[.36em] opacity-60">Dengan penuh syukur</span>
          <h1 className="relative mt-5 max-w-sm break-words text-[clamp(2.2rem,8vw,3.5rem)] leading-[1.14]" style={{ fontFamily: "var(--inv-heading, Georgia), Georgia, serif" }}>
            {names}
          </h1>
          <p className="relative mt-6 text-xs tracking-[.19em]">{date}</p>
          <span aria-hidden="true" className="relative mt-8 h-10 w-px bg-[#A9513B]/60" />
        </>
      )}

      {envelope && (
        <button
          type="button"
          onClick={onOpen}
          className="relative z-10 mt-12 min-h-12 border border-[#A9513B] bg-[#A9513B] px-9 py-3 text-[11px] font-semibold tracking-[.2em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#8D4231] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A9513B]"
        >
          Buka Undangan
        </button>
      )}
      {envelope && preview && <p className="relative mt-5 text-[11px] opacity-55">Pratinjau</p>}
    </section>
  );
}
