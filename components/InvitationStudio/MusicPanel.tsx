"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, Upload } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUDIO_MIME_TYPES, MAX_AUDIO_FILES } from "@/lib/invitations/audio-limits";
import { INVITATION_MUSIC_PAUSE_EVENT, INVITATION_MUSIC_PLAY_EVENT } from "@/lib/invitations/music-playback";
import { getInvitationDefaultMusic, invitationMusicLibrary, resolveInvitationMusic } from "@/lib/templates/music";
import type { InvitationDesignerInvitation } from "./designer-types";

type MusicChoice = { url: string; title: string; artist?: string };

export function MusicPanel({
  musicUrl, templateKey, assets, busy, setMusicUrl, onUpload, onDelete,
}: {
  musicUrl: string;
  templateKey: string;
  assets: InvitationDesignerInvitation["assets"];
  busy: boolean;
  setMusicUrl: (value: string) => void;
  onUpload?: (file: File) => void;
  onDelete?: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const id = useId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const playRequest = useRef(0);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<MusicChoice | null>(null);
  const [playingUrl, setPlayingUrl] = useState("");
  const [playFailed, setPlayFailed] = useState(false);
  const uploads = assets.filter((asset) => asset.type === "AUDIO");
  const defaultUrl = getInvitationDefaultMusic(templateKey).url;
  const activeUrl = resolveInvitationMusic(templateKey, musicUrl, assets);
  const activeTrack = invitationMusicLibrary.find((track) => track.url === activeUrl)
    ?? uploads.find((track) => track.url === activeUrl);
  const legacyTrack = activeTrack ? null : { url: activeUrl, title: en ? "Saved Music" : "Musik Tersimpan" };
  const library = invitationMusicLibrary
    .filter((track) => `${track.title} ${track.artist}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    .sort((a, b) => Number(b.url === defaultUrl) - Number(a.url === defaultUrl) || a.title.localeCompare(b.title));
  const full = uploads.length >= MAX_AUDIO_FILES;

  useEffect(() => {
    const audio = audioRef.current;
    const stopOtherPlayer = (event: Event) => {
      const other = (event as CustomEvent<{ player: HTMLAudioElement }>).detail?.player;
      if (other && other !== audio) audio?.pause();
    };
    const pauseWhenHidden = () => { if (document.hidden) audio?.pause(); };
    window.addEventListener(INVITATION_MUSIC_PLAY_EVENT, stopOtherPlayer);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      playRequest.current += 1;
      window.removeEventListener(INVITATION_MUSIC_PLAY_EVENT, stopOtherPlayer);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      audio?.pause();
      // React removes audio event handlers on unmount; release marketing's preview lease explicitly.
      if (audio) window.dispatchEvent(new CustomEvent(INVITATION_MUSIC_PAUSE_EVENT, { detail: { player: audio } }));
    };
  }, []);

  const listen = (track: MusicChoice) => {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++playRequest.current;
    if (audio.getAttribute("src") === track.url && !audio.paused) {
      audio.pause();
      return;
    }
    setPlayFailed(false);
    setPreview(track);
    if (audio.getAttribute("src") !== track.url) {
      audio.pause();
      audio.src = track.url;
    } else if (audio.error) {
      audio.load();
    }
    // Start within the click gesture, without changing the selected/saved song.
    void audio.play().catch(() => {
      if (request === playRequest.current) {
        setPlayingUrl("");
        setPlayFailed(true);
      }
    });
  };

  const choiceRow = (track: MusicChoice, assetId?: string) => (
    <div key={assetId || track.url} className="flex items-center gap-2 border-b border-primary/20 py-3">
      <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
        <input type="radio" name={`${id}-music`} value={track.url} checked={activeUrl === track.url}
          onChange={() => setMusicUrl(track.url)} className="accent-primary" />
        <span className="min-w-0 break-words">
          <span className="block font-medium">{track.title}</span>
          {track.artist && <span className="block text-xs text-muted-foreground">{track.artist}</span>}
          {track.url === defaultUrl && <span className="block text-xs text-primary">{en ? "Theme Default" : "Bawaan Tema"}</span>}
        </span>
      </label>
      <Button size="icon" className="min-h-11 min-w-11" onClick={() => listen(track)}
        aria-label={`${playingUrl === track.url ? (en ? "Pause" : "Jeda") : (en ? "Listen to" : "Dengarkan")} ${track.title}`}
        aria-pressed={playingUrl === track.url}>
        {playingUrl === track.url ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
      </Button>
      {assetId && onDelete && <Button size="sm" className="min-h-11" onClick={() => onDelete(assetId)}
        aria-label={`${en ? "Delete" : "Hapus"} ${track.title}`}>{en ? "Delete" : "Hapus"}</Button>}
    </div>
  );

  return (
    <div>
      <h2 className="font-[family-name:var(--font-undara-heading)] text-lg font-semibold text-primary">{en ? "Music" : "Musik"}</h2>
      <p className="mt-4 text-sm"><span className="text-muted-foreground">{en ? "Active Music: " : "Musik Aktif: "}</span>
        <strong>{activeTrack?.title || legacyTrack?.title || (en ? "Uploaded Music" : "Musik Unggahan")}</strong>
      </p>
      <div className="mt-3 space-y-2">
        {preview && <p className="text-xs text-muted-foreground">{en ? "Listening: " : "Sedang Didengarkan: "}{preview.title}</p>}
        <audio ref={audioRef} controls preload="none" className="h-11 w-full"
          aria-label={en ? "Music preview" : "Dengarkan musik"}
          onPlay={(event) => {
            setPlayFailed(false);
            setPlayingUrl(event.currentTarget.getAttribute("src") || "");
            window.dispatchEvent(new CustomEvent(INVITATION_MUSIC_PLAY_EVENT, { detail: { player: event.currentTarget } }));
          }}
          onPause={(event) => {
            setPlayingUrl("");
            window.dispatchEvent(new CustomEvent(INVITATION_MUSIC_PAUSE_EVENT, { detail: { player: event.currentTarget } }));
          }}
          onEnded={(event) => {
            setPlayingUrl("");
            window.dispatchEvent(new CustomEvent(INVITATION_MUSIC_PAUSE_EVENT, { detail: { player: event.currentTarget } }));
          }}
          onError={() => { setPlayingUrl(""); setPlayFailed(true); }} />
        {playFailed && <p role="alert" className="text-sm text-destructive">{en ? "Could not play this song. Try again." : "Lagu belum dapat diputar. Coba lagi."}</p>}
      </div>
      <fieldset disabled={busy} className="mt-5 min-w-0 space-y-5 border-0 p-0">
        <legend className="sr-only">{en ? "Choose music" : "Pilih musik"}</legend>
        {legacyTrack && choiceRow(legacyTrack)}
        <section aria-labelledby={`${id}-library`}>
          <h3 id={`${id}-library`} className="text-sm font-semibold text-primary">{en ? "Undara Collection" : "Koleksi Undara"}</h3>
          <label htmlFor={`${id}-search`} className="sr-only">{en ? "Search songs or artists" : "Cari lagu atau artis"}</label>
          <Input id={`${id}-search`} type="search" value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder={en ? "Search songs or artists" : "Cari lagu atau artis"} className="mt-3" />
          {library.map((track) => choiceRow(track))}
          {!library.length && <p role="status" className="mt-3 text-sm text-muted-foreground">{en ? "No songs found." : "Lagu tidak ditemukan."}</p>}
        </section>
        {(onUpload || uploads.length > 0) && <section aria-labelledby={`${id}-uploads`}>
          <h3 id={`${id}-uploads`} className="text-sm font-semibold text-primary">{en ? "Uploads" : "Unggahan"}</h3>
          {uploads.map((track) => choiceRow({ ...track, title: track.title || (en ? "Uploaded Music" : "Musik Unggahan") }, track.id))}
          {onUpload && <>
            <p className="my-3 text-xs text-muted-foreground">{uploads.length}/{MAX_AUDIO_FILES} {en ? "files" : "file"} · 3 MB/file</p>
            <label aria-disabled={full || busy} className={buttonVariants({ size: "sm", className: `flex min-h-11 w-full cursor-pointer px-3 py-3 ${full || busy ? "pointer-events-none opacity-50" : ""}` })}>
              <Upload className="size-4" aria-hidden="true" /> {busy ? (en ? "Processing…" : "Memproses…") : (en ? "Upload Music" : "Unggah Musik")}
              <input type="file" accept={AUDIO_MIME_TYPES.join(",")} disabled={full || busy} className="sr-only"
                onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} />
            </label>
          </>}
        </section>}
      </fieldset>
    </div>
  );
}
