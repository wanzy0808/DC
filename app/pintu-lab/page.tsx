import ReferenceDoorPreview from "@/components/Landing/Pintu/ReferenceDoorPreview";

export const metadata = {
  title: "Pintu 1 · Rebuild 3D | DC Organizer",
  description: "Perbandingan referensi Pintu 1 dan model geometri Three.js dengan finishing, ornamen dan foyer ber-volume.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-5 overflow-visible py-6 text-foreground sm:w-[80vw] sm:py-8">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.12em] text-foreground/60">
          Rebuild Pintu 1 · Uji kamera masuk
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl text-primary sm:text-4xl">
          Dari referensi menjadi pintu 3D
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/70 sm:text-base">
          Bandingkan dengan pintu1.png: warna satin Rose, relief yang mengikuti daun,
          ornamen kusen tetap, ruang ber-volume dan cahaya dari bukaan. Periksa dari tiga sudut,
          lalu uji kamera masuk dan kembali melewati kusen di lab tanpa berpindah route.
        </p>
      </div>
      <ReferenceDoorPreview />
    </main>
  );
}
