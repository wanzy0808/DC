"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import SectionHeading from "@/components/Marketing/SectionHeading";

type FaqItem = { question: string; answer: string };

type FaqSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export default function FaqSection({
  eyebrow = "FAQ",
  title,
  description,
  items,
}: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl space-y-10">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.question} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/75">
              <GlowButton
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                size="sm"
                className="h-auto min-h-11 w-full min-w-0 justify-between rounded-none border-0 px-5 py-4 text-left text-sm md:px-6 md:text-base"
              >
                <span className="font-[family-name:var(--font-dc-heading)] font-semibold">
                  {item.question}
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </GlowButton>
              {isOpen ? (
                <div className="border-t border-[var(--border)] px-5 pb-6 pt-4 text-sm leading-7 text-[var(--muted-foreground)] md:px-6">
                  {item.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
