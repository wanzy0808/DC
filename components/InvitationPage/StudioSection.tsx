import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function StudioSection() {
  return (
    <section className="grid items-center gap-8 rounded-3xl bg-dc-maroon px-7 py-10 text-white md:grid-cols-[1fr_auto] md:px-12">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-dc-pink-light">
          [ DC DESIGN STUDIO ]
        </p>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl md:text-5xl">
          Buat undangan yang terasa seperti milikmu.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
          Mulai dari template, lalu bawa masuk foto, warna, cerita, musik,
          dan seluruh detail hari bahagiamu ke editor kami.
        </p>
      </div>
      <Link
        href="/dashboard/editor"
        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-dc-maroon transition hover:bg-dc-pink-light"
      >
        Masuk Studio <ExternalLink className="ml-2 h-3.5 w-3.5" />
      </Link>
    </section>
  );
}