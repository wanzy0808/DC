import { useId } from "react";

/**
 * Pintu 1, tahap 9: a self-contained perspective drawing of an architectural
 * foyer, located BEHIND the fixed 44px jamb. No dark rectangular backdrop,
 * photo facade, wedding-only props, or large projected light beam.
 *
 * The opening's dimensions are set by DoorFrame, not this component. The
 * ceiling, two side walls, floor, far wall and farther arch all converge on
 * one horizon. This is a lightweight perspective illustration (2.5D), not
 * a claim that the inner room is a navigable WebGL mesh.
 */
export default function DoorInterior() {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `foyer-${name}-${uid}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[3.6%] bottom-[2.2%] top-[3%] overflow-hidden bg-[#b88a8d] shadow-[inset_0_0_0_3px_rgba(93,53,62,.28)]"
      style={{ transform: "translateZ(-44px)" }}
    >
      <svg
        viewBox="0 0 600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={id("left")} x1="0" x2="1" y1="0" y2=".15">
            <stop offset="0" stopColor="#8c5b65" />
            <stop offset=".5" stopColor="#b88a8e" />
            <stop offset="1" stopColor="#d5b3af" />
          </linearGradient>
          <linearGradient id={id("right")} x1="1" x2="0" y1="0" y2=".15">
            <stop offset="0" stopColor="#8c5965" />
            <stop offset=".5" stopColor="#b98c91" />
            <stop offset="1" stopColor="#d7b7b0" />
          </linearGradient>
          <linearGradient id={id("ceiling")} x1=".5" x2=".5" y1="0" y2="1">
            <stop offset="0" stopColor="#b4838a" />
            <stop offset=".75" stopColor="#e2c4bc" />
            <stop offset="1" stopColor="#f2dacf" />
          </linearGradient>
          <linearGradient id={id("floor")} x1=".5" x2=".5" y1="0" y2="1">
            <stop offset="0" stopColor="#b18d89" />
            <stop offset=".45" stopColor="#c8a39a" />
            <stop offset="1" stopColor="#805760" />
          </linearGradient>
          <linearGradient id={id("farWall")} x1=".05" x2=".95" y1=".4" y2=".55">
            <stop offset="0" stopColor="#bd9895" />
            <stop offset=".3" stopColor="#eed5c8" />
            <stop offset=".72" stopColor="#f0d9cd" />
            <stop offset="1" stopColor="#b89292" />
          </linearGradient>
          <radialGradient id={id("vista")} cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#f8ecdf" />
            <stop offset=".55" stopColor="#e6cabe" />
            <stop offset="1" stopColor="#b08c8d" />
          </radialGradient>
          <linearGradient id={id("sideArch")} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#885b66" />
            <stop offset=".45" stopColor="#c69b9b" />
            <stop offset="1" stopColor="#e2c2b7" />
          </linearGradient>
          <clipPath id={id("farOpening")}>
            <path d="M217 651 V361 A83 83 0 0 1 383 361 V651 Z" />
          </clipPath>
        </defs>

        {/* The rear room and its more distant opening are smaller than the
            nearest jamb. Its contours create a second, deeper destination. */}
        <rect width="600" height="900" fill="#a37679" />
        <rect x="165" y="135" width="270" height="548" fill={`url(#${id("farWall")})`} />

        {/* Architectural perspective: ceiling/walls/floor meet at the SAME
            rear corners (165,135), (435,135), (165,680), (435,680). */}
        <path d="M0 0 H600 L435 135 H165 Z" fill={`url(#${id("ceiling")})`} />
        <path d="M0 0 L165 135 V680 L0 900 Z" fill={`url(#${id("left")})`} />
        <path d="M600 0 L435 135 V680 L600 900 Z" fill={`url(#${id("right")})`} />
        <path d="M0 900 L165 680 H435 L600 900 Z" fill={`url(#${id("floor")})`} />

        {/* Narrow wall reveals / skirting, never a separate gray box. */}
        <path d="M5 6 L165 135 V680 L5 894" fill="none" stroke="#6d4552" strokeOpacity=".5" strokeWidth="8" />
        <path d="M595 6 L435 135 V680 L595 894" fill="none" stroke="#714650" strokeOpacity=".5" strokeWidth="8" />
        <path d="M13 25 L169 139 V675 L13 875" fill="none" stroke="#f1cfc4" strokeOpacity=".55" strokeWidth="3" />
        <path d="M587 25 L431 139 V675 L587 875" fill="none" stroke="#efd0c4" strokeOpacity=".55" strokeWidth="3" />
        <path d="M0 42 L165 155 M600 42 L435 155" fill="none" stroke="#f5dbce" strokeOpacity=".65" strokeWidth="3" />
        <path d="M0 66 L165 176 M600 66 L435 176" fill="none" stroke="#885662" strokeOpacity=".3" strokeWidth="3" />

        {/* Side wall panel moulding follows the receding silhouette. */}
        <path d="M32 145 L142 206 V538 L32 732 Z M568 145 L458 206 V538 L568 732 Z" fill="none" stroke="#754852" strokeOpacity=".45" strokeWidth="5" />
        <path d="M37 153 L137 210 V532 L37 714 Z M563 153 L463 210 V532 L563 714 Z" fill="none" stroke="#e8bcb8" strokeOpacity=".64" strokeWidth="2" />
        <path d="M64 219 L120 249 V490 L64 585 Z M536 219 L480 249 V490 L536 585 Z" fill="none" stroke="#e8c2bb" strokeOpacity=".47" strokeWidth="2" />

        {/* A second arch has physical-looking reveals and an even more
            distant pair of silhouettes. It is not a glowing empty rectangle. */}
        <path d="M203 659 V360 A97 97 0 0 1 397 360 V659 Z" fill="#946c70" opacity=".6" />
        <path d="M210 654 V360 A90 90 0 0 1 390 360 V654 Z" fill="#bc9590" stroke="#f6dfd1" strokeOpacity=".8" strokeWidth="3" />
        <path d="M217 651 V361 A83 83 0 0 1 383 361 V651 Z" fill={`url(#${id("vista")})`} />
        <g clipPath={`url(#${id("farOpening")})`}>
          <path d="M238 654 V382 A62 62 0 0 1 362 382 V654" fill="none" stroke="#c29f9a" strokeOpacity=".6" strokeWidth="9" />
          <path d="M245 653 V386 A55 55 0 0 1 355 386 V653" fill="none" stroke="#f2dccd" strokeOpacity=".65" strokeWidth="2" />
          <path d="M219 626 L300 584 L381 626 V651 H219 Z" fill="#bfaaa0" opacity=".28" />
          <path d="M246 651 V419 M354 651 V419" fill="none" stroke="#b5908b" strokeOpacity=".29" strokeWidth="13" />
          <path d="M265 648 V486 M335 648 V486" fill="none" stroke="#f5e6d9" strokeOpacity=".5" strokeWidth="2" />
          <path d="M222 650 L300 609 L379 650" fill="none" stroke="#b6918f" strokeOpacity=".52" strokeWidth="3" />
          <path d="M300 610 V651" fill="none" stroke="#b99592" strokeOpacity=".35" strokeWidth="2" />
        </g>
        <path d="M217 651 V361 A83 83 0 0 1 383 361 V651" fill="none" stroke="#7d4e58" strokeOpacity=".45" strokeWidth="7" />
        <path d="M214 651 V361 A86 86 0 0 1 386 361 V651" fill="none" stroke="#f4dcd1" strokeOpacity=".73" strokeWidth="2" />
        <path d="M183 667 H417 M176 674 H424" fill="none" stroke="#a47b7a" strokeOpacity=".7" strokeWidth="4" />

        {/* Receding pilasters and ceiling coffers establish tangible scale. */}
        <path d="M176 176 V654 M192 176 V653 M408 176 V653 M424 176 V654" stroke="#b48c8a" strokeWidth="5" strokeOpacity=".7" />
        <path d="M180 181 V642 M420 181 V642" stroke="#f8dfd1" strokeWidth="2" strokeOpacity=".72" />
        <path d="M193 209 H407 M188 220 H412" stroke="#f6dfd1" strokeOpacity=".64" strokeWidth="3" />
        <path d="M46 22 L192 138 H408 L554 22 M85 53 L207 145 H393 L515 53" fill="none" stroke="#9d7273" strokeOpacity=".49" strokeWidth="5" />
        <path d="M77 20 L217 127 H383 L523 20" fill="none" stroke="#fff0e2" strokeOpacity=".55" strokeWidth="2" />
        <path d="M300 12 L300 125 M130 0 L230 133 M470 0 L370 133" fill="none" stroke="#a47c7b" strokeOpacity=".37" strokeWidth="2" />

        {/* Floor joint lines converge into the far arch. The side walls and
            floor are a single continuous foyer rather than gray blocks. */}
        <path d="M0 900 L165 680 M120 900 L209 680 M240 900 L253 680 M360 900 L347 680 M480 900 L391 680 M600 900 L435 680" fill="none" stroke="#f2d9c8" strokeOpacity=".34" strokeWidth="2" />
        <path d="M0 823 L600 823 M91 772 L509 772 M133 725 L467 725 M160 687 L440 687" fill="none" stroke="#714852" strokeOpacity=".32" strokeWidth="2" />
        <path d="M0 827 L600 827 M91 775 L509 775 M133 727 L467 727" fill="none" stroke="#f4d8c8" strokeOpacity=".38" strokeWidth="1.5" />

        {/* Soft contact vignette, not a projected beam (reserved for stage 10). */}
        <path d="M0 900 L165 680 H435 L600 900 Z" fill="#6c3c4a" opacity=".1" />
        <path d="M165 680 H435" stroke="#7d5158" strokeOpacity=".35" strokeWidth="4" />
      </svg>
      <div className="absolute inset-0 shadow-[inset_0_0_24px_8px_rgba(68,37,48,.22)]" />
    </div>
  );
}
