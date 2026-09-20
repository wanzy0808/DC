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
          Molding &amp; detail kusen
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70 sm:text-base">
          List bertingkat kini membingkai ukiran di kedua daun, sementara garis tipis memperjelas kusen. Periksa saat tertutup dan terbuka 110°: lis daun ikut berputar, detail kusen tetap pada tempatnya.
        </p>
      </div>
      <Pintu3DPreview />
    </main>
  );
}
