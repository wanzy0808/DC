import Pintu3DPreview from "@/components/Landing/Pintu/Pintu3DPreview";
import Link from "next/link";

export const metadata = {
  title: "Arsip preview CSS Pintu 1 | DC Organizer",
  description: "Eksperimen pintu CSS sebelumnya untuk pembanding selama rebuild Three.js.",
};

export default function PreviousCssLab() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[80vw] max-w-full flex-col items-center gap-4 py-8 text-foreground">
      <p className="text-sm text-foreground/65">Arsip eksperimen CSS 3D / 2.5D</p>
      <h1 className="font-[family-name:var(--font-dc-heading)] text-2xl text-primary">
        Preview lama
      </h1>
      <Link href="/pintu-lab" className="text-sm underline underline-offset-4">
        Kembali ke rebuild Three.js
      </Link>
      <Pintu3DPreview />
    </main>
  );
}
