export type WeddingChildKind = "anak" | "putra" | "putri";

const childOrderWords: Record<number, string> = {
  1: "pertama",
  2: "kedua",
  3: "ketiga",
  4: "keempat",
  5: "kelima",
  6: "keenam",
  7: "ketujuh",
  8: "kedelapan",
  9: "kesembilan",
  10: "kesepuluh",
};

function childOrderLabel(childOrder?: number | null) {
  if (!childOrder || childOrder <= 0) return "";
  return childOrderWords[childOrder] || `ke-${childOrder}`;
}

export function weddingParentLine(
  fatherName?: string | null,
  motherName?: string | null,
  childOrder?: number | null,
  childKind: WeddingChildKind = "anak",
) {
  const parents = [
    fatherName?.trim() ? `Bapak ${fatherName.trim()}` : "",
    motherName?.trim() ? `Ibu ${motherName.trim()}` : "",
  ].filter(Boolean);

  if (!parents.length) return "";

  const subject =
    childKind === "putra" ? "Putra" : childKind === "putri" ? "Putri" : "Anak";
  const order = childOrderLabel(childOrder);
  return `${subject}${order ? ` ${order}` : ""} dari ${parents.join(" & ")}`;
}
