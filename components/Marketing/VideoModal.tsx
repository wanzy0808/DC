"use client";

export default function VideoModal({ url, onClose }: { url: string | null; onClose: () => void }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Video portfolio">
      <button type="button" onClick={onClose} className="absolute inset-0 cursor-default" aria-label="Tutup video" />
      <div className="relative z-10 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white hover:text-black" aria-label="Tutup">✕</button>
        <iframe src={url} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen title="Wedding portfolio video" />
      </div>
    </div>
  );
}
