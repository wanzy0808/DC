/**
 * Existing bundled audio is shared by all render-ready invitation themes.
 * An event's chosen musicUrl or uploaded AUDIO asset always takes precedence.
 * No template code/audio assets for other themes are pulled in by this registry.
 */
export const invitationDefaultTracks: Record<string, { title: string; file: string }> = {
  "romantic-rose": { title: "Eternal Love", file: "Twisterium - Eternal Love.mp3" },
  "botanical-ivory": { title: "White Petals", file: "Keys Of Moon - White Petals.mp3" },
  "eternal-blossom": { title: "Loving You", file: "Avanti - Loving You (freetouse.com).mp3" },
  "modern-maroon": { title: "Last Promise", file: "Nettson - Last Promise.mp3" },
  "garden-light": { title: "Lucid", file: "Jens East - Lucid (feat. Danny Baldursson).mp3" },
  "midnight-romance": { title: "Lullaby", file: "Purrple Cat - Lullaby.mp3" },
  "classic-pearl": { title: "Until We Meet Again", file: "Arthur Vyncke - Until We Meet Again.mp3" },
  "golden-art-deco": { title: "With You In The Morning", file: "Carl Storm - With You In The Morning.mp3" },
  "paper-cut-botanical": { title: "They Say...", file: "DayFox - They Say....mp3" },
  "celestial-ink": { title: "Fragile", file: "A Himitsu - Fragile.mp3" },
  "zen-atelier": { title: "Jikan Wa Mikata Da", file: "templates/Zen Atelier/audiolibraryinfinite-jikan-wa-mikata-da-314226.mp3" },
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
