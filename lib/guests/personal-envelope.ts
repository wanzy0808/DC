import { displayTitleCase } from "@/lib/text/display-title-case";
import type { PersonalInvitationLanguage, RecipientType } from "@/lib/guests/personal-profile";

export type PersonalEnvelopeGuest = {
  name: string;
  personalAddressee?: string | null;
  recipientType?: RecipientType;
  personalEnvelopeEnabled?: boolean;
  personalLanguage?: PersonalInvitationLanguage;
};

const honorificPrefix = /^(?:bapak|pak|ibu|bu|mr|mrs|ms)\.?\s+/iu;

function cleanPersonalName(value: string) {
  return displayTitleCase(value.replace(honorificPrefix, "").trim());
}

function coupleNames(value: string) {
  const parts = value
    .split(/\s*(?:&|\/|\bdan\b|\band\b)\s*/iu)
    .map((part) => cleanPersonalName(part))
    .filter(Boolean);
  return parts.length === 2 ? parts : [];
}

/** Render-only addressee. Stored Guest names are never rewritten. */
export function formatPersonalEnvelopeAddress(guest: PersonalEnvelopeGuest) {
  if (guest.personalEnvelopeEnabled === false) return "";
  const raw = (guest.personalAddressee || guest.name || "").trim();
  if (!raw) return "";

  const language: PersonalInvitationLanguage = guest.personalLanguage === "EN" ? "EN" : "ID";
  if (guest.recipientType === "COUPLE") {
    const pair = coupleNames(raw);
    if (pair.length === 2) {
      return language === "EN"
        ? `Dear : Mr ${pair[0]} and Mrs ${pair[1]}`
        : `Kepada Yth : Bapak ${pair[0]} dan Ibu ${pair[1]}`;
    }
  }

  const addressee = displayTitleCase(raw);
  return language === "EN" ? `Dear : ${addressee}` : `Kepada Yth : ${addressee}`;
}
