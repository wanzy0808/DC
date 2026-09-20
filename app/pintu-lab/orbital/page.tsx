import Link from "next/link";
import ReferenceDoorOrbitalPreview from "@/components/Landing/Pintu/ReferenceDoorOrbitalPreview";

export const metadata = {
  title: "Uji Tiga Pintu 3D | DC Organizer",
  description: "Pratinjau tiga pintu Three.js mengorbit dalam satu scene dan membuka halaman layanan.",
};

export default function OrbitalLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-6 py-7 text-foreground sm:w-[80vw]">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs text-foreground/60">
          Eksperimen terpisah · landing utama belum berubah
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl text-primary sm:text-4xl">
          Tiga pintu, satu ruang 3D
        </h1>
        <p className="mt-3 text-sm leading-7 text-foreground/75">
          Pilih pintu, buka, dan masuk ke halaman layanan yang sebenarnya.
          Bentuk dan relief masih perlu dibandingkan dengan gambar referensi.
        </p>
      </div>
      <ReferenceDoorOrbitalPreview />
      <Link className="text-sm underline underline-offset-4" href="/pintu-lab">
        Lihat detail dan referensi Pintu 1
      </Link>
    </main>
  );
}
