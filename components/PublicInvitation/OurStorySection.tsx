import InvitationLayerTextContent from "@/components/PublicInvitation/InvitationLayerTextContent";
import type { EditableCopyMotionUnit } from "@/lib/templates/editable-copy-motion";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

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
  const language = useInvitationLanguage();
  if (!story?.trim() && !preview) return null;

  const rose = theme === "romantic-rose";
  const zen = theme === "zen-atelier";
  const pencil = theme === "pencil-reverie";
  const left = theme === "modern-maroon" || theme === "golden-art-deco";
  const storyText = story?.trim() || (preview ? invitationText(language, "Our Story belum diisi") : "");
  return (
    <section
      data-invitation-subsection="our-story"
      aria-labelledby="invitation-our-story-heading"
      className={`relative overflow-hidden px-7 sm:px-10 ${pencil ? "pr-our-story" : ""} ${rose
        ? "bg-[#fffaf6] py-24 text-[#6f5057]"
        : zen
          ? "zen-section py-16"
          : "py-16 text-[var(--inv-scene-surface-ink,var(--inv-ink))]"}`}
      style={rose ? undefined : { backgroundColor: "var(--inv-surface)" }}
    >
      <div className={`relative mx-auto max-w-md ${left || pencil || rose ? "text-left" : "text-center"}`}>
        <p data-studio-native-object="object:identity:our-story-kicker" className={rose ? "sr-only" : "text-[10px] uppercase tracking-[.24em] text-[var(--inv-accent)]"}>
          {invitationText(language, "Our Story")}
        </p>
        <h2
          id="invitation-our-story-heading"
          data-studio-native-object="object:identity:our-story-heading"
          className={`leading-[1.08] ${rose ? "max-w-[15ch] font-[family-name:var(--rr-display)] text-[clamp(1.9rem,7vw,3rem)] tracking-[-0.025em] text-[#552d3a]" : "mt-3 text-2xl"}`}
          style={rose ? undefined : { fontFamily: "var(--inv-heading, var(--font-undara-heading))" }}
        >
          {invitationText(language, "Tentang Kami")}
        </h2>
        <span
          aria-hidden="true"
          data-studio-native-object="object:identity:our-story-divider"
          className={`my-6 block h-px ${rose ? "w-20 bg-[#a96b78]/55" : `w-12 ${left || pencil ? "" : "mx-auto"} bg-[var(--inv-accent)]`}`}
        />
        <p data-studio-copy-field="ourStory" className={`whitespace-pre-line break-words text-sm leading-8 ${rose ? "ml-auto max-w-[28rem] border-l border-[#c9a98d]/65 pl-6" : ""}`}><InvitationLayerTextContent text={storyText} unit={motionUnit} /></p>
      </div>
    </section>
  );
}
