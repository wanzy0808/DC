import type { InvitationSectionKey } from "@/lib/templates/sections";

/** Crisp vector stationery; important parts remain individual Studio targets. */
export function BirthdayCake({ section = "cover", className = "" }: { section?: string; className?: string }) {
  const key = "object:" + section + ":";
  return <div aria-hidden="true" data-studio-native-object={key + "cake-art"} className={["cc-cake", className].join(" ")}>
    <svg viewBox="0 0 380 340" fill="none" focusable="false">
      <g data-studio-native-object={key + "cake-stand-art"} className="cc-blue-fill">
        <path d="M171 284h38v31h-38z" />
        <path d="M139 320c0-8 19-15 51-15s51 7 51 15v6H139z" />
        <ellipse cx="190" cy="280" rx="153" ry="17" />
      </g>
      <g data-studio-native-object={key + "cake-body-art"} className="cc-coral-fill">
        <path d="M71 191h238v79c0 11-53 20-119 20S71 281 71 270z" className="cc-coral-fill" />
        <path d="M116 108h148v80c0 9-33 16-74 16s-74-7-74-16z" className="cc-soft-fill" />
      </g>
      <g data-studio-native-object={key + "cake-icing-art"} className="cc-paper-fill">
        <ellipse cx="190" cy="191" rx="119" ry="19" />
        <ellipse cx="190" cy="108" rx="74" ry="15" />
        <path d="M116 109c17 12 46 15 74 15s57-3 74-15v20c-4 0-6-7-10-7s-5 19-11 19-7-10-12-10-6 6-10 6-5-14-10-14-6 12-12 12-5-8-10-8-7 18-14 18-6-16-12-16-6 8-11 8-6-14-11-14-8 9-15 5z" />
        <path d="M71 193c31 16 77 20 119 20s88-4 119-20v22c-8 10-16-4-24-4s-9 18-17 18-9-12-16-12-10 8-17 8-9-16-17-16-7 19-15 19-8-9-15-9-10 13-19 13-8-19-16-19-9 8-17 8-9-11-16-11-12 8-17 4-9-15-15-15-10 8-17-2z" />
      </g>
      <g data-studio-native-object={key + "candles-art"} className="cc-blue-fill">
        <path d="M151 56h10v49h-10zM185 44h10v58h-10zM220 56h10v49h-10z" className="cc-blue-fill" />
        <path d="m151 68 10-5m-10 19 10-5m-10 19 10-5m24-34 10-5m-10 19 10-5m-10 19 10-5m25-9 10-5m-10 19 10-5m-10 19 10-5" stroke="var(--inv-surface)" strokeWidth="4" />
        <path d="M156 51c-12-5-7-19 0-27 7 8 12 22 0 27Zm34-12c-12-5-7-19 0-27 7 8 12 22 0 27Zm35 12c-12-5-7-19 0-27 7 8 12 22 0 27Z" className="cc-flames" />
      </g>
    </svg>
  </div>;
}

export function ConfettiRibbon({ objectKey, className = "" }: { objectKey: string; className?: string }) {
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={["cc-ribbon", className].join(" ")}>
    <svg viewBox="0 0 100 150" fill="none" focusable="false">
      <path d="M71 4C12 28 7 58 52 59c37 0 35-36 9-33-25 3-48 48-25 61 33 18 53-25 25-21-25 4-42 41-26 57 7 7 17 8 25 6" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
    </svg>
  </span>;
}

export function ConfettiPieces({ section }: { section: string }) {
  return <div aria-hidden="true" data-studio-native-object={"object:" + section + ":confetti-art"} className="cc-confetti">
    <span className="cc-confetti-dot" /><span className="cc-confetti-chip" /><span className="cc-confetti-arc" />
  </div>;
}

export function ConfettiClubSectionArt({ section }: { section: InvitationSectionKey }) {
  if (section === "closing") return <BirthdayCake section="closing" className="cc-closing-cake" />;
  if (section === "greeting" || section === "rsvp") {
    return <ConfettiRibbon objectKey={"object:" + section + ":ribbon-art"} className="cc-section-ribbon" />;
  }
  if (section === "dateTime" || section === "gallery") return <ConfettiPieces section={section} />;
  return null;
}
