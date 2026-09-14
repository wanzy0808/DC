import { Heart, Palette, QrCode, Sparkles } from "lucide-react";

const features = [
  {
    icon: Palette,
    label: "01",
    title: "Desain yang terasa milikmu",
    description: "Pilih template sebagai awal, lalu isi dengan foto, warna, kata-kata, dan detail yang membuat kisah kalian terasa utuh.",
  },
  {
    icon: Sparkles,
    label: "02",
    title: "Studio yang tetap tenang",
    description: "Susun konten penting dalam satu ruang kerja yang sederhana, sehingga kamu bisa fokus pada cerita, bukan pada kerumitannya.",
  },
  {
    icon: QrCode,
    label: "03",
    title: "Dari RSVP hingga hari-H",
    description: "Terima konfirmasi tamu, siapkan tiket QR personal, dan bawa data ke tahap check-in ketika perayaan akhirnya tiba.",
  },
];

export default function FeatureSection() {
  return (
    <section id="fitur" className="scroll-mt-24 border-y border-border/70 py-12 md:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
          Why it feels different / 02
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary md:text-4xl">
          Indah untuk dilihat. Lebih indah saat benar-benar membantu.
        </h2>
      </div>
      <div className="grid gap-0 md:grid-cols-3">
        {features.map(({ icon: Icon, label, title, description }, index) => (
          <article
            key={title}
            className={`py-6 md:px-7 ${index > 0 ? "border-t border-border/70 md:border-l md:border-t-0" : ""}`}
          >
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} aria-hidden="true" />
              <span className="font-[family-name:var(--font-dc-mono)] text-[9px] tracking-[0.18em] text-foreground/45">{label}</span>
            </div>
            <h3 className="mt-6 max-w-xs font-[family-name:var(--font-dc-heading)] text-xl font-normal text-primary">
              {title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-foreground/65">{description}</p>
            <div className="mt-6 flex items-center gap-2 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.16em] text-foreground/40">
              <Heart className="h-3 w-3 text-primary/75" aria-hidden="true" />
              Made for the moments that matter
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
