export type WeddingChildKind = "anak" | "putra" | "putri";
export type WeddingChildPosition = "ELDEST" | "YOUNGEST" | "NUMBER";

const childOrderWords: Record<number, string> = {
  1: "pertama", 2: "kedua", 3: "ketiga", 4: "keempat", 5: "kelima",
  6: "keenam", 7: "ketujuh", 8: "kedelapan", 9: "kesembilan", 10: "kesepuluh",
};

/** Title Case on visible invitation copy only; never rewrite customer names in storage. */
export function invitationTitleCase(value: string) {
  return value.replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (_, boundary: string, first: string) =>
    boundary + first.toLocaleUpperCase("id-ID"),
  );
}

export function isWeddingChildPosition(value: unknown): value is WeddingChildPosition {
  return value === "ELDEST" || value === "YOUNGEST" || value === "NUMBER";
}

function childOrderLabel(childOrder?: number | null, position?: string | null) {
  if (position === "ELDEST") return "sulung";
  if (position === "YOUNGEST") return "bungsu";
  if (!childOrder || childOrder <= 0) return "";
  return childOrderWords[childOrder] || `ke-${childOrder}`;
}

export function weddingParentLine(
  fatherName?: string | null,
  motherName?: string | null,
  childOrder?: number | null,
  childKind: WeddingChildKind = "anak",
  position?: string | null,
) {
  const parents = [
    fatherName?.trim() ? `Bapak ${fatherName.trim()}` : "",
    motherName?.trim() ? `Ibu ${motherName.trim()}` : "",
  ].filter(Boolean);

  if (!parents.length) return "";

  const subject =
    childKind === "putra" ? "Putra" : childKind === "putri" ? "Putri" : "Anak";
  const order = childOrderLabel(childOrder, position);
  return invitationTitleCase(`${subject}${order ? ` ${order}` : ""} dari ${parents.join(" & ")}`);
}
