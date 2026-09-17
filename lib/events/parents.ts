export function weddingParentLine(
  fatherName?: string | null,
  motherName?: string | null,
) {
  const parents = [
    fatherName?.trim() ? `Bapak ${fatherName.trim()}` : "",
    motherName?.trim() ? `Ibu ${motherName.trim()}` : "",
  ].filter(Boolean);

  return parents.length ? `Anak dari ${parents.join(" & ")}` : "";
}
