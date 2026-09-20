import ReferenceDoorPreview from "@/components/Landing/Pintu/ReferenceDoorPreview";

export const metadata = {
  title: "Pintu 1 · Rebuild 3D | DC Organizer",
  description: "Perbandingan referensi Pintu 1 dan model geometri Three.js tahap pertama.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[80vw] max-w-full flex-col items-center gap-5 overflow-visible py-8 text-foreground">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.12em] text-foreground/60">
          Rebuild Pintu 1 · Tahap awal
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl text-primary sm:text-4xl">
          Dari referensi menjadi pintu 3D
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/70 sm:text-base">
          Acuan visual tetap pintu1.png. Kita bangun volumenya dahulu, lalu menyempurnakan
          kusen, mahkota, ukiran, dan material secara bertahap tanpa mengganti desain asli.
        </p>
      </div>
      <ReferenceDoorPreview />
    </main>
  );
}
