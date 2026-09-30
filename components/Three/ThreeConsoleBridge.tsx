"use client";

import { getConsoleFunction, setConsoleFunction } from "three";

const R3F_CLOCK_DEPRECATION = "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.";
let installed = false;

/**
 * R3F 9.x still creates THREE.Clock internally while Three r183+ warns that
 * Clock is deprecated. Suppress only that known upstream warning; preserve
 * every other Three log/warning/error so real rendering problems stay visible.
 *
 * Remove this bridge when React Three Fiber no longer instantiates Clock.
 */
function installThreeConsoleBridge() {
  if (installed || typeof window === "undefined") return;

  const previous = getConsoleFunction();

  setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && message === R3F_CLOCK_DEPRECATION) return;

    if (previous) {
      previous(type, message, ...params);
      return;
    }

    const logger = type === "error" ? console.error : type === "warn" ? console.warn : console.log;
    logger(message, ...params);
  });

  installed = true;
}

export default function ThreeConsoleBridge() {
  installThreeConsoleBridge();
  return null;
}
