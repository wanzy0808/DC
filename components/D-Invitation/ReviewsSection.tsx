"use client";

import { Star } from "lucide-react";

type Review = {
  name: string;
  review: string;
  date: string;
};

type ReviewsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  reviews: readonly Review[];
};

export default function ReviewsSection({
  eyebrow,
  title,
  description,
  reviews,
}: ReviewsSectionProps) {
  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <p className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.26em] text-primary">
          {eyebrow}
        </p>
        <h2 className="font-[family-name:var(--font-dc-heading)] text-4xl font-normal leading-tight text-primary md:text-5xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-foreground/65">{description}</p>
      </div>

      <div className="grid gap-0 border-y border-border/70 md:grid-cols-3">
        {reviews.map((item, index) => (
          <article
            key={`${item.name}-${item.date}`}
            className={`p-6 md:p-7 ${index > 0 ? "border-t border-border/70 md:border-l md:border-t-0" : ""}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1 text-primary" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-[family-name:var(--font-dc-mono)] text-[9px] tracking-[0.16em] text-foreground/40">
                {item.date}
              </span>
            </div>
            <p className="mt-5 font-[family-name:var(--font-dc-heading)] text-lg italic leading-7 text-foreground/85">
              “{item.review}”
            </p>
            <p className="mt-6 border-t border-border/70 pt-4 font-[family-name:var(--font-dc-mono)] text-[9px] font-medium uppercase tracking-[0.15em] text-primary">
              {item.name}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
