import Pintu3DPreview from "@/components/Landing/Pintu/Pintu3DPreview";

export const metadata = {
  title: "Lab Pintu 3D | DC Organizer",
  description: "Preview Pintu 1 untuk memeriksa daun pintu, kusen, dan mekanisme bukaan.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[80vw] max-w-full flex-col items-center gap-2 overflow-visible py-10 text-foreground">
      <div className="max-w-2xl text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.12em] text-foreground/60">
          Preview terpisah · Pintu 1
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-dc-heading)] text-3xl text-primary sm:text-4xl">
          Kusen klasik &amp; ukiran Pintu 1
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70 sm:text-base">
          Arah visual dikembalikan ke referensi Pintu 1: kusen lebih megah dengan crown acanthus, panel klasik yang sederhana, dan ukiran rose-gold tipis. Rose crest besar di daun sudah dibuang; mekanisme buka, engsel, dan kusen 3D tetap.
        </p>
      </div>
      <Pintu3DPreview />
    </main>
  );
}
