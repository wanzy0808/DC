// components/invitation/ReviewsSection.tsx
import { Star } from "lucide-react";

const reviews = [
  ["Riko & Sarah", "Undangannya terasa seperti kami. RSVP masuk rapi dan tamu langsung tahu harus ke mana."],
  ["Adit & Maya", "Tim DC membantu dari pemilihan template sampai musik. Kami tinggal membagikan link-nya."],
  ["Dion & Nina", "QR check-in dan ucapan digital membuat hari-H terasa lebih tertata tanpa mengurangi hangatnya acara."],
];

export default function ReviewsSection() {
  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-dc-maroon">
          [ THEIR STORIES ]
        </p>
        <h2 className="font-serif text-4xl">Mereka memakai undangan ini</h2>
        <p className="text-sm leading-7 opacity-65">
          Bukan hanya cantik dilihat, tapi juga membantu hari-H terasa lebih teratur.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map(([name, review]) => (
          <article key={name} className="border border-dc-maroon/15 bg-white/70 p-6 shadow-sm">
            <div className="flex gap-1 text-dc-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-5 font-serif text-lg italic leading-7">“{review}”</p>
            <p className="mt-6 border-t border-dc-maroon/10 pt-4 text-xs font-medium uppercase tracking-[0.15em] text-dc-maroon">
              {name}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}