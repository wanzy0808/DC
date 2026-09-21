import Link from "next/link";
import ReferenceDoorPreview from "@/components/Landing/Pintu/ReferenceDoorPreview";

export const metadata = {
  title: "Pintu 1 · Rebuild 3D | DC Organizer",
  description: "Perbandingan referensi Pintu 1 dan model geometri Three.js dengan finishing, ornamen dan foyer ber-volume.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-4 overflow-visible py-5 text-foreground sm:w-[80vw] sm:py-7">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.08em] text-foreground/85">
          Rebuild Pintu 1 · Uji kamera masuk
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl text-foreground sm:text-3xl">
          Dari referensi menjadi pintu 3D
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/85 sm:text-base">
          Bandingkan bentuk mahkota, kusen, panel dan material pada skala yang setara.
          Coba bukaan dan sudut samping untuk menilai ketebalan serta gerak daun.
        </p>
      </div>
      <ReferenceDoorPreview />
      <Link className="text-sm underline underline-offset-4" href="/pintu-lab/orbital">
        Uji tiga pintu 3D mengorbit dan masuk ke halaman layanan
      </Link>
    </main>
  );
}
