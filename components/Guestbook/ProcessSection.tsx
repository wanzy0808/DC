import { Armchair, BarChart3, ClipboardList, ScanLine } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";

const steps = [
  {
    icon: ClipboardList,
    title: "Siapkan daftar tamu",
    text: "Masukkan tamu, WhatsApp, RSVP, plus one, dan nomor meja sebelum acara berlangsung.",
  },
  {
    icon: ScanLine,
    title: "Terbitkan QR",
    text: "Kirim QR kepada tamu. Tamu yang belum punya QR dapat diverifikasi usher dan diterbitkan QR resmi.",
  },
  {
    icon: Armchair,
    title: "Scan di venue",
    text: "QR menjadi validasi resmi masuk. Setelah scan berhasil, data tamu dan meja langsung tampil.",
  },
  {
    icon: BarChart3,
    title: "Pantau realtime",
    text: "Tim dapat melihat attendance dan status tamu secara live untuk membantu keputusan saat acara berjalan.",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-y border-primary/25 py-14 md:py-20">
      <SectionHeading
        eyebrow="How It Works"
        title="Alur sederhana, kontrol tetap kuat"
        description="Dari daftar tamu sampai check-in, setiap langkah dibuat jelas agar usher tidak perlu menebak-nebak saat acara berlangsung."
      />
      <div className="mt-12 border-t border-primary/30">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <article
            key={title}
            className={`grid gap-5 border-b border-primary/25 py-7 md:grid-cols-[0.72fr_1.28fr] md:items-center md:gap-14 md:py-10 ${index % 2 ? "md:pl-[8%]" : "md:pr-[8%]"}`}
          >
            <div className={index % 2 ? "md:order-2" : ""}><Icon className="h-6 w-6 text-primary" /><h3 className="mt-5 font-[family-name:var(--font-undara-heading)] text-2xl text-primary md:text-3xl">{title}</h3></div>
            <p className={`max-w-xl font-[family-name:var(--font-undara-body)] text-sm leading-7 text-muted-foreground md:text-base md:leading-8 ${index % 2 ? "md:order-1" : ""}`}>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
