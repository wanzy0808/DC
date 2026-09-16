"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const getSearch = () => window.location.search;
const getServerSearch = () => null;

/** Null during SSR/hydration; browser query values are an external snapshot. */
export function useBrowserSearch() {
  return useSyncExternalStore(subscribe, getSearch, getServerSearch);
}
