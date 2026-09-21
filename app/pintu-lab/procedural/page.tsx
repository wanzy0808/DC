import Link from "next/link";
import ReferenceDoorPreview from "@/components/Landing/Pintu/ReferenceDoorPreview";

export const metadata = {
  title: "Pintu 1 · Model Procedural Lama | DC Organizer",
  description: "Arsip eksperimen mesh procedural Pintu 1, terpisah dari model GLB terbaru.",
};

export default function ProceduralPintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-4 py-6 text-foreground sm:w-[80vw]">
      <div className="max-w-2xl text-center">
        <h1 className="font-[family-name:var(--font-dc-heading)] text-2xl text-foreground sm:text-3xl">Model procedural sebelumnya</h1>
        <p className="mt-2 text-sm leading-6 text-foreground/75">
          Eksperimen bentuk lama disimpan sebagai pembanding. Pratinjau GLB terbaru tersedia di lab utama.
        </p>
      </div>
      <ReferenceDoorPreview />
      <Link className="text-sm underline underline-offset-4" href="/pintu-lab">
        Kembali ke model GLB
      </Link>
    </main>
  );
}
