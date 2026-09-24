/**
 * A couple's own words, not fabricated template copy or duplicate event data.
 * Rendered within the existing Identity/Host capability (no 16th visibility flag).
 * All live Studio and guest renderers share this component and saved design text.
 */
export default function OurStorySection({
  story,
  theme,
}: {
  story?: string | null;
  theme: string;
}) {
  if (!story?.trim()) return null;

  const rose = theme === "romantic-rose";
  const zen = theme === "zen-atelier";
  const left = theme === "modern-maroon" || theme === "golden-art-deco";
  return (
    <section
      data-invitation-section="our-story"
      aria-labelledby="invitation-our-story-heading"
      className={`relative overflow-hidden px-7 py-16 sm:px-10 ${rose
        ? "bg-[#f8eef0] text-[#765460]"
        : zen
          ? "zen-section"
          : "text-[var(--inv-scene-surface-ink,var(--inv-ink))]"}`}
      style={rose ? undefined : { backgroundColor: "var(--inv-surface)" }}
    >
      <div className={`relative mx-auto max-w-md ${left ? "text-left" : "text-center"}`}>
        <p className={`text-[10px] uppercase tracking-[.24em] ${rose ? "text-[#a65e69]" : "text-[var(--inv-accent)]"}`}>
          Our Story
        </p>
        <h2
          id="invitation-our-story-heading"
          className={`mt-3 text-2xl leading-snug ${rose ? "text-[#713b50]" : ""}`}
          style={{ fontFamily: "var(--inv-heading, var(--font-dc-heading))" }}
        >
          Tentang Kami
        </h2>
        <span
          aria-hidden="true"
          className={`my-6 block h-px w-12 ${left ? "" : "mx-auto"} ${rose ? "bg-[#bf8496]" : "bg-[var(--inv-accent)]"}`}
        />
        <p className="whitespace-pre-line break-words text-sm leading-8">{story.trim()}</p>
      </div>
    </section>
  );
}
