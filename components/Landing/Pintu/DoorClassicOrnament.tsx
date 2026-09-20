import { useId } from "react";

const METAL = {
  dark: "#9b5f4f",
  mid: "#c88c73",
  light: "#f1c2a5",
  pale: "#f7d9c5",
  shadow: "#6f4037",
};

function LeafSprig({ compact = false, mirrored = false }: { compact?: boolean; mirrored?: boolean }) {
  const id = useId().replace(/:/g, "");
  const grad = "leaf-metal-" + id;
  const metalUrl = "url(#" + grad + ")";

  return (
    <svg viewBox="0 0 180 220" className="h-full w-full" aria-hidden="true" focusable="false" style={{ transform: mirrored ? "scaleX(-1)" : undefined }}>
      <defs>
        <linearGradient id={grad} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={METAL.pale} />
          <stop offset=".32" stopColor={METAL.light} />
          <stop offset=".68" stopColor={METAL.mid} />
          <stop offset="1" stopColor={METAL.dark} />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M90 196 C92 158 90 117 91 76 C90 55 90 38 90 26" stroke={METAL.shadow} strokeWidth="6" opacity=".35" transform="translate(1.5 2)" />
        <path d="M90 196 C92 158 90 117 91 76 C90 55 90 38 90 26" stroke={metalUrl} strokeWidth="3.2" />
        {!compact && (
          <>
            <path d="M90 118 C63 110 51 89 48 68 C68 72 82 86 90 105" stroke={METAL.shadow} strokeWidth="5" opacity=".35" transform="translate(1 2)" />
            <path d="M90 118 C63 110 51 89 48 68 C68 72 82 86 90 105" stroke={metalUrl} strokeWidth="2.8" />
            <path d="M91 118 C118 110 130 89 133 68 C113 72 99 86 91 105" stroke={METAL.shadow} strokeWidth="5" opacity=".35" transform="translate(1 2)" />
            <path d="M91 118 C118 110 130 89 133 68 C113 72 99 86 91 105" stroke={metalUrl} strokeWidth="2.8" />
          </>
        )}
      </g>
      <path d="M89 26 C72 42 77 59 90 68 C103 58 108 42 91 26 Z" fill={metalUrl} stroke={METAL.pale} strokeWidth="1" />
      {!compact && (
        <>
          <path d="M51 70 C33 73 27 89 30 103 C47 102 61 91 65 76 C60 73 56 71 51 70 Z" fill={metalUrl} stroke={METAL.pale} strokeWidth=".9" />
          <path d="M130 70 C148 73 154 89 151 103 C134 102 120 91 116 76 C121 73 125 71 130 70 Z" fill={metalUrl} stroke={METAL.pale} strokeWidth=".9" />
        </>
      )}
      <path d="M90 170 C67 169 52 184 53 202 C70 198 83 187 90 175 C97 187 110 198 127 202 C128 184 113 169 90 170 Z" fill="none" stroke={metalUrl} strokeWidth="3" />
      <path d="M90 154 C74 151 63 139 63 126 C77 128 86 137 90 147 C94 137 103 128 117 126 C117 139 106 151 90 154 Z" fill={metalUrl} stroke={METAL.pale} strokeWidth=".8" />
    </svg>
  );
}

function CornerFlourish({ flipX = false, flipY = false }: { flipX?: boolean; flipY?: boolean }) {
  const transform = "scale(" + (flipX ? -1 : 1) + " " + (flipY ? -1 : 1) + ")";
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true" style={{ transform }}>
      <path d="M10 66 V22 Q10 10 22 10 H66" fill="none" stroke={METAL.shadow} strokeWidth="5" opacity=".33" transform="translate(1.4 1.7)" />
      <path d="M10 66 V22 Q10 10 22 10 H66" fill="none" stroke={METAL.light} strokeWidth="2.7" />
      <path d="M18 47 C29 45 35 36 35 26 C26 27 20 33 18 41 M32 18 C34 29 43 35 53 35 C52 26 46 20 40 18" fill="none" stroke={METAL.mid} strokeWidth="2.3" strokeLinecap="round" />
      <path d="M16 16 L28 18 L18 28 Z" fill={METAL.light} stroke={METAL.pale} strokeWidth=".7" />
    </svg>
  );
}

export function LeafPanelOrnaments({ side }: { side: "left" | "right" }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute left-[13%] top-[11%] h-[8%] w-[14%]"><CornerFlourish /></div>
      <div className="absolute right-[13%] top-[11%] h-[8%] w-[14%]"><CornerFlourish flipX /></div>
      <div className="absolute left-[13%] top-[47%] h-[8%] w-[14%]"><CornerFlourish flipY /></div>
      <div className="absolute right-[13%] top-[47%] h-[8%] w-[14%]"><CornerFlourish flipX flipY /></div>
      <div className="absolute left-[29%] top-[18%] h-[25%] w-[42%]">
        <LeafSprig mirrored={side === "right"} />
      </div>
      <div className="absolute left-1/2 top-[63.2%] h-[11px] w-[11px] -translate-x-1/2 rotate-45"
        style={{
          background: "linear-gradient(135deg," + METAL.pale + "," + METAL.mid + " 62%," + METAL.dark + ")",
          boxShadow: "1px 1px 2px rgba(71,36,31,.35), -1px -1px 1px rgba(255,225,207,.35)",
        }}
      />
      <div className="absolute left-[15%] bottom-[8.5%] h-[7%] w-[13%]"><CornerFlourish flipY /></div>
      <div className="absolute right-[15%] bottom-[8.5%] h-[7%] w-[13%]"><CornerFlourish flipX flipY /></div>
      <div className="absolute left-[31%] bottom-[11%] h-[18%] w-[38%]">
        <LeafSprig compact mirrored={side === "right"} />
      </div>
    </div>
  );
}

function AcanthusWing({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 210 105" className="h-full w-full" aria-hidden="true" style={{ transform: mirrored ? "scaleX(-1)" : undefined }}>
      <path d="M5 83 C50 78 68 61 82 42 C94 25 111 19 133 24 C112 36 105 50 104 66 C125 43 148 37 177 45 C154 55 140 70 132 87 C161 66 184 67 205 73" fill="none" stroke={METAL.shadow} strokeWidth="8" strokeLinecap="round" opacity=".33" transform="translate(1.5 2)" />
      <path d="M5 83 C50 78 68 61 82 42 C94 25 111 19 133 24 C112 36 105 50 104 66 C125 43 148 37 177 45 C154 55 140 70 132 87 C161 66 184 67 205 73" fill="none" stroke={METAL.light} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M70 59 C66 45 71 33 86 27 C88 42 83 53 70 59 Z M110 63 C116 42 130 30 150 30 C141 47 129 58 110 63 Z M144 81 C158 66 175 61 192 66 C181 79 164 84 144 81 Z" fill={METAL.mid} stroke={METAL.pale} strokeWidth=".8" />
    </svg>
  );
}

export function FrameClassicOrnament() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
      <div className="absolute left-1/2 top-[-5.5%] h-[11%] w-[58%] -translate-x-1/2">
        <div className="absolute left-0 top-[22%] h-[64%] w-[45%]"><AcanthusWing /></div>
        <div className="absolute right-0 top-[22%] h-[64%] w-[45%]"><AcanthusWing mirrored /></div>
        <div className="absolute left-1/2 top-[4%] h-[88%] w-[16%] -translate-x-1/2 rounded-[48%_48%_42%_42%]"
          style={{
            background: "linear-gradient(145deg," + METAL.pale + "," + METAL.light + " 37%," + METAL.mid + " 72%," + METAL.dark + ")",
            boxShadow: "2px 3px 4px rgba(75,38,31,.34), inset 1px 1px 2px rgba(255,236,220,.65)",
          }}
        >
          <div className="absolute inset-[17%] rounded-[50%] border border-[#f5d2ba]/80 bg-[#d9a58f]/45" />
        </div>
      </div>
      {(["left","right"] as const).map((side) => (
        <div key={side} className={"absolute top-[5.2%] h-[18%] w-[5%] " + (side === "left" ? "left-[-.55%]" : "right-[-.55%]")}>
          <div className="absolute inset-x-0 top-0 h-[27%] rounded-sm border border-[#efc3aa]/65 bg-[linear-gradient(#d9a893,#b97663)] shadow-[1px_1px_2px_rgba(65,31,26,.28)]" />
          <div className="absolute inset-x-[17%] top-[31%] h-[30%]"><LeafSprig compact mirrored={side === "right"} /></div>
          <div className="absolute inset-x-0 bottom-0 h-[22%] rounded-sm border border-[#efc3aa]/55 bg-[linear-gradient(#c68a74,#a96558)]" />
        </div>
      ))}
      {(["left","right"] as const).map((side) => (
        <div key={side} className={"absolute bottom-[2.6%] h-[8%] w-[4.6%] " + (side === "left" ? "left-[-.4%]" : "right-[-.4%]")}>
          <LeafSprig compact mirrored={side === "right"} />
        </div>
      ))}
    </div>
  );
}
