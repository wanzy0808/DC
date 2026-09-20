import { useId } from "react";

type Side = "left" | "right";

/**
 * All floral elements are embossing *inside* the existing leaf or frame.
 * Nothing extends above the lintel or bridges the gap between the two leaves.
 */
function RoseRelief({ miniature = false }: { miniature?: boolean }) {
  const id = useId().replace(/:/g, "");
  const petal = `rose-petal-${id}`;
  const leaf = `rose-leaf-${id}`;
  const disk = `rose-disk-${id}`;

  return (
    <svg
      viewBox="0 0 220 150"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={petal} x1="0" y1="0" x2=".85" y2="1">
          <stop offset="0" stopColor="#f5d7dc" />
          <stop offset=".32" stopColor="#dca5af" />
          <stop offset=".72" stopColor="#bb7885" />
          <stop offset="1" stopColor="#8e4c5a" />
        </linearGradient>
        <linearGradient id={leaf} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dfb2b9" />
          <stop offset=".55" stopColor="#bb7d89" />
          <stop offset="1" stopColor="#874b59" />
        </linearGradient>
        <radialGradient id={disk}>
          <stop offset="0" stopColor="#ca8c97" />
          <stop offset=".75" stopColor="#b67582" />
          <stop offset="1" stopColor="#834452" />
        </radialGradient>
      </defs>

      {/* Carved oval seat: shadow + light rim make this part of the timber. */}
      <ellipse cx="110" cy="77" rx="96" ry="58" fill="#723944" opacity=".42" transform="translate(1.2 2.2)" />
      <ellipse cx="110" cy="75" rx="96" ry="58" fill={`url(#${disk})`} stroke="#e3b5be" strokeWidth="1.5" />
      <ellipse cx="110" cy="75" rx="91" ry="53" fill="none" stroke="#6d3441" strokeOpacity=".55" strokeWidth="1.6" />
      <ellipse cx="110" cy="74" rx="89" ry="51" fill="none" stroke="#edc6cd" strokeOpacity=".57" strokeWidth=".8" />

      {/* Curled stems and acanthus sprays remain strictly within the seat. */}
      <g fill="none" strokeLinecap="round">
        {[
          "M109 94 C82 115 51 119 28 98",
          "M111 94 C138 115 169 119 192 98",
          "M100 74 C79 54 54 48 36 65",
          "M120 74 C141 54 166 48 184 65",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#703843" strokeWidth="4" opacity=".55" transform="translate(1 2)" />
            <path d={d} stroke="#e4b5bd" strokeWidth="2" opacity=".85" />
          </g>
        ))}
      </g>
      {[
        ["M74 104 Q41 112 28 82 Q49 86 65 95 Q47 78 53 67 Q75 78 74 104 Z", false],
        ["M146 104 Q179 112 192 82 Q171 86 155 95 Q173 78 167 67 Q145 78 146 104 Z", false],
        ["M85 58 Q58 38 43 56 Q60 59 73 66 Q58 67 58 80 Q82 80 85 58 Z", false],
        ["M135 58 Q162 38 177 56 Q160 59 147 66 Q162 67 162 80 Q138 80 135 58 Z", false],
      ].map(([d], i) => (
        <g key={i}>
          <path d={d as string} fill="#693340" opacity=".5" transform="translate(1.5 2.3)" />
          <path d={d as string} fill={`url(#${leaf})`} stroke="#f1c7ce" strokeWidth=".9" />
        </g>
      ))}

      {/* Individual shaded petals and their offset cast shadows form a rose,
          rather than a flat flower icon or an image floating over the doorway. */}
      <g transform="translate(110 75)">
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`rotate(${i * (360 / 7)})`}>
            <path d="M-12 -10 C-30 -34 -18 -49 0 -51 C19 -48 31 -34 12 -10 Q0 1 -12 -10 Z" fill="#65303f" opacity=".42" transform="translate(1.2 2.4)" />
            <path d="M-12 -10 C-30 -34 -18 -49 0 -51 C19 -48 31 -34 12 -10 Q0 1 -12 -10 Z" fill={`url(#${petal})`} stroke="#f2cbd2" strokeWidth="1" />
            <path d="M-13 -30 Q0 -43 13 -30" fill="none" stroke="#f7dce0" strokeOpacity=".75" strokeWidth="1.1" />
          </g>
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 72 + 20})`}>
            <path d="M-9 -3 Q-22 -23 -10 -30 Q0 -36 10 -30 Q22 -23 9 -3 Q0 4 -9 -3 Z" fill="#723744" opacity=".45" transform="translate(1 2)" />
            <path d="M-9 -3 Q-22 -23 -10 -30 Q0 -36 10 -30 Q22 -23 9 -3 Q0 4 -9 -3 Z" fill={`url(#${petal})`} stroke="#f4d0d6" strokeWidth=".9" />
          </g>
        ))}
        <path d="M-11 2 Q-13 -14 3 -13 Q17 -11 14 3 Q10 14 -4 11 Q-13 7 -5 1 Q4 -5 7 2" fill="#a56371" stroke="#ebc3c9" strokeWidth="3" strokeLinecap="round" />
        <path d="M-6 -4 Q4 -12 10 -3 Q15 7 1 9" fill="none" stroke="#703744" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {!miniature && (
        <path d="M75 127 Q110 140 145 127" fill="none" stroke="#f0c9d0" strokeOpacity=".56" strokeWidth="1" />
      )}
    </svg>
  );
}

export default function DoorFlorals({ side }: { side: Side }) {
  return (
    // The crest is seated INSIDE the upper carved panel (the front leaf face
    // has overflow-hidden), so it cannot turn into horns above the frame.
    <div
      className="pointer-events-none absolute inset-x-[16%] top-[17%] h-[15%]"
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <RoseRelief />
    </div>
  );
}

export function FrameFloralAccents() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`absolute top-[.65%] h-[2.2%] w-[6%] ${
            side === "left" ? "left-[14%]" : "right-[14%]"
          }`}
        >
          {/* Small relief seats stay entirely within the stationary lintel. */}
          <RoseRelief miniature />
        </div>
      ))}
    </div>
  );
}
