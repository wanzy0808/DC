import Link from "next/link";
import SimpleDoorLab from "@/components/Landing/Pintu/SimpleDoorLab";

export const metadata = {
  title: "Eksperimen pintu 3D | DC Organizer",
  description: "Pintu kayu pink sederhana dengan ketebalan, bayangan, dan cahaya lembut.",
};

export default function PintuLabPage() {
  return (
    <main className="public-page relative mx-auto flex min-h-[calc(100dvh-88px)] w-[calc(100%-2rem)] max-w-full flex-col items-center gap-4 py-5 text-foreground sm:w-[80vw] sm:py-7">
      <div className="max-w-2xl text-center">
        <h1 className="font-[family-name:var(--font-dc-heading)] text-2xl sm:text-3xl">Eksperimen pintu pink 3D</h1>
        <p className="mt-2 text-sm text-foreground/75">Buka pintu dan lihat ketebalan kayu, ukiran minimal, bayangan, serta cahaya lembut dari bawah.</p>
      </div>
      <SimpleDoorLab />
      <Link className="text-sm underline underline-offset-4" href="/pintu-lab/orbital">Lihat eksperimen tiga pintu sebelumnya</Link>
    </main>
  );
}
