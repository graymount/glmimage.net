'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

interface GalleryItem {
  src: string;
  alt: string;
  prompt?: string;
  model?: string;
}

export function Gallery({
  section,
  className,
}: {
  section: Section & { items?: GalleryItem[] };
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items = section.items || [];

  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24 overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background', section.className, className)}
    >
      <div className="container space-y-10 md:space-y-14">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span>AI Generated</span>
            </div>
            <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground text-lg">
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer",
                  "ring-1 ring-border/50 hover:ring-primary/50",
                  "shadow-sm hover:shadow-xl hover:shadow-primary/10",
                  "transition-all duration-500 hover:-translate-y-1"
                )}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Overlay with prompt */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent",
                  "flex flex-col justify-end p-4 md:p-5",
                  "opacity-0 group-hover:opacity-100 transition-all duration-300"
                )}>
                  {item.model && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white mb-2 bg-white/20 px-2 py-0.5 rounded-full w-fit">
                      <Sparkles className="w-3 h-3" />
                      {item.model}
                    </span>
                  )}
                  {item.prompt && (
                    <p className="text-sm text-white/95 line-clamp-3 leading-relaxed">
                      &ldquo;{item.prompt}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {section.tip && (
          <ScrollAnimation delay={0.3}>
            <p className="text-center text-sm text-muted-foreground bg-muted/50 py-3 px-6 rounded-full mx-auto w-fit">
              {section.tip}
            </p>
          </ScrollAnimation>
        )}
      </div>
    </section>
  );
}
