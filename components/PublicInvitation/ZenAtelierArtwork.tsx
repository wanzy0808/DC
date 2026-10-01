import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

type ArtworkProps = { className?: string; style?: CSSProperties; studioObject?: string };
const root = "/templates/zen-atelier/";

export function EnsoSun({ className = "", style, studioObject }: ArtworkProps) {
  return (
    <svg viewBox="0 0 240 240" fill="none" className={className} style={style} aria-hidden="true" data-studio-native-object={studioObject}>
      <circle cx="120" cy="120" r="76" fill="#A9513B" fillOpacity=".92" />
      <path d="M181 160c27-35 13-90-25-117C112 11 54 35 35 79c-25 58 17 123 77 127 24 2 44-3 62-20" stroke="#893F30" strokeWidth="4" strokeLinecap="round" opacity=".45" />
      <path d="M48 90c-13 32 3 76 30 93" stroke="#F7E9D7" strokeWidth="3" strokeLinecap="round" opacity=".32" />
      <path d="M170 60c23 18 33 40 32 65" stroke="#F7E9D7" strokeWidth="2" strokeLinecap="round" opacity=".2" />
    </svg>
  );
}

export function BlossomBranch({ className = "", style, studioObject }: ArtworkProps) {
  return (
    <svg viewBox="0 0 390 350" fill="none" className={className} style={style} aria-hidden="true" data-studio-native-object={studioObject}>
      <g stroke="#54493D" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-10 4C60 50 80 96 126 133c52 40 89 70 165 101" strokeWidth="4"/>
        <path d="M72 81C93 36 131 16 180 10M123 131c5-41 26-69 61-90M163 159c41-9 79-3 112 16M213 193c-1-47 23-76 51-102M255 217c41-8 74-1 115 20" strokeWidth="2.3"/>
        <path d="M155 22l26-12M171 59l13-18M269 174l8 2M261 110l4-19" strokeWidth="1.1"/>
      </g>
      <g fill="#CE9B92" stroke="#AA746A" strokeWidth=".8">
        <path d="M178 10c-16-13-31 0-20 13-19-4-24 17-7 21-9 15 6 24 19 12 9 19 27 7 22-8 18-2 16-21-4-23 4-11-3-17-10-15z"/>
        <path d="M186 41c-12-11-25-1-18 10-14 1-14 17-1 18-5 14 10 19 16 7 9 10 19 1 15-10 14-2 11-16-4-17-1-6-4-9-8-8z"/>
        <path d="M268 95c-12-11-25-1-18 10-14 1-14 17-1 18-5 14 10 19 16 7 9 10 19 1 15-10 14-2 11-16-4-17-1-6-4-9-8-8z"/>
        <path d="M271 174c-13-11-27-1-19 11-16 0-16 18-2 20-6 14 11 20 18 6 10 12 22 1 16-12 16-2 12-17-4-18-1-5-4-9-9-7z"/>
        <path d="M365 224c-12-11-25-1-18 10-14 1-14 17-1 18-5 14 10 19 16 7 9 10 19 1 15-10 14-2 11-16-4-17-1-6-4-9-8-8z"/>
        <path d="M121 131c-10-9-21-1-15 9-12 0-12 15 0 16-5 11 8 16 14 5 8 10 17 1 12-9 13-2 10-14-3-15-1-4-3-7-8-6z"/>
      </g>
      <g fill="#E8C7BC" opacity=".92">
        <circle cx="173" cy="32" r="4"/><circle cx="186" cy="59" r="3"/><circle cx="263" cy="114" r="3"/>
        <circle cx="270" cy="193" r="3"/><circle cx="363" cy="243" r="3"/>
        <ellipse cx="231" cy="149" rx="5" ry="3" transform="rotate(-30 231 149)"/>
        <ellipse cx="324" cy="181" rx="5" ry="3" transform="rotate(22 324 181)"/>
        <ellipse cx="206" cy="74" rx="4" ry="2.5" transform="rotate(-20 206 74)"/>
      </g>
      <g fill="#71816E" opacity=".8">
        <path d="M114 46c-12-19-26-20-35-12 8 15 21 20 35 12z"/>
        <path d="M234 159c15-20 32-22 43-10-12 13-27 18-43 10z"/>
        <path d="M296 221c11-18 24-20 35-11-10 12-21 16-35 11z"/>
      </g>
    </svg>
  );
}

export function InkMountains({ className = "", style, studioObject }: ArtworkProps) {
  return (
    <svg viewBox="0 0 460 210" fill="none" className={className} style={style} aria-hidden="true" data-studio-native-object={studioObject}>
      <path d="M0 146 56 105l35 15 61-89 66 88 30-22 45-61 72 93 43-25 52 37v69H0z" fill="#9AA397" fillOpacity=".28"/>
      <path d="m0 165 73-59 37 27 62-67 53 62 47-31 51-24 67 76 70-27v88H0z" fill="#637368" fillOpacity=".37"/>
      <path d="m0 178 60-25 57 24 64-42 78 36 58-43 70 50 73-24v56H0z" fill="#334842" fillOpacity=".58"/>
      <path d="M0 190c95-17 150-10 240 2 85 13 153-18 220 0" stroke="#F6F0E5" strokeWidth="8" strokeLinecap="round" opacity=".45"/>
    </svg>
  );
}

function ArtShell({ section, children }: { section: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className={`zen-section-art zen-section-art-${section}`}>
      {children}
    </div>
  );
}

/** Artwork-only gallery fallback. Never show demo people as the couple's own photos. */
export function ZenMemoryArtwork() {
  return (
    <div aria-hidden="true" data-studio-native-object="object:gallery:memory-art" className="zen-memory-still-life relative mx-auto aspect-[4/5] max-w-sm overflow-hidden">
      <img src={root + "japanroom2.webp"} alt="" loading="lazy" data-studio-native-object="object:gallery:memory-room" className="absolute inset-0 h-full w-full object-cover" />
      <div data-studio-native-object="object:gallery:memory-gradient" className="absolute inset-0" />
      <img src={root + "japancup.webp"} alt="" loading="lazy" data-studio-native-object="object:gallery:memory-cup" className="absolute bottom-[-2%] right-[-8%] h-[55%] w-[72%] object-contain object-bottom" />
      <span data-studio-native-object="object:gallery:memory-frame" className="absolute inset-3" />
      <span className="zen-memory-seal" lang="ja">記</span>
    </div>
  );
}

/**
 * Section art deliberately alternates interiors, ink landscapes, bamboo, tea,
 * blossom and enso imagery so Zen Atelier reads as a Japanese editorial journey
 * rather than a repeated floral template. These are decorative template assets,
 * never customer photo slots.
 */
export function ZenSectionArtwork({ section }: { section: string }) {
  if (section === "greeting") {
    return (
      <ArtShell section={section}>
        <Image width={1122} height={1402} sizes="280px" src={root + "japanroom1.webp"} alt="" loading="lazy" className="zen-art-room" data-studio-native-object="object:greeting:room-art" />
        <span className="zen-art-red-rule" data-studio-native-object="object:greeting:red-rule" />
      </ArtShell>
    );
  }

  if (section === "identity") {
    return (
      <ArtShell section={section}>
        <Image width={1254} height={1254} sizes="230px" src={root + "redsun1.webp"} alt="" loading="lazy" className="zen-art-sun" data-studio-native-object="object:identity:sun-art" />
        <Image width={1254} height={1254} sizes="240px" src={root + "bunga0004.webp"} alt="" loading="lazy" className="zen-art-blossom" data-studio-native-object="object:identity:blossom-art" />
      </ArtShell>
    );
  }

  if (section === "event") {
    return (
      <ArtShell section={section}>
        <Image width={1122} height={1402} sizes="180px" src={root + "japancup.webp"} alt="" loading="lazy" className="zen-art-cup" data-studio-native-object="object:event:cup-art" />
      </ArtShell>
    );
  }

  if (section === "dateTime") {
    return (
      <ArtShell section={section}>
        <Image width={2172} height={724} sizes="(max-width: 640px) 100vw, 672px" src={root + "darkcloud1.webp"} alt="" loading="lazy" className="zen-art-cloud zen-art-cloud-high" data-studio-native-object="object:dateTime:cloud-art" />
      </ArtShell>
    );
  }

  if (section === "gallery") {
    return (
      <ArtShell section={section}>
        <Image width={2172} height={724} sizes="(max-width: 640px) 100vw, 672px" src={root + "darkcloud2.webp"} alt="" loading="lazy" className="zen-art-cloud" data-studio-native-object="object:gallery:cloud-art" />
        <Image width={1254} height={1254} sizes="190px" src={root + "ensostroke.webp"} alt="" loading="lazy" className="zen-art-enso" data-studio-native-object="object:gallery:enso-art" />
      </ArtShell>
    );
  }

  if (section === "countdown") {
    return (
      <ArtShell section={section}>
        <Image width={1254} height={1254} sizes="200px" src={root + "ensostroke.webp"} alt="" loading="lazy" className="zen-art-enso zen-art-enso-countdown" data-studio-native-object="object:countdown:enso-art" />
      </ArtShell>
    );
  }

  if (section === "location") {
    return (
      <ArtShell section={section}>
        <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "inkmountain.webp"} alt="" loading="lazy" className="zen-art-mountain" data-studio-native-object="object:location:mountain-art" />
      </ArtShell>
    );
  }

  if (section === "rsvp") {
    return (
      <ArtShell section={section}>
        <Image width={1024} height={1536} sizes="210px" src={root + "bamboo1.webp"} alt="" loading="lazy" className="zen-art-bamboo" data-studio-native-object="object:rsvp:bamboo-art" />
      </ArtShell>
    );
  }

  if (section === "wishes") {
    return (
      <ArtShell section={section}>
        <Image width={1254} height={1254} sizes="220px" src={root + "bunga0003.webp"} alt="" loading="lazy" className="zen-art-wishes-blossom" data-studio-native-object="object:wishes:blossom-art" />
      </ArtShell>
    );
  }

  if (section === "gift") {
    return (
      <ArtShell section={section}>
        <Image width={1122} height={1402} sizes="170px" src={root + "japancup.webp"} alt="" loading="lazy" className="zen-art-gift-cup" data-studio-native-object="object:gift:cup-art" />
      </ArtShell>
    );
  }

  if (section === "closing") {
    return (
      <ArtShell section={section}>
        <Image width={1254} height={1254} sizes="260px" src={root + "redsun1.webp"} alt="" loading="lazy" className="zen-art-closing-sun" data-studio-native-object="object:closing:sun-art" />
        <Image width={2172} height={724} sizes="(max-width: 640px) 100vw, 672px" src={root + "darkcloud2.webp"} alt="" loading="lazy" className="zen-art-closing-cloud" data-studio-native-object="object:closing:cloud-art" />
      </ArtShell>
    );
  }

  return null;
}
