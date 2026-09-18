"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/Theme/ThemeContext";

type DoorValue = 1 | 2 | 3 | null;

const reflectionX: Record<1 | 2 | 3, number> = {
  1: 925,
  2: 1160,
  3: 1380,
};

export default function LandingRoomScene({ activeDoor }: { activeDoor: DoorValue }) {
  const { isDarkMode } = useTheme();
  const reduced = useReducedMotion();
  const selected = activeDoor ?? 2;
  const activeX = reflectionX[selected];

  const wall = isDarkMode ? "#100E10" : "#F6F0ED";
  const wallSoft = isDarkMode ? "#181317" : "#FFFDFC";
  const line = isDarkMode ? "rgba(217,163,170,.18)" : "rgba(166,94,105,.14)";
  const floor = isDarkMode ? "#0A090B" : "#EEE6E3";
  const floor2 = isDarkMode ? "#171216" : "#FFFDFC";
  const window = isDarkMode ? "#2B1720" : "#E7F2F8";
  const windowGlow = isDarkMode ? "#C07A84" : "#E8BEC5";
  const botanical = isDarkMode ? "rgba(217,163,170,.48)" : "rgba(166,94,105,.38)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="stage2-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={wallSoft} />
            <stop offset="0.48" stopColor={wall} />
            <stop offset="1" stopColor={isDarkMode ? "#09090A" : "#EDE3E0"} />
          </linearGradient>
          <linearGradient id="stage2-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={floor2} />
            <stop offset=".58" stopColor={isDarkMode ? "#100D10" : "#F7F1EF"} />
            <stop offset="1" stopColor={floor} />
          </linearGradient>
          <radialGradient id="stage2-roseGlow" cx="68%" cy="42%" r="45%">
            <stop offset="0" stopColor={windowGlow} stopOpacity={isDarkMode ? ".28" : ".24"} />
            <stop offset=".52" stopColor="#C07A84" stopOpacity={isDarkMode ? ".09" : ".065"} />
            <stop offset="1" stopColor="#C07A84" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="stage2-windowPane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={isDarkMode ? "#513043" : "#DBEDF6"} />
            <stop offset=".46" stopColor={window} />
            <stop offset=".72" stopColor={isDarkMode ? "#2C1721" : "#E8DDE0"} />
            <stop offset="1" stopColor={isDarkMode ? "#171117" : "#F1E4E3"} />
          </linearGradient>
          <linearGradient id="stage2-beam" x1="0" y1="0" x2="1" y2=".65">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={isDarkMode ? ".055" : ".34"} />
            <stop offset=".48" stopColor="#D9A3AA" stopOpacity={isDarkMode ? ".13" : ".11"} />
            <stop offset="1" stopColor="#C07A84" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stage2-marbleShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={isDarkMode ? ".02" : ".32"} />
            <stop offset=".48" stopColor="#D9A3AA" stopOpacity={isDarkMode ? ".06" : ".09"} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={isDarkMode ? ".015" : ".23"} />
          </linearGradient>
          <linearGradient id="stage2-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C07A84" stopOpacity={isDarkMode ? ".22" : ".17"} />
            <stop offset=".62" stopColor="#C07A84" stopOpacity=".035" />
            <stop offset="1" stopColor="#C07A84" stopOpacity="0" />
          </linearGradient>
          <filter id="stage2-blur24">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="stage2-blur9">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="url(#stage2-wall)" />

        {/* editorial wall, kept calm for readable copy */}
        <path d="M0 0H575V900H0Z" fill={isDarkMode ? "#0D0C0E" : "#FFFEFD"} fillOpacity={isDarkMode ? ".96" : ".93"} />
        <path d="M575 0V900" stroke={line} strokeWidth="2" />

        {/* architectural trim around editorial panel */}
        <path d="M36 86H530M36 116H454" stroke={line} strokeWidth="1.3" />
        <path d="M36 690H526" stroke={line} strokeWidth="1.2" />
        <path d="M526 88V690" stroke={line} strokeWidth="1.2" />

        {/* tall city window */}
        <path
          d="M598 655V218C598 104 664 40 743 40C822 40 888 104 888 218V655Z"
          fill="url(#stage2-windowPane)"
          stroke={line}
          strokeWidth="3"
        />
        <path d="M743 44V655" stroke={isDarkMode ? "rgba(255,255,255,.085)" : "rgba(17,17,17,.085)"} strokeWidth="3" />
        <path d="M604 292H882M604 446H882" stroke={isDarkMode ? "rgba(255,255,255,.065)" : "rgba(17,17,17,.075)"} strokeWidth="3" />

        {/* distant skyline for actual depth, intentionally abstract */}
        <g opacity={isDarkMode ? ".55" : ".34"}>
          <path d="M616 610V518H641V610M648 610V545H668V610M676 610V493H704V610M711 610V532H729V610M753 610V505H778V610M784 610V554H807V610M814 610V475H842V610M850 610V530H873V610" fill={isDarkMode ? "#0A080B" : "#9AA6AD"} />
          <path d="M616 497H873" stroke="#C07A84" strokeOpacity={isDarkMode ? ".13" : ".08"} />
        </g>

        {/* monumental portal arch behind interactive doors */}
        <path
          d="M760 660V250C760 74 895 0 1115 0C1335 0 1470 74 1470 250V660"
          fill="none"
          stroke={isDarkMode ? "rgba(217,163,170,.13)" : "rgba(166,94,105,.13)"}
          strokeWidth="30"
        />
        <path
          d="M790 660V266C790 115 910 44 1115 44C1320 44 1440 115 1440 266V660"
          fill="none"
          stroke={isDarkMode ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.78)"}
          strokeWidth="5"
        />
        <path
          d="M817 660V283C817 148 926 75 1115 75C1304 75 1413 148 1413 283V660"
          fill="none"
          stroke={line}
          strokeWidth="1.2"
        />

        {/* wall moulding/panels */}
        <path d="M930 92V640M1360 92V640" stroke={line} strokeWidth="2" />
        <path d="M900 122H1390" stroke={line} strokeWidth="2" />
        <path d="M915 146H1375V625H915Z" fill="none" stroke={line} strokeWidth="1" opacity=".7" />

        {/* light beam and cast-window shadow */}
        <path d="M915 55L1300 0L1515 505L1155 445Z" fill="url(#stage2-beam)" />
        <path d="M995 30L1030 30L1260 475L1226 475Z" fill={isDarkMode ? "rgba(192,122,132,.04)" : "rgba(17,17,17,.04)"} />
        <path d="M1088 10L1127 10L1360 448L1321 448Z" fill={isDarkMode ? "rgba(192,122,132,.035)" : "rgba(17,17,17,.034)"} />
        <path d="M1180 0L1219 0L1450 422L1413 422Z" fill={isDarkMode ? "rgba(192,122,132,.03)" : "rgba(17,17,17,.028)"} />

        {/* floor */}
        <path d="M0 662H1600V900H0Z" fill="url(#stage2-floor)" />
        <path d="M0 662H1600" stroke={line} strokeWidth="2" />
        <path d="M575 900L930 662M910 900L1082 662M1250 900L1240 662M1540 900L1398 662" stroke={line} strokeWidth="1.4" />
        <path d="M0 750H1600M0 835H1600" stroke={line} strokeWidth="1.1" />
        <path d="M0 690C250 710 420 678 610 700C830 725 1030 684 1260 705C1410 720 1510 704 1600 694" fill="none" stroke={isDarkMode ? "rgba(255,255,255,.035)" : "rgba(112,86,91,.09)"} />
        <path d="M0 798C280 770 530 832 760 794C980 759 1240 824 1600 786" fill="none" stroke={isDarkMode ? "rgba(217,163,170,.05)" : "rgba(166,94,105,.1)"} />
        <path d="M0 662H1600V900H0Z" fill="url(#stage2-marbleShine)" opacity={isDarkMode ? ".38" : ".46"} />

        {/* portal reflections; dim silhouettes give the floor physical continuity */}
        <g opacity={isDarkMode ? ".28" : ".2"} filter="url(#stage2-blur9)">
          <path d="M838 679H1007L989 866H860Z" fill="url(#stage2-reflect)" />
          <path d="M1052 670H1264L1238 894H1080Z" fill="url(#stage2-reflect)" />
          <path d="M1293 679H1462L1439 866H1316Z" fill="url(#stage2-reflect)" />
        </g>

        {/* left lounge silhouette: gives foreground depth without becoming event-category imagery */}
        <path d="M0 760C90 715 255 710 390 745C440 758 470 790 458 842H0Z" fill={isDarkMode ? "#090809" : "#EAE0DE"} opacity={isDarkMode ? ".88" : ".94"} />
        <ellipse cx="298" cy="775" rx="145" ry="33" fill={isDarkMode ? "#171216" : "#F5EFED"} />
        <path d="M392 765H510L488 805H412Z" fill={isDarkMode ? "#151116" : "#EFE6E3"} />
        <path d="M433 805V865M473 805V865" stroke={line} strokeWidth="4" />

        {/* sculptural pedestal on far right */}
        <path d="M1484 560H1564V675H1484Z" fill={isDarkMode ? "#171216" : "#EFE7E4"} stroke={line} />
        <ellipse cx="1524" cy="554" rx="40" ry="10" fill={isDarkMode ? "#211821" : "#F8F2F0"} />
        <circle cx="1524" cy="510" r="29" fill={isDarkMode ? "#2A1C26" : "#F6EEEC"} stroke={line} />
        <path d="M1505 511C1512 494 1536 489 1546 507C1534 502 1527 516 1518 522C1514 517 1511 514 1505 511Z" fill={isDarkMode ? "#5B3547" : "#D8AFB5"} opacity=".58" />

        {/* abstract botanical branches at room edges; restrained and category-neutral */}
        <g fill="none" stroke={botanical} strokeWidth="2" strokeLinecap="round">
          <path d="M548 675C568 610 570 557 605 508C625 480 644 458 655 423" />
          <path d="M572 603C541 573 535 548 529 522M590 566C618 541 625 515 629 486M603 530C576 500 575 475 579 450" />
          <path d="M1488 685C1464 620 1462 575 1435 529C1415 494 1392 476 1380 443" />
          <path d="M1467 616C1494 587 1501 560 1505 535M1451 580C1428 554 1418 532 1415 505M1437 548C1464 520 1466 499 1462 474" />
        </g>
        <g fill={botanical}>
          <ellipse cx="531" cy="522" rx="10" ry="4" transform="rotate(35 531 522)" />
          <ellipse cx="579" cy="451" rx="10" ry="4" transform="rotate(-22 579 451)" />
          <ellipse cx="628" cy="486" rx="11" ry="4" transform="rotate(-35 628 486)" />
          <ellipse cx="1505" cy="535" rx="10" ry="4" transform="rotate(-30 1505 535)" />
          <ellipse cx="1415" cy="505" rx="10" ry="4" transform="rotate(30 1415 505)" />
          <ellipse cx="1462" cy="474" rx="11" ry="4" transform="rotate(25 1462 474)" />
        </g>

        {/* base atmospheric rose wash */}
        <ellipse cx="1160" cy="720" rx="430" ry="88" fill="#C07A84" fillOpacity={isDarkMode ? ".075" : ".05"} filter="url(#stage2-blur24)" />
        <rect width="1600" height="900" fill="url(#stage2-roseGlow)" />
      </svg>

      {/* active-door floor light reacts immediately but remains intentionally subtle */}
      <motion.div
        initial={false}
        animate={{
          left: `calc(${(activeX / 1600) * 100}% - 9%)`,
          opacity: isDarkMode ? 0.34 : 0.24,
        }}
        transition={{ duration: reduced ? 0.08 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[5%] h-[12%] w-[18%] rounded-[50%] bg-primary blur-3xl"
      />

      <motion.div
        animate={
          reduced
            ? undefined
            : { opacity: [0.44, 0.68, 0.44], x: [0, -9, 0] }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[1%] top-[7%] h-[64%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(192,122,132,.13),transparent_66%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(192,122,132,.18),transparent_67%)]"
      />

      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(to_top,rgba(192,122,132,.04),transparent)] dark:bg-[linear-gradient(to_top,rgba(192,122,132,.07),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(255,255,255,.22),transparent_22%)] opacity-40 dark:opacity-10" />
    </div>
  );
}
