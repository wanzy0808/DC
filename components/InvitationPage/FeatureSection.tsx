import { Palette, QrCode, Sparkles } from "lucide-react";

export default function FeatureSection() {
  return (
    <section
      id="fitur"
      className="grid gap-5 border-y border-dc-maroon/15 py-10 sm:grid-cols-3"
    >
      <div>
        <Palette className="h-5 w-5 text-dc-maroon" />
        <h2 className="mt-4 font-serif text-xl">Desain yang bercerita</h2>
        <p className="mt-2 text-sm leading-6 opacity-65">
          Template editorial yang dapat kamu isi dengan ritme dan karakter
          pasanganmu.
        </p>
      </div>
      <div>
        <Sparkles className="h-5 w-5 text-dc-maroon" />
        <h2 className="mt-4 font-serif text-xl">Studio yang mudah</h2>
        <p className="mt-2 text-sm leading-6 opacity-65">
          Atur nama, foto, warna, teks, dan musik dalam satu ruang kerja
          yang tenang.
        </p>
      </div>
      <div>
        <QrCode className="h-5 w-5 text-dc-maroon" />
        <h2 className="mt-4 font-serif text-xl">RSVP sampai check-in</h2>
        <p className="mt-2 text-sm leading-6 opacity-65">
          Pantau konfirmasi tamu dan siapkan QR personal untuk hari bahagia.
        </p>
      </div>
    </section>
  );
}