type Side = "left" | "right";

// All of these are children of the leaf's front face. The dark bevel,
// raised Rose ridge and inner highlight create a continuous stepped profile
// without a square picture-frame card or any pieces left in the doorway.
const outerRail = {
  border: "2px solid #bd818c",
  boxShadow:
    "inset 2px 2px 2px rgba(255,225,230,.58), inset -2px -2px 3px rgba(70,26,37,.43), 1px 1px 2px rgba(68,25,36,.35), -1px -1px 1px rgba(250,219,225,.27)",
};
const middleRail = {
  border: "2px solid #e2aeb8",
  boxShadow:
    "inset 1px 1px 1px rgba(255,229,233,.48), inset -2px -2px 2px rgba(89,35,47,.48), 1px 2px 2px rgba(70,25,38,.24)",
};
const innerRecess = {
  border: "1px solid #824652",
  boxShadow:
    "inset 2px 3px 5px rgba(57,19,31,.45), inset -1px -1px 2px rgba(253,221,226,.26), 0 -1px 1px rgba(250,217,224,.45)",
};

function PanelMolding({ lower }: { lower: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-[11%] ${lower ? "bottom-[9%] h-[38%]" : "top-[11%] h-[34%]"}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={outerRail} />
      <div className="absolute inset-[3px]" style={middleRail} />
      <div className="absolute inset-[7px]" style={innerRecess} />

      {/* Four short corner miters visibly tie the raised rails together. */}
      <span className="absolute left-[3px] top-[3px] h-[7px] w-[7px] border-l border-t border-[#f1c6ce]/80" />
      <span className="absolute right-[3px] top-[3px] h-[7px] w-[7px] border-r border-t border-[#f1c6ce]/80" />
      <span className="absolute bottom-[3px] left-[3px] h-[7px] w-[7px] border-b border-l border-[#925562]/70" />
      <span className="absolute bottom-[3px] right-[3px] h-[7px] w-[7px] border-b border-r border-[#925562]/70" />
    </div>
  );
}

/**
 * Stage 7 — attached trim on one rotating leaf. Kept independent of the
 * stationary jamb: opening the door carries every contour and meeting strip.
 */
export default function DoorMolding({ side }: { side: Side }) {
  const centerSide = side === "left" ? "right-[1.1%]" : "left-[1.1%]";
  return (
    <>
      {/* Continuous three-level perimeter around both inset carved panels. */}
      <div
        className="pointer-events-none absolute inset-[4.8%]"
        style={{
          border: "3px solid #bc828c",
          boxShadow:
            "inset 1px 1px 2px rgba(255,231,235,.55), inset -2px -2px 4px rgba(69,22,36,.40), 1px 1px 2px rgba(70,22,34,.48), -1px -1px 1px rgba(245,206,213,.33)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-[6.2%]"
        style={{
          border: "1px solid rgba(242,195,204,.65)",
          boxShadow: "0 1px 1px rgba(91,41,54,.34)",
        }}
        aria-hidden="true"
      />
      <PanelMolding lower={false} />
      <PanelMolding lower />

      {/* The seam's two narrow raised stiles remain on their own leaves.
          They never bridge across the meeting gap or stay on the fixed jamb. */}
      <div
        className={`pointer-events-none absolute bottom-[5.5%] top-[5.5%] w-[3px] ${centerSide}`}
        style={{
          background: "linear-gradient(90deg,#82434f,#e9b9c2 42%,#aa6a77 80%,#773e4c)",
          boxShadow: "1px 0 2px rgba(67,23,35,.40), -1px 0 1px rgba(255,225,231,.32)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

/** Stationary, recessed accent strips inside the existing structural frame. */
export function FrameMolding() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-x-[.6%] top-[.65%] h-[3px]"
        style={{
          background: "linear-gradient(#f0c7ce,#c18a94 55%,#864e5b)",
          boxShadow: "0 2px 2px rgba(69,25,37,.30)",
        }}
      />
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`absolute bottom-[2.2%] top-[3.5%] w-[2px] ${
            side === "left" ? "left-[1.8%]" : "right-[1.8%]"
          }`}
          style={{
            background: "linear-gradient(90deg,#874853,#e9b8c0 50%,#9e616d)",
            boxShadow: "1px 0 2px rgba(57,21,32,.38)",
          }}
        />
      ))}
      <div
        className="absolute bottom-[.65%] left-[.6%] right-[.6%] h-[2px]"
        style={{
          background: "linear-gradient(#d2a0aa,#9a5e6b)",
          boxShadow: "0 1px 1px rgba(66,26,36,.31)",
        }}
      />
    </div>
  );
}
