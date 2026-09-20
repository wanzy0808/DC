import { useId } from "react";

type ReliefPanelProps = {
  variant: "upper" | "lower";
  mirrored?: boolean;
};

// Organic carved acanthus/stem shapes: no photographic facade is cut or rotated.
// This SVG lives inside the actual front face of a hinged leaf, so all its
// highlights, recesses and paths travel with the leaf at every opening angle.
const UPPER_STEMS = [
  "M90 213 C90 187 66 177 53 153 S39 118 56 98 C72 80 94 89 91 108 C89 120 75 124 71 113",
  "M90 213 C90 187 114 177 127 153 S141 118 124 98 C108 80 86 89 89 108 C91 120 105 124 109 113",
  "M90 187 C65 188 48 174 44 158 C41 144 51 135 61 139 C72 145 69 158 60 160",
  "M90 187 C115 188 132 174 136 158 C139 144 129 135 119 139 C108 145 111 158 120 160",
  "M90 73 C79 64 63 66 54 56 C43 44 50 29 61 32 C72 36 71 46 65 49",
  "M90 73 C101 64 117 66 126 56 C137 44 130 29 119 32 C108 36 109 46 115 49",
];
const LOWER_STEMS = [
  "M90 32 C90 65 56 81 50 115 C45 139 69 149 79 133 C85 121 75 111 67 117",
  "M90 32 C90 65 124 81 130 115 C135 139 111 149 101 133 C95 121 105 111 113 117",
  "M90 98 C65 93 43 74 32 89 C24 102 34 118 45 114 C53 111 51 103 45 102",
  "M90 98 C115 93 137 74 148 89 C156 102 146 118 135 114 C127 111 129 103 135 102",
  "M90 146 C86 172 53 172 49 195 C46 212 65 222 73 209 C77 203 73 196 67 198",
  "M90 146 C94 172 127 172 131 195 C134 212 115 222 107 209 C103 203 107 196 113 198",
];
const ACANTHUS_LEAVES = [
  "M56 98 Q34 90 31 67 Q51 69 61 88 Q56 76 62 65 Q77 84 66 101 Z",
  "M124 98 Q146 90 149 67 Q129 69 119 88 Q124 76 118 65 Q103 84 114 101 Z",
  "M54 156 Q28 156 24 132 Q44 137 57 149 Q51 132 60 125 Q77 144 63 157 Z",
  "M126 156 Q152 156 156 132 Q136 137 123 149 Q129 132 120 125 Q103 144 117 157 Z",
  "M79 193 Q61 200 61 224 Q81 218 90 204 Q99 218 119 224 Q119 200 101 193 Q90 199 79 193 Z",
  "M90 59 Q75 52 79 28 Q89 34 90 46 Q91 34 101 28 Q105 52 90 59 Z",
];

function CarvedOrnament({
  variant,
  mirrored = false,
}: ReliefPanelProps) {
  const rawId = useId().replace(/:/g, "");
  const fillId = "carved-petal-" + rawId;
  const strokeId = "carved-rail-" + rawId;
  const paths = variant === "upper" ? UPPER_STEMS : LOWER_STEMS;
  return (
    <svg
      viewBox="0 0 180 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 h-full w-full"
      style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={fillId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#e9bbc2" stopOpacity=".82" />
          <stop offset="46%" stopColor="#c98d98" stopOpacity=".67" />
          <stop offset="100%" stopColor="#8e4f5c" stopOpacity=".82" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" x2="1" y1="0" y2=".9">
          <stop offset="0%" stopColor="#f5d4d9" stopOpacity=".86" />
          <stop offset="48%" stopColor="#c58c96" stopOpacity=".70" />
          <stop offset="100%" stopColor="#955965" stopOpacity=".90" />
        </linearGradient>
      </defs>

      {/* Recessed curved panel line plus a slightly inset lighter top ridge. */}
      <path
        d="M90 12 C113 28 138 30 154 48 L154 201 C133 218 117 224 90 239 C63 224 47 218 26 201 L26 48 C42 30 67 28 90 12 Z"
        fill="none"
        stroke="#673742"
        strokeOpacity=".55"
        strokeWidth="3"
        transform="translate(0 2)"
      />
      <path
        d="M90 12 C113 28 138 30 154 48 L154 201 C133 218 117 224 90 239 C63 224 47 218 26 201 L26 48 C42 30 67 28 90 12 Z"
        fill="none"
        stroke="#e9bdc4"
        strokeOpacity=".65"
        strokeWidth="1.5"
      />
      <path
        d="M90 23 C112 37 131 39 143 53 L143 193 C129 206 108 215 90 227 C72 215 51 206 37 193 L37 53 C49 39 68 37 90 23 Z"
        fill="none"
        stroke="#794350"
        strokeOpacity=".48"
        strokeWidth="2.5"
        transform="translate(.6 1.5)"
      />
      <path
        d="M90 23 C112 37 131 39 143 53 L143 193 C129 206 108 215 90 227 C72 215 51 206 37 193 L37 53 C49 39 68 37 90 23 Z"
        fill="none"
        stroke="#e6b7c0"
        strokeOpacity=".52"
        strokeWidth="1"
      />

      {/* Paired scrolls: shadow underneath, relief ridge above. */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#65323e" strokeOpacity=".64" strokeWidth="4" transform="translate(.9 1.9)">
          {paths.map((d, index) => <path key={index} d={d} />)}
        </g>
        <g stroke={"url(#" + strokeId + ")"} strokeWidth="2.6">
          {paths.map((d, index) => <path key={index} d={d} />)}
        </g>
        <g stroke="#f5d1d7" strokeOpacity=".38" strokeWidth=".8" transform="translate(-.8 -1)">
          {paths.map((d, index) => <path key={index} d={d} />)}
        </g>
      </g>

      {/* Acanthus leaves are intentionally small: floral crest belongs to stage 8. */}
      <g transform={variant === "upper" ? undefined : "translate(180 250) rotate(180 0 0)"}>
        {ACANTHUS_LEAVES.map((d, index) => (
          <g key={index}>
            <path d={d} fill="#67313f" opacity=".48" transform="translate(1 2.2)" />
            <path d={d} fill={"url(#" + fillId + ")"} stroke="#d7a4ad" strokeOpacity=".70" strokeWidth=".8" />
          </g>
        ))}
      </g>

      {/* Small carved diamond, not a free-floating decal or frame topper. */}
      <path d="M90 101 L104 125 L90 149 L76 125 Z" fill="#5f313e" opacity=".42" transform="translate(1.5 2.2)" />
      <path d="M90 101 L104 125 L90 149 L76 125 Z" fill={"url(#" + fillId + ")"} stroke="#f0cbd1" strokeOpacity=".70" strokeWidth="1.1" />
      <path d="M90 111 L98 125 L90 139 L82 125 Z" fill="none" stroke="#7f4653" strokeOpacity=".60" strokeWidth="1.4" />
      <path d="M90 114 L96 125 L90 136 L84 125 Z" fill="#dfaeb7" opacity=".52" />
    </svg>
  );
}

export default function DoorRelief({ side }: { side: "left" | "right" }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-[13%] top-[13%] h-[30%] overflow-hidden" aria-hidden="true">
        <CarvedOrnament variant="upper" mirrored={side === "right"} />
      </div>
      <div className="pointer-events-none absolute inset-x-[13%] bottom-[11%] h-[34%] overflow-hidden" aria-hidden="true">
        <CarvedOrnament variant="lower" mirrored={side === "right"} />
      </div>
    </>
  );
}
