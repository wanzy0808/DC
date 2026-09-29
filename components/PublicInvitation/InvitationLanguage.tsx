"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { InvitationLanguage } from "@/lib/invitations/language";

const Context = createContext<InvitationLanguage>("ID");

export function InvitationLanguageProvider({ language, children }: { language: InvitationLanguage; children: ReactNode }) {
  return <Context.Provider value={language}>{children}</Context.Provider>;
}

export function useInvitationLanguage() {
  return useContext(Context);
}
