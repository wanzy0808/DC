import { Armchair, BarChart3, ClipboardList, ScanLine } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";

const steps = [
  {
    icon: ClipboardList,
    number: "01",
    title: "Siapkan daftar tamu",
    text: "Masukkan tamu, WhatsApp, RSVP, plus one, dan nomor meja sebelum acara berlangsung.",
  },
  {
    icon: ScanLine,
    number: "02",
    title: "Terbitkan QR",
    text: "Kirim QR kepada tamu. Tamu yang belum punya QR dapat diverifikasi usher dan diterbitkan QR resmi.",
  },
  {
    icon: Armchair,
    number: "03",
    title: "Scan di venue",
    text: "QR menjadi validasi resmi masuk. Setelah scan berhasil, data tamu dan meja langsung tampil.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Pantau realtime",
    text: "Tim dapat melihat attendance dan status tamu secara live untuk membantu keputusan saat acara berjalan.",
  },
];

export default function ProcessSection() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="How It Works"
        title="Alur sederhana, kontrol tetap kuat"
        description="Dari daftar tamu sampai check-in, setiap langkah dibuat jelas agar usher tidak perlu menebak-nebak saat acara berlangsung."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, number, title, text }) => (
          <article
            key={number}
            className="rounded-[28px] border border-primary/35 bg-card/75 p-6 md:rounded-[32px]"
          >
            <span className="font-[family-name:var(--font-dc-mono)] text-xs text-primary">
              {number}
            </span>
            <Icon className="mt-8 h-6 w-6 text-primary" />
            <h3 className="mt-5 font-[family-name:var(--font-dc-heading)] text-xl">
              {title}
            </h3>
            <p className="mt-3 font-[family-name:var(--font-dc-body)] text-sm leading-6 text-muted-foreground">
              {text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
