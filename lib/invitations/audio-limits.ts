export const MAX_AUDIO_FILES = 2;
export const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
export const AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/x-m4a"];

export function audioUploadError(file: { size: number; type: string }, count: number): string | null {
  if (!AUDIO_MIME_TYPES.includes(file.type) || file.size === 0) return "Gunakan file MP3, WAV, OGG, AAC, atau M4A yang tidak kosong.";
  if (file.size > MAX_AUDIO_BYTES) return "Ukuran musik maksimal 3 MB per file.";
  if (count >= MAX_AUDIO_FILES) return "Maksimal 2 musik per undangan. Hapus salah satu untuk menggantinya.";
  return null;
}
