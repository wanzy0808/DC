import { ClipboardList, ScanLine, Armchair, BarChart3 } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";

const steps = [
  { icon: ClipboardList, number: "01", title: "Siapkan daftar tamu", text: "Masukkan tamu, WhatsApp, RSVP, plus one, dan nomor meja sebelum hari-H." },
  { icon: ScanLine, number: "02", title: "Terbitkan QR", text: "Kirim QR kepada tamu. Tamu yang belum punya QR dapat diverifikasi usher dan diterbitkan QR resmi." },
  { icon: Armchair, number: "03", title: "Scan di venue", text: "QR menjadi validasi resmi masuk. Setelah scan berhasil, data tamu dan meja langsung tampil." },
  { icon: BarChart3, number: "04", title: "Pantau realtime", text: "Tim dapat melihat attendance dan status tamu secara live untuk membantu keputusan hari-H." },
];

export default function ProcessSection() {
  return (
    <section className="space-y-10">
      <SectionHeading eyebrow="How It Works" title="Alur sederhana, kontrol tetap kuat" description="Dari daftar tamu sampai check-in, setiap langkah dibuat jelas agar usher tidak perlu menebak-nebak di tengah acara." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, number, title, text }) => <article key={number} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6"><span className="text-xs font-mono text-[var(--primary)]">{number}</span><Icon className="mt-8 h-6 w-6 text-[var(--primary)]" /><h3 className="mt-5 font-[family-name:var(--font-dc-heading)] text-xl">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p></article>)}
      </div>
    </section>
  );
}
