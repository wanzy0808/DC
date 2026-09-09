import { Star } from "lucide-react";
import SectionHeading from "@/components/Marketing/SectionHeading";

type Review = {
  name: string;
  date?: string;
  review: string;
  role?: string;
};

type ReviewsGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  reviews: Review[];
};

export default function ReviewsGrid({ eyebrow, title, description, reviews }: ReviewsGridProps) {
  return (
    <section className="space-y-10">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((item) => (
          <article
            key={`${item.name}-${item.date ?? item.role ?? "review"}`}
            className="flex h-full flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/75 p-6 shadow-sm"
          >
            <div>
              <div className="flex gap-1 text-dc-gold" aria-label="5 dari 5 bintang">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-5 font-serif text-lg italic leading-8 text-[var(--foreground)]">
                “{item.review}”
              </p>
            </div>
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                {item.date ?? item.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
