'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

interface CompareDemoItem {
  src: string;
  model: string;
  style: string;
}

export function CompareDemo({
  section,
  className,
}: {
  section: Section & {
    prompt?: string;
    items?: CompareDemoItem[];
    cta?: { title: string; url: string };
  };
  className?: string;
}) {
  const items = section.items || [];

  return (
    <section
      id={section.id}
      className={cn(
        'py-12 md:py-16 overflow-hidden',
        section.className,
        className
      )}
    >
      <div className="container space-y-8">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-foreground mb-3 text-2xl font-bold tracking-tight md:text-3xl">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground text-base">
                {section.description}
              </p>
            )}
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.15}>
          {/* Prompt display */}
          {section.prompt && (
            <div className="mx-auto max-w-2xl text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-sm">
                <span className="text-muted-foreground">Prompt:</span>
                <span className="text-foreground italic">
                  &ldquo;{section.prompt}&rdquo;
                </span>
              </div>
            </div>
          )}

          {/* Model comparison grid - matches ModelCard visual style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header - matches model-card style */}
                <div className="flex items-center justify-between p-2.5 border-b bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{item.model}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {item.style}
                    </Badge>
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={item.src}
                    alt={`${item.model} - ${item.style}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* CTA */}
        {section.cta && (
          <ScrollAnimation delay={0.25}>
            <div className="flex justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href={section.cta.url}>
                  <span>{section.cta.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </ScrollAnimation>
        )}
      </div>
    </section>
  );
}
