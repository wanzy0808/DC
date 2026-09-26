export const MAX_AUDIO_FILES = 2;
export const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
export const AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/x-m4a"];

export function audioUploadError(file: { size: number; type: string }, count: number): string | null {
  if (!AUDIO_MIME_TYPES.includes(file.type) || file.size === 0) return "Gunakan file MP3, WAV, OGG, AAC, atau M4A yang tidak kosong.";
  if (file.size > MAX_AUDIO_BYTES) return "Ukuran musik maksimal 3 MB per file.";
  if (count >= MAX_AUDIO_FILES) return "Maksimal 2 musik per undangan. Hapus salah satu untuk menggantinya.";
  return null;
}

/** Check the container/header bytes, not the browser-supplied MIME label alone. */
export function hasAudioSignature(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) return false;
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (mime === "audio/mpeg" || mime === "audio/mp3") {
    return ascii(0, 3) === "ID3"
      || (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0 && (bytes[1]! & 0x06) !== 0);
  }
  if (mime === "audio/wav") return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE";
  if (mime === "audio/ogg") return ascii(0, 4) === "OggS";
  if (mime === "audio/aac") return bytes[0] === 0xff && (bytes[1]! & 0xf6) === 0xf0;
  if (mime === "audio/mp4" || mime === "audio/x-m4a") {
    return ascii(4, 8) === "ftyp" && ["M4A ", "M4B ", "isom", "iso2", "mp41", "mp42"].includes(ascii(8, 12));
  }
  return false;
}
