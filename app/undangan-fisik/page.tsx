import Link from "next/link";
import { ArrowRight, Check, Mail, Palette, PackageCheck } from "lucide-react";

const steps = [
  { title: "Ceritakan acaramu", detail: "Bagikan jenis acara, jumlah undangan, tanggal, dan alamat pengiriman." },
  { title: "Tentukan desain", detail: "Pilih arah visual, ukuran, bahan, dan detail personal yang ingin ditampilkan." },
  { title: "Setujui pratinjau", detail: "Periksa nama, waktu, lokasi, serta tata letak sebelum masuk proses cetak." },
  { title: "Cetak dan kirim", detail: "Produksi dimulai setelah desain disetujui. Estimasi pengerjaan dan pengiriman dikonfirmasi saat pemesanan." },
];

export default function UndanganFisikPage() {
  return <main className="relative z-10 min-h-screen overflow-x-clip pb-24 pt-28 text-foreground">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_50%_20%,rgba(224,154,173,0.20),transparent_70%)]" />
    <div className="relative mx-auto w-[88vw] max-w-6xl">
      <section className="grid items-center gap-12 border-b border-border pb-20 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.2em] text-primary">DC Organizer / Undangan Fisik</p>
          <h1 className="mt-5 max-w-xl font-[family-name:var(--font-dc-heading)] text-4xl leading-[1.15] sm:text-5xl lg:text-6xl">Sebuah undangan yang ingin disimpan.</h1>
          <p className="mt-6 max-w-lg font-[family-name:var(--font-dc-body)] text-base leading-8 text-muted-foreground">Dari pernikahan hingga perayaan keluarga, hadirkan kabar bahagia lewat undangan cetak yang terasa personal. Pilih desain, bahan, dan sentuhan akhir yang sesuai dengan ceritamu.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#proses" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Lihat proses <ArrowRight className="h-4 w-4" /></a>
            <a href="#konsultasi" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-primary/10">Diskusikan kebutuhan</a>
          </div>
        </div>
        <div aria-label="Ilustrasi undangan cetak" className="relative mx-auto flex aspect-[4/5] w-full max-w-[440px] items-center justify-center rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#f9e6e8] via-[#efd1d6] to-[#c88798] p-10 shadow-[0_30px_100px_rgba(143,79,97,0.14)]">
          <div className="absolute inset-6 rounded-[1.5rem] border border-white/40" />
          <div className="relative flex aspect-[3/4] w-[75%] rotate-[-6deg] flex-col items-center justify-center border border-[#d7c8bd] bg-[#fffaf5] px-5 text-center shadow-[14px_18px_30px_rgba(95,52,64,0.20)]">
            <div className="absolute inset-3 rounded-t-full border border-[#d9c6b6]" />
            <span className="relative font-[family-name:var(--font-dc-heading)] text-xs tracking-[0.2em] text-[#aa7680]">YOU ARE INVITED</span>
            <span className="relative my-8 font-[family-name:var(--font-dc-heading)] text-3xl text-[#89545f] sm:text-4xl">A & R</span>
            <span className="relative text-xs tracking-[0.15em] text-[#9c747b]">A DAY TO REMEMBER</span>
          </div>
          <div className="absolute bottom-12 right-5 h-24 w-28 rotate-[12deg] rounded-md border border-[#ead7cf] bg-[#fff6ef] shadow-xl sm:right-10" />
        </div>
      </section>
      <section className="grid gap-8 py-20 md:grid-cols-3">
        {[{ icon: Palette, title: "Desain personal", detail: "Warna, tipografi, dan komposisi disesuaikan dengan suasana acaramu." }, { icon: Mail, title: "Detail yang terasa", detail: "Pilihan kertas, amplop, dan finishing dibicarakan sesuai kebutuhan." }, { icon: PackageCheck, title: "Siap dibagikan", detail: "Jumlah cetak, jadwal produksi, dan pengiriman disepakati sebelum pemesanan." }].map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-3xl border border-border bg-background/60 p-7"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-5 font-[family-name:var(--font-dc-heading)] text-xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p></article>)}
      </section>
      <section id="proses" className="border-y border-border py-20"><h2 className="font-[family-name:var(--font-dc-heading)] text-3xl sm:text-4xl">Dari ide hingga sampai di tangan tamu.</h2><div className="mt-10 grid gap-8 md:grid-cols-2">{steps.map((step, index) => <div key={step.title} className="flex gap-5"><span className="font-[family-name:var(--font-dc-heading)] text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-[family-name:var(--font-dc-heading)] text-xl">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{step.detail}</p></div></div>)}</div></section>
      <section id="konsultasi" className="mx-auto max-w-3xl py-20 text-center"><h2 className="font-[family-name:var(--font-dc-heading)] text-3xl sm:text-4xl">Mulai dari detail yang kamu bayangkan.</h2><p className="mt-5 text-base leading-8 text-muted-foreground">Ceritakan konsep, jumlah undangan, dan waktu acara. Kami bantu diskusikan pilihan cetak yang sesuai. Harga dan estimasi produksi diberikan setelah spesifikasi disepakati.</p><a href="https://wa.me/6282124786516?text=Halo%20DC%20Organizer%2C%20saya%20ingin%20konsultasi%20undangan%20fisik." target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">Konsultasi undangan fisik <ArrowRight className="h-4 w-4" /></a><p className="mt-6 text-xs text-muted-foreground">Butuh versi digital juga? <Link href="/d-invitation" className="underline underline-offset-4 hover:text-primary">Lihat Undangan Digital</Link></p></section>
    </div>
  </main>;
}
