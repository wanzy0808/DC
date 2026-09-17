export function weddingParentLine(
  fatherName?: string | null,
  motherName?: string | null,
  childOrder?: number | null,
) {
  const parents = [
    fatherName?.trim() ? `Bapak ${fatherName.trim()}` : "",
    motherName?.trim() ? `Ibu ${motherName.trim()}` : "",
  ].filter(Boolean);

  if (!parents.length) return "";
  const childLabel = childOrder && childOrder > 0 ? `Anak ke-${childOrder}` : "Anak";
  return `${childLabel} dari ${parents.join(" & ")}`;
}
