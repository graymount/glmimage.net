'use client';

import Image from 'next/image';
import { useState } from 'react';

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
      className={cn('py-16 md:py-24 overflow-hidden', section.className, className)}
    >
      <div className="container space-y-8 md:space-y-12">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Overlay with prompt */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
                  "flex flex-col justify-end p-3 md:p-4",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}>
                  {item.model && (
                    <span className="text-xs font-medium text-primary-foreground/80 mb-1">
                      {item.model}
                    </span>
                  )}
                  {item.prompt && (
                    <p className="text-xs text-white/90 line-clamp-3">
                      {item.prompt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {section.tip && (
          <p className="text-center text-sm text-muted-foreground">
            {section.tip}
          </p>
        )}
      </div>
    </section>
  );
}
