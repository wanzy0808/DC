import InvitationLayerTextContent from "@/components/PublicInvitation/InvitationLayerTextContent";
import type { EditableCopyMotionUnit } from "@/lib/templates/editable-copy-motion";

/**
 * A couple's own words, not fabricated template copy or duplicate event data.
 * Rendered within the existing Identity/Host capability (no 16th visibility flag).
 * All live Studio and guest renderers share this component and saved design text.
 */
export default function OurStorySection({
  story,
  theme,
  preview = false,
  motionUnit,
}: {
  story?: string | null;
  theme: string;
  preview?: boolean;
  motionUnit?: EditableCopyMotionUnit;
}) {
  if (!story?.trim() && !preview) return null;

  const rose = theme === "romantic-rose";
  const zen = theme === "zen-atelier";
  const pencil = theme === "pencil-reverie";
  const left = theme === "modern-maroon" || theme === "golden-art-deco";
  const storyText = story?.trim() || (preview ? "Klik untuk menulis Our Story" : "");
  return (
    <section
      data-invitation-section="our-story"
      aria-labelledby="invitation-our-story-heading"
      className={`relative overflow-hidden px-7 py-16 sm:px-10 ${pencil ? "pr-our-story" : ""} ${rose
        ? "bg-[#f8eef0] text-[#765460]"
        : zen
          ? "zen-section"
          : "text-[var(--inv-scene-surface-ink,var(--inv-ink))]"}`}
      style={rose ? undefined : { backgroundColor: "var(--inv-surface)" }}
    >
      <div className={`relative mx-auto max-w-md ${left || pencil ? "text-left" : "text-center"}`}>
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
          className={`my-6 block h-px w-12 ${left || pencil ? "" : "mx-auto"} ${rose ? "bg-[#bf8496]" : "bg-[var(--inv-accent)]"}`}
        />
        <p data-studio-copy-field="ourStory" className="whitespace-pre-line break-words text-sm leading-8"><InvitationLayerTextContent text={storyText} unit={motionUnit} /></p>
      </div>
    </section>
  );
}
