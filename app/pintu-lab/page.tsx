import Link from "next/link";
import AssetDoorPreview from "@/components/Landing/Pintu/AssetDoorPreview";

export const metadata = {
  title: "Pintu 1 · Model GLB | DC Organizer",
  description: "Pratinjau asset GLB dengan material Rose–ivory, bayangan, serta cahaya lembut di bawah kaki pintu.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-4 overflow-visible py-5 text-foreground sm:w-[80vw] sm:py-7">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.08em] text-foreground/85">
          Pintu 1 · Asset GLB
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-2xl text-foreground sm:text-3xl">
          Pintu 3D dari model asli
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/85 sm:text-base">
          Cek warna Rose, detail ukiran, dan pencahayaan lembut di bawah kaki pintu.
          Model belum dipisah untuk animasi buka-tutup.
        </p>
      </div>
      <AssetDoorPreview />
      <Link className="text-sm underline underline-offset-4" href="/pintu-lab/orbital">
        Lihat eksperimen tiga pintu sebelumnya
      </Link>
    </main>
  );
}
