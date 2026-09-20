type Side = "left" | "right";

const ROSE_GOLD = {
  dark: "#8f574b",
  mid: "#c78b74",
  light: "#efc1a5",
  pale: "#f6d5bd",
};

const outerRail = {
  border: "2px solid " + ROSE_GOLD.mid,
  boxShadow:
    "inset 1px 1px 2px rgba(255,226,207,.62), inset -2px -2px 3px rgba(82,41,35,.38), 1px 1px 2px rgba(70,34,31,.32)",
};
const innerRail = {
  border: "1px solid " + ROSE_GOLD.light,
  boxShadow:
    "inset 1px 1px 1px rgba(255,236,220,.45), inset -1px -1px 2px rgba(91,48,42,.35)",
};

function PanelFrame({ className }: { className: string }) {
  return (
    <div className={"pointer-events-none absolute " + className} aria-hidden="true">
      <div className="absolute inset-0" style={outerRail} />
      <div className="absolute inset-[4px]" style={innerRail} />
      <span className="absolute left-[5px] top-[5px] h-[7px] w-[7px] border-l border-t border-[#f7d5bf]/80" />
      <span className="absolute right-[5px] top-[5px] h-[7px] w-[7px] border-r border-t border-[#f7d5bf]/80" />
      <span className="absolute bottom-[5px] left-[5px] h-[7px] w-[7px] border-b border-l border-[#9a6254]/70" />
      <span className="absolute bottom-[5px] right-[5px] h-[7px] w-[7px] border-b border-r border-[#9a6254]/70" />
    </div>
  );
}

export default function DoorMolding({ side }: { side: Side }) {
  const centerSide = side === "left" ? "right-[1.1%]" : "left-[1.1%]";
  return (
    <>
      <div
        className="pointer-events-none absolute inset-[4.6%]"
        style={{
          border: "2px solid " + ROSE_GOLD.mid,
          boxShadow:
            "inset 1px 1px 2px rgba(255,232,215,.5), inset -2px -2px 3px rgba(68,31,31,.33), 1px 1px 2px rgba(60,28,28,.32)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-[6.1%]"
        style={{ border: "1px solid rgba(246,213,189,.58)" }}
        aria-hidden="true"
      />

      {/* Classical Pintu1 hierarchy: one tall panel, a restrained horizontal
          middle panel, and one lower panel. */}
      <PanelFrame className="inset-x-[11%] top-[9.5%] h-[47%]" />
      <PanelFrame className="inset-x-[11%] top-[60%] h-[10%]" />
      <PanelFrame className="inset-x-[11%] bottom-[8.5%] h-[18%]" />

      <div
        className={"pointer-events-none absolute bottom-[5.5%] top-[5.5%] w-[3px] " + centerSide}
        style={{
          background:
            "linear-gradient(90deg," + ROSE_GOLD.dark + "," + ROSE_GOLD.pale + " 42%," + ROSE_GOLD.mid + " 78%," + ROSE_GOLD.dark + ")",
          boxShadow: "1px 0 2px rgba(64,28,28,.32), -1px 0 1px rgba(255,225,209,.3)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

export function FrameMolding() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-x-[.5%] top-[.55%] h-[4px]"
        style={{
          background:
            "linear-gradient(" + ROSE_GOLD.pale + "," + ROSE_GOLD.mid + " 55%," + ROSE_GOLD.dark + ")",
          boxShadow: "0 2px 2px rgba(65,31,28,.28)",
        }}
      />
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={"absolute bottom-[2.2%] top-[3.5%] w-[3px] " + (side === "left" ? "left-[1.7%]" : "right-[1.7%]")}
          style={{
            background:
              "linear-gradient(90deg," + ROSE_GOLD.dark + "," + ROSE_GOLD.pale + " 50%," + ROSE_GOLD.mid + ")",
            boxShadow: "1px 0 2px rgba(57,21,32,.31)",
          }}
        />
      ))}
      <div
        className="absolute bottom-[.6%] left-[.5%] right-[.5%] h-[3px]"
        style={{
          background: "linear-gradient(" + ROSE_GOLD.light + "," + ROSE_GOLD.dark + ")",
          boxShadow: "0 1px 1px rgba(66,26,36,.28)",
        }}
      />
    </div>
  );
}
