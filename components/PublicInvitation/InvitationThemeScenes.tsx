"use client";

import type { ReactNode } from "react";
import PencilReverieScene from "@/components/PublicInvitation/PencilReverieScene";
import dynamic from "next/dynamic";
import { ArrowUpRight, Flower2, Gem, Heart, Leaf, Moon, Sparkles, Sun, Star } from "lucide-react";

/** Visual-only compositions. Data, action, and section rendering stay in shared invitation engine. */
type SceneProps = {
  theme: string;
  names: string;
  date: string;
  cover?: string;
  focus: "top" | "center" | "bottom";
  stage: "envelope" | "cover";
  onOpen: () => void;
  onEditPhoto?: () => void;
  preview?: boolean;
  isWedding?: boolean;
  hashtag?: string | null;
};
const heading = { color: "inherit", fontFamily: "var(--inv-heading, var(--font-dc-heading)), Georgia, serif" };
const caption = "text-[10px] uppercase tracking-[.3em]";
const center = "relative flex min-h-[760px] flex-col items-center justify-center overflow-hidden px-6 py-12 text-center";
const photoClass = "h-full w-full object-cover";
function Portrait({ src, alt, focus, className = "" }: { src?: string; alt: string; focus: SceneProps["focus"]; className?: string }) {
  return src
    ? <img src={src} alt={alt} loading="lazy" className={`${photoClass} ${className}`} style={{ objectPosition: `center ${focus}` }} />
    : <div className={`flex h-full w-full items-center justify-center bg-black/10 ${className}`} role="img" aria-label="Foto belum ditambahkan"><Heart className="h-8 w-8 opacity-40" strokeWidth={1} /></div>;
}
function Open({ onClick, dark = false, children }: { onClick: () => void; dark?: boolean; children?: ReactNode }) {
  return <button type="button" onClick={onClick} className={`relative z-20 mt-7 min-h-12 rounded-full border px-8 py-3 text-xs font-semibold tracking-[.15em] shadow-md transition duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? "border-white/55 bg-white text-[color:var(--inv-scene-text,#271f25)] hover:bg-[var(--inv-scene-soft,#f1dfd4)]" : "border-current/30 bg-[var(--inv-accent)] text-white hover:brightness-110"}`}>{children || "Buka Undangan"}</button>;
}
function Edit({ onClick }: { onClick?: () => void }) {
  return onClick ? <button type="button" onClick={onClick} aria-label="Atur foto cover" className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-3 text-xs font-medium text-transparent transition hover:bg-black/30 hover:text-white focus-visible:bg-black/30 focus-visible:text-white">Atur foto</button> : null;
}
function Names({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`relative break-words leading-[1.28] ${className}`} style={heading}>{children}</h1>;
}
function Lines({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div aria-hidden className={`flex items-center justify-center gap-3 ${className}`}><span className="h-px w-12 bg-current opacity-40" />{children || <span className="text-lg">✧</span>}<span className="h-px w-12 bg-current opacity-40" /></div>;
}
function BotanicalSprig({ mirrored = false }: { mirrored?: boolean }) {
  return <div aria-hidden className={`absolute top-0 h-[290px] w-28 text-[color:var(--inv-scene-text,#71826a)] ${mirrored ? "-right-5 -scale-x-100 rotate-[-10deg]" : "-left-5 rotate-[-10deg]"}`}>
    <span className="absolute left-1/2 top-0 h-full w-px rotate-[16deg] bg-current opacity-50" />
    {[0,1,2,3,4].map(n=><Leaf key={n} className={`absolute h-16 w-16 opacity-55 ${n%2 ? "left-9 rotate-[65deg]" : "left-0 -rotate-[30deg]"}`} style={{top:`${n*52}px`}} strokeWidth={0.75}/>)}
  </div>;
}
type EnvelopeVisual = {
  backdrop: string;
  surface: string;
  flap: string;
  border: string;
  ink: string;
  symbol: string;
  effect: string;
  photoPosition?: string;
};
const envelopeVisuals: Record<string, EnvelopeVisual> = {
  "eternal-blossom": { backdrop: "#fbe5ed", surface: "#fff6f8", flap: "#df9eb8", border: "#bd6e8e", ink: "#67334b", symbol: "❀", effect: "rounded-[30px]", photoPosition: "rotate-[-5deg]" },
  "modern-maroon": { backdrop: "#380b19", surface: "#721d30", flap: "#a54c56", border: "#d9a29a", ink: "#ffe5df", symbol: "M.", effect: "rounded-none", photoPosition: "rotate-[5deg]" },
  "garden-light": { backdrop: "#e8f0d9", surface: "#fcfdf0", flap: "#adbf98", border: "#6a8458", ink: "#405a3e", symbol: "❧", effect: "rounded-t-[95px] rounded-b-[14px]", photoPosition: "rotate-[-3deg]" },
  "midnight-romance": { backdrop: "#080e22", surface: "#18213c", flap: "#263452", border: "#cdb986", ink: "#f5e8c9", symbol: "✦", effect: "rounded-t-[130px] rounded-b-[22px]", photoPosition: "rotate-[4deg]" },
  "botanical-ivory": { backdrop: "#f0efde", surface: "#fffdf2", flap: "#cbd6ba", border: "#849878", ink: "#50634d", symbol: "❧", effect: "rounded-[9px]" },
  "classic-pearl": { backdrop: "#efebe1", surface: "#fffdf6", flap: "#dcd0b8", border: "#b3a181", ink: "#534a3d", symbol: "◇", effect: "rounded-t-[140px] rounded-b-[14px]" },
  "golden-art-deco": { backdrop: "#171912", surface: "#23271d", flap: "#a48b49", border: "#dfc482", ink: "#f1d99f", symbol: "◆", effect: "rounded-none" },
  "paper-cut-botanical": { backdrop: "#e7ead4", surface: "#f9faea", flap: "#aec39e", border: "#829b72", ink: "#465b42", symbol: "❦", effect: "rounded-[40px] -rotate-[3deg]" },
  "celestial-ink": { backdrop: "#0d1830", surface: "#1d304a", flap: "#365071", border: "#9bbfdf", ink: "#d5e5f0", symbol: "☾", effect: "rounded-t-[130px] rounded-b-[10px]" },
};
function ThemeEnvelope({theme,names,date,cover,focus,onOpen,preview}: SceneProps) {
  const original = envelopeVisuals[theme] || envelopeVisuals["botanical-ivory"];
  const style = { ...original,
    backdrop: `var(--inv-scene-bg, ${original.backdrop})`,
    surface: `var(--inv-scene-surface, ${original.surface})`,
    flap: `var(--inv-scene-soft, ${original.flap})`,
    border: `var(--inv-scene-accent, ${original.border})`,
    ink: `var(--inv-scene-ink, ${original.ink})`,
  };
  const usesPhoto = ["eternal-blossom","modern-maroon","garden-light","midnight-romance"].includes(theme);
  return (
    <section data-invitation-section="envelope" className={`${center} relative`} style={{backgroundColor:style.backdrop,color:style.ink}}>
      <div aria-hidden className="pointer-events-none absolute inset-5 border opacity-30" style={{borderColor:style.border}}/>
      {theme === "garden-light" || theme === "botanical-ivory" || theme === "paper-cut-botanical" ? <>
        <BotanicalSprig/><BotanicalSprig mirrored/>
      </> : theme === "celestial-ink" || theme === "midnight-romance" ? <>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-55" style={{backgroundImage:"radial-gradient(circle,currentColor 1px,transparent 2px)",backgroundSize:"39px 56px"}}/>
        <Moon aria-hidden className="absolute right-9 top-10 h-11 w-11 opacity-50"/>
      </> : theme === "golden-art-deco" ? <div aria-hidden className="pointer-events-none absolute top-[-120px] h-64 w-64 rotate-45 border opacity-50" style={{borderColor:style.border}}/> : theme === "eternal-blossom" ? <Flower2 aria-hidden className="absolute -left-12 top-5 h-44 w-44 -rotate-12 opacity-20" strokeWidth={0.7}/> : null}
      <p className={`${caption} relative mb-9 opacity-80`}>{theme === "modern-maroon" ? "Private / 01" : "A personal invitation"}</p>
      <div className="relative w-[min(74vw,310px)] pt-11">
        {usesPhoto && <div className={`absolute left-1/2 top-[-26px] h-52 w-[67%] -translate-x-1/2 overflow-hidden border-[6px] shadow-lg ${style.photoPosition || ""}`} style={{borderColor:style.border,backgroundColor:style.surface}}>
          <Portrait src={cover} focus={focus} alt="Foto utama pada kartu undangan" />
        </div>}
        <div className={`relative mt-12 flex min-h-[275px] flex-col items-center justify-end overflow-hidden border px-6 pb-10 pt-20 shadow-[0_22px_44px_#0002] ${style.effect}`} style={{backgroundColor:style.surface,borderColor:style.border,color:`var(--inv-scene-surface-ink, ${original.ink})`}}>
          <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-44 origin-top opacity-95 [clip-path:polygon(0_0,100%_0,50%_100%)]" style={{backgroundColor:style.flap}}/>
          <div aria-hidden className="absolute left-1/2 top-[105px] z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 text-3xl shadow-md" style={{borderColor:style.surface,backgroundColor:style.border,color:style.surface}}>{style.symbol}</div>
          <div className="relative z-20 mt-8 w-full border-t pt-6 text-center" style={{borderColor:style.border}}>
            <p className="text-[9px] uppercase tracking-[.25em] opacity-70">Untuk momen istimewa</p>
            <Names className="mt-3 text-xl">{names}</Names>
            <p className="mt-3 text-xs opacity-75">{date}</p>
          </div>
        </div>
      </div>
      <Open onClick={onOpen} dark={theme === "modern-maroon" || theme === "midnight-romance" || theme === "golden-art-deco" || theme === "celestial-ink"}>Buka Undangan</Open>
      {preview && <p className="relative mt-4 text-[11px] opacity-60">Pratinjau</p>}
    </section>
  );
}
const ZenAtelierScene = dynamic(() => import("@/components/PublicInvitation/ZenAtelierScene"));

export default function InvitationThemeScenes({theme,names,date,cover,focus,stage,onOpen,onEditPhoto,preview,isWedding,hashtag}: SceneProps) {
  if (theme === "zen-atelier") return <ZenAtelierScene names={names} date={date} stage={stage} onOpen={onOpen} preview={preview} isWedding={isWedding} hashtag={hashtag} />;
  if (stage === "envelope") return <ThemeEnvelope theme={theme} names={names} date={date} cover={cover} focus={focus} stage={stage} onOpen={onOpen} preview={preview} />;
  const isEnvelope = false;
  const content = isEnvelope ? "You're Invited" : "The Celebration";
  if (theme === "eternal-blossom") return <section className={`${center} bg-[var(--inv-scene-bg,#ffedf0)] text-[color:var(--inv-scene-ink,#622a43)]`} data-invitation-section={stage}>
    <div aria-hidden className="absolute inset-x-0 top-0 h-[240px] bg-[radial-gradient(circle_at_50%_0%,#f4b9c9,transparent_70%)]" />
    <Flower2 aria-hidden className="absolute -left-12 top-14 h-48 w-48 -rotate-[32deg] text-[color:var(--inv-scene-text,#cd7390)]/50" strokeWidth={0.6} />
    <Flower2 aria-hidden className="absolute -right-12 bottom-24 h-52 w-52 rotate-[20deg] text-[color:var(--inv-scene-text,#c45c7e)]/40" strokeWidth={0.6} />
    <p className={`${caption} relative mb-6 text-[color:var(--inv-scene-text,#a45c75)]`}>{isEnvelope ? "A love letter" : "Eternal Blossom"}</p>
    <div className="relative w-[min(70vw,290px)] rotate-[-4deg] rounded-t-full rounded-b-[100px] border-8 border-white bg-white p-2 shadow-[20px_20px_0_#dd9caf]">
      <div className="relative h-[320px] overflow-hidden rounded-t-full rounded-b-[95px]"><Portrait src={cover} focus={focus} alt="Foto utama undangan" /><Edit onClick={!isEnvelope?onEditPhoto:undefined}/></div>
      {isEnvelope && <span aria-hidden className="absolute -bottom-7 -right-7 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[var(--inv-scene-soft,#a8486c)] text-white shadow-xl"><Heart className="h-8 w-8" fill="currentColor" /></span>}
    </div>
    <Names className="z-10 mt-9 text-3xl">{names}</Names>
    <p className="relative mt-3 text-xs tracking-[.25em]">{date}</p>
    {isEnvelope ? <Open onClick={onOpen}>Buka Surat Cinta</Open> : <Lines className="mt-8"><Flower2 className="h-5 w-5"/></Lines>}
    {isEnvelope && preview && <p className="mt-5 text-xs opacity-60">Pratinjau</p>}
  </section>;

  if (theme === "modern-maroon") return <section className={`${center} bg-[var(--inv-scene-bg,#4b0f1e)] text-[color:var(--inv-scene-ink,#ffe4dd)]`} data-invitation-section={stage}>
    <div aria-hidden className="absolute left-0 top-0 h-full w-[20%] bg-[var(--inv-scene-soft,#d77e6d)]" />
    <div aria-hidden className="absolute right-0 top-0 h-full w-[12%] bg-[var(--inv-scene-soft,#7d2030)]" />
    <span aria-hidden className="absolute left-[13%] top-6 text-[110px] font-black leading-none text-[color:var(--inv-scene-text,#f9b6a3)]/20">M.</span>
    <p className={`${caption} relative mb-7 self-start text-[color:var(--inv-scene-text,#f8af99)]`}>{isEnvelope ? "Private invitation / 01" : content}</p>
    <div className="relative flex w-full max-w-[370px] items-start justify-center gap-3">
      <div className="relative h-[340px] w-[66%] -skew-y-[3deg] overflow-hidden border-4 border-[var(--inv-scene-accent,#e7a79a)] shadow-[14px_14px_0_#7d2030]"><Portrait src={cover} focus={focus} alt="Foto utama undangan" /><Edit onClick={!isEnvelope?onEditPhoto:undefined}/></div>
      <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[.4em]">DC Organizer — Selected events</p>
    </div>
    <div className="relative mt-8 w-full max-w-[370px] border-t border-[var(--inv-scene-accent,#e7a79a)]/55 pt-6 text-left">
      <Names className="text-3xl">{names}</Names><p className="mt-3 text-xs tracking-[.2em]">{date}</p>
    </div>
    {isEnvelope ? <Open dark onClick={onOpen}>OPEN INVITATION ↗</Open> : <Lines className="mt-9" />}
  </section>;

  if (theme === "garden-light") return <section className={`${center} bg-[var(--inv-scene-bg,#ecf0de)] text-[color:var(--inv-scene-ink,#465c3a)]`} data-invitation-section={stage}>
    <div aria-hidden className="absolute -left-24 top-20 h-72 w-72 rounded-full border-[18px] border-[var(--inv-scene-accent,#a6be92)]/40" />
    <div aria-hidden className="absolute -right-28 bottom-20 h-80 w-80 rounded-full border-[18px] border-[var(--inv-scene-accent,#acc89b)]/40" />
    <BotanicalSprig /><BotanicalSprig mirrored />
    <p className={`${caption} relative mt-6 text-[color:var(--inv-scene-text,#68855d)]`}>{isEnvelope ? "A garden invitation" : "In full bloom"}</p>
    <div className="relative mt-9 w-[min(73vw,290px)] rounded-t-[180px] rounded-b-[16px] border-[12px] border-[var(--inv-scene-accent,#f8faed)] bg-[var(--inv-scene-soft,#e1ebd9)] p-1 shadow-[0_20px_48px_#41593733]">
      <div className="relative h-[320px] overflow-hidden rounded-t-[165px] rounded-b-[8px]"><Portrait src={cover} focus={focus} alt="Foto utama undangan" /><Edit onClick={!isEnvelope?onEditPhoto:undefined}/></div>
      <span aria-hidden className="absolute -bottom-7 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-4 border-[var(--inv-scene-accent,#ecf0de)] bg-[var(--inv-scene-soft,#607c52)] text-white"><Leaf className="h-6 w-6" /></span>
    </div>
    <Names className="relative mt-14 text-3xl italic">{names}</Names>
    <p className="mt-3 text-xs tracking-[.2em]">{date}</p>
    {isEnvelope ? <Open onClick={onOpen}>Masuk ke Taman</Open> : <Lines className="mt-7"><Leaf className="h-5 w-5"/></Lines>}
  </section>;

  if (theme === "midnight-romance") return <section className={`${center} bg-[var(--inv-scene-bg,#080d20)] text-[color:var(--inv-scene-ink,#f4e7d0)]`} data-invitation-section={stage}>
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{backgroundImage:"radial-gradient(circle at 20% 20%,#e1d5ab 1px,transparent 2px),radial-gradient(circle at 80% 60%,#e1d5ab 1px,transparent 2px)",backgroundSize:"43px 61px,79px 97px"}} />
    <Moon aria-hidden className="absolute right-7 top-14 h-20 w-20 text-[color:var(--inv-scene-text,#e5d09e)]/45" strokeWidth={0.6} />
    <p className={`${caption} relative mb-7 text-[color:var(--inv-scene-text,#e6cda0)]`}>{isEnvelope ? "Under the stars" : "Midnight Romance"}</p>
    <div className="relative h-[310px] w-[min(75vw,310px)] rounded-full border border-[var(--inv-scene-accent,#e1ca8f)] p-2 shadow-[0_0_0_7px_#e1ca8f20,0_0_0_20px_#e1ca8f0a]">
      <div className="relative h-full w-full overflow-hidden rounded-full"><Portrait src={cover} focus={focus} alt="Foto utama undangan" /><Edit onClick={!isEnvelope?onEditPhoto:undefined}/></div>
      <Star aria-hidden className="absolute -right-5 top-8 h-9 w-9 text-[color:var(--inv-scene-text,#e6cda0)]" strokeWidth={0.7} />
    </div>
    <Names className="relative mt-10 text-3xl">{names}</Names>
    <p className="mt-3 text-xs uppercase tracking-[.3em] text-[color:var(--inv-scene-text,#e5d5ac)]">{date}</p>
    {isEnvelope ? <Open dark onClick={onOpen}>Buka Undangan ✧</Open> : <Lines className="mt-8"><Star className="h-4 w-4"/></Lines>}
  </section>;

  if (theme === "pencil-reverie") return <PencilReverieScene stage={stage} names={names} date={date} onOpen={onOpen} isWedding={isWedding} hashtag={hashtag} />;

  if (theme === "botanical-ivory") return <section className={`${center} bg-[var(--inv-scene-bg,#faf7e9)] text-[color:var(--inv-scene-ink,#50634d)]`} data-invitation-section={stage}>
    <BotanicalSprig /><BotanicalSprig mirrored />
    <div aria-hidden className="absolute left-6 top-7 h-20 w-20 rounded-tl-[70px] border-l border-t border-[var(--inv-scene-accent,#879a77)]/50" />
    <p className={`${caption} relative mb-12 text-[color:var(--inv-scene-text,#768968)]`}>Botanical • Ivory</p>
    <div className="relative flex min-h-[370px] w-[min(77vw,300px)] flex-col items-center justify-center border border-[var(--inv-scene-accent,#8da080)] bg-[var(--inv-scene-surface,#fffdf3)] text-[color:var(--inv-scene-surface-ink)] px-6 py-10 shadow-[0_22px_0_#dfddc9,0_30px_50px_#5265481c]">
      <span aria-hidden className="absolute inset-3 border border-[var(--inv-scene-accent,#c5d1b4)]"/>
      <Leaf aria-hidden className="relative mb-8 h-12 w-12 -rotate-45 text-[color:var(--inv-scene-text,#748c6b)]" strokeWidth={0.65}/>
      <p className={`${caption} relative mb-5 text-[color:var(--inv-scene-text,#809179)]`}>{content}</p>
      <Names className="text-[27px]">{names}</Names>
      <Lines className="relative mt-7"><Leaf className="h-4 w-4"/></Lines>
      <p className="relative mt-7 text-xs tracking-[.2em]">{date}</p>
    </div>
    {isEnvelope ? <Open onClick={onOpen}>Buka Undangan</Open> : <p className="relative mt-12 max-w-xs text-sm leading-7">Kehadiran Anda adalah bagian dari cerita kami.</p>}
  </section>;

  if (theme === "classic-pearl") return <section className={`${center} bg-[var(--inv-scene-bg,#f8f6ef)] text-[color:var(--inv-scene-ink,#37352f)]`} data-invitation-section={stage}>
    <span aria-hidden className="absolute inset-5 border border-[var(--inv-scene-accent,#b4a88c)]" />
    <span aria-hidden className="absolute inset-8 border border-[var(--inv-scene-accent,#d8ceba)]" />
    <p className={`${caption} relative mt-14 text-[color:var(--inv-scene-text,#8a7c62)]`}>{isEnvelope ? "The private invitation" : "Classic Pearl"}</p>
    <div className="relative mt-10 flex h-[280px] w-[min(66vw,265px)] items-center justify-center rounded-full border border-[var(--inv-scene-accent,#baa989)]">
      <div aria-hidden className="absolute inset-3 rounded-full border border-[var(--inv-scene-accent,#c9b99b)]" />
      <Gem aria-hidden className="absolute -top-5 h-10 w-10 bg-[var(--inv-scene-soft,#f8f6ef)] p-2 text-[color:var(--inv-scene-text,#917f5c)]" strokeWidth={0.8} />
      <Names className="z-10 px-5 text-3xl">{names}</Names>
    </div>
    <Lines className="relative mt-10"><Gem className="h-4 w-4"/></Lines>
    <p className="relative mt-7 text-xs uppercase tracking-[.22em]">{date}</p>
    {isEnvelope ? <Open onClick={onOpen}>Buka Undangan</Open> : <p className="relative mt-9 max-w-xs text-xs leading-7 tracking-[.18em]">WITH LOVE AND GRATITUDE</p>}
  </section>;

  if (theme === "golden-art-deco") return <section className={`${center} bg-[var(--inv-scene-bg,#191b17)] text-[color:var(--inv-scene-ink,#e4c888)]`} data-invitation-section={stage}>
    <div aria-hidden className="absolute inset-4 border border-[var(--inv-scene-accent,#ba9a55)]/65" />
    <div aria-hidden className="absolute inset-8 border border-[var(--inv-scene-accent,#ba9a55)]/30" />
    <div aria-hidden className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rotate-45 border border-[var(--inv-scene-accent,#bd9e59)]/70" />
    <div aria-hidden className="absolute left-1/2 top-[-80px] h-52 w-52 -translate-x-1/2 rotate-45 border border-[var(--inv-scene-accent,#bd9e59)]/40" />
    <div aria-hidden className="absolute bottom-[-105px] left-1/2 h-64 w-64 -translate-x-1/2 rotate-45 border border-[var(--inv-scene-accent,#bd9e59)]/40" />
    <p className={`${caption} relative mt-20`}>{isEnvelope ? "You are cordially invited" : "A gilded celebration"}</p>
    <div aria-hidden className="relative mt-10 flex items-center gap-2">{[0,1,2,3,4].map(i=><span key={i} className="h-8 w-4 border-x border-t border-[var(--inv-scene-accent,#bf9c4b)]" style={{height:`${33+Math.abs(2-i)*19}px`}}/>)}</div>
    <Names className="relative mt-14 max-w-xs text-3xl tracking-[.09em]">{names}</Names>
    <div aria-hidden className="relative mt-10 flex gap-3"><span className="h-14 w-px -rotate-45 bg-[var(--inv-scene-soft,#bf9c4b)]"/><Gem className="h-7 w-7"/><span className="h-14 w-px rotate-45 bg-[var(--inv-scene-soft,#bf9c4b)]"/></div>
    <p className="relative mt-5 text-xs tracking-[.23em]">{date}</p>
    {isEnvelope ? <Open dark onClick={onOpen}>ENTER THE CELEBRATION</Open> : <Lines className="mt-8"><Gem className="h-4 w-4"/></Lines>}
  </section>;

  if (theme === "paper-cut-botanical") return <section className={`${center} bg-[var(--inv-scene-bg,#e9ead7)] text-[color:var(--inv-scene-ink,#435e45)]`} data-invitation-section={stage}>
    <div aria-hidden className="absolute -left-20 -top-10 h-[400px] w-64 rotate-[-32deg] rounded-full border-[55px] border-[var(--inv-scene-accent,#aebf96)] bg-[var(--inv-scene-soft,#dce1c2)] shadow-[15px_15px_0_#d1dcad]" />
    <div aria-hidden className="absolute -right-20 bottom-[-95px] h-[440px] w-72 rotate-[23deg] rounded-full border-[50px] border-[var(--inv-scene-accent,#9aaf88)] bg-[var(--inv-scene-soft,#c6d0aa)] shadow-[-15px_-15px_0_#d4dab4]" />
    <Leaf aria-hidden className="absolute -left-3 top-12 h-40 w-40 rotate-[-30deg] fill-[var(--inv-scene-soft,#b2c2a0)] text-[color:var(--inv-scene-text,#819975)]" strokeWidth={0.7}/>
    <Leaf aria-hidden className="absolute -right-4 bottom-20 h-44 w-44 rotate-[170deg] fill-[var(--inv-scene-soft,#a4b998)] text-[color:var(--inv-scene-text,#76926e)]" strokeWidth={0.7}/>
    <p className={`${caption} relative mb-10 text-[color:var(--inv-scene-text,#687b57)]`}>Handcrafted in paper</p>
    <div className="relative flex min-h-[350px] w-[min(77vw,300px)] flex-col items-center justify-center rounded-t-[155px] border-[9px] border-[var(--inv-scene-accent,#fdfcf1)] bg-[var(--inv-scene-surface,#f7f6e9)] text-[color:var(--inv-scene-surface-ink)] px-7 py-9 shadow-[12px_16px_0_#aabf92]">
      <Sun aria-hidden className="mb-7 h-10 w-10 text-[color:var(--inv-scene-text,#93a97c)]" strokeWidth={0.8}/>
      <p className={caption}>{content}</p>
      <Names className="mt-6 text-3xl italic">{names}</Names>
      <p className="mt-7 text-xs">{date}</p>
    </div>
    {isEnvelope ? <Open onClick={onOpen}>Buka Kartu Undangan</Open> : <Lines className="mt-12"><Leaf className="h-5 w-5"/></Lines>}
  </section>;

  if (theme === "celestial-ink") return <section className={`${center} bg-[var(--inv-scene-bg,#101b32)] text-[color:var(--inv-scene-ink,#c9e2f0)]`} data-invitation-section={stage}>
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{backgroundImage:"radial-gradient(circle,#c9e2f0aa 1px,transparent 1.5px)",backgroundSize:"31px 41px",opacity:0.6}}/>
    <div aria-hidden className="absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-[var(--inv-scene-accent,#a4c0e1)]/40"/>
    <div aria-hidden className="absolute left-1/2 top-[23%] h-[340px] w-[340px] -translate-x-1/2 rounded-full border border-[var(--inv-scene-accent,#a4c0e1)]/55"/>
    <div aria-hidden className="absolute left-1/2 top-[29%] h-[260px] w-[260px] -translate-x-1/2 rounded-full border border-[var(--inv-scene-accent,#a4c0e1)]/50"/>
    <Moon aria-hidden className="relative mt-14 h-16 w-16 text-[color:var(--inv-scene-text,#b8cfea)]" strokeWidth={0.65}/>
    <p className={`${caption} relative mt-8 text-[color:var(--inv-scene-text,#a3c8e5)]`}>Written in the stars</p>
    <Names className="relative mt-12 max-w-xs text-3xl">{names}</Names>
    <div aria-hidden className="relative mt-12 flex items-center gap-4"><Star className="h-4 w-4"/><Sparkles className="h-6 w-6"/><Star className="h-4 w-4"/></div>
    <p className="relative mt-9 text-xs uppercase tracking-[.23em]">{date}</p>
    {isEnvelope ? <Open dark onClick={onOpen}>Buka Undangan ✧</Open> : <Lines className="mt-9"><Moon className="h-4 w-4"/></Lines>}
  </section>;

  return <section className={center} data-invitation-section={stage}>
    <Names className="text-3xl">{names}</Names><p className="mt-4">{date}</p>
    {isEnvelope ? <Open onClick={onOpen}/> : <ArrowUpRight className="mt-7 h-5 w-5" />}
  </section>;
}
