/**
 * Existing bundled audio is shared by all render-ready invitation themes.
 * An event's chosen musicUrl or uploaded AUDIO asset always takes precedence.
 * No template code/audio assets for other themes are pulled in by this registry.
 */
export const invitationDefaultTracks: Record<string, { title: string; file: string }> = {
  "romantic-rose": { title: "Eternal Love", file: "assets/audio/twisterium-eternal-love.mp3" },
  "botanical-ivory": { title: "White Petals", file: "assets/audio/keys-of-moon-white-petals.mp3" },
  "eternal-blossom": { title: "Loving You", file: "assets/audio/avanti-loving-you.mp3" },
  "modern-maroon": { title: "Last Promise", file: "assets/audio/nettson-last-promise.mp3" },
  "garden-light": { title: "Lucid", file: "assets/audio/jens-east-lucid.mp3" },
  "midnight-romance": { title: "Lullaby", file: "assets/audio/purrple-cat-lullaby.mp3" },
  "classic-pearl": { title: "Until We Meet Again", file: "assets/audio/arthur-vyncke-until-we-meet-again.mp3" },
  "golden-art-deco": { title: "With You In The Morning", file: "assets/audio/carl-storm-with-you-in-the-morning.mp3" },
  "paper-cut-botanical": { title: "They Say...", file: "assets/audio/dayfox-they-say.mp3" },
  "celestial-ink": { title: "Fragile", file: "assets/audio/a-himitsu-fragile.mp3" },
  "pencil-reverie": { title: "Fragile", file: "assets/audio/a-himitsu-fragile.mp3" },
  "zen-atelier": { title: "Jikan Wa Mikata Da", file: "assets/audio/jikan-wa-mikata-da.mp3" },
  "serein": { title: "Until We Meet Again", file: "assets/audio/arthur-vyncke-until-we-meet-again.mp3" },
};

export function getInvitationDefaultMusic(templateKey: string) {
  const template = templateKey.split("::")[0];
  const track = invitationDefaultTracks[template] ?? invitationDefaultTracks["romantic-rose"];
  return { title: track.title, url: `/${track.file.split("/").map(encodeURIComponent).join("/")}` };
}

export function resolveInvitationMusic(
  templateKey: string,
  musicUrl?: string | null,
  assets?: readonly { type: string; url: string }[],
) {
  return musicUrl?.trim() ||
    assets?.find((asset) => asset.type === "AUDIO" && asset.url.trim())?.url ||
    getInvitationDefaultMusic(templateKey).url;
}
