'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// Colors for each AI model card
const cardColors = [
  'from-blue-500/10 to-blue-600/5 hover:border-blue-500/30',
  'from-purple-500/10 to-purple-600/5 hover:border-purple-500/30',
  'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/30',
  'from-orange-500/10 to-orange-600/5 hover:border-orange-500/30',
  'from-pink-500/10 to-pink-600/5 hover:border-pink-500/30',
  'from-cyan-500/10 to-cyan-600/5 hover:border-cyan-500/30',
];

const iconColors = [
  'text-blue-500 bg-blue-500/10',
  'text-purple-500 bg-purple-500/10',
  'text-emerald-500 bg-emerald-500/10',
  'text-orange-500 bg-orange-500/10',
  'text-pink-500 bg-pink-500/10',
  'text-cyan-500 bg-cyan-500/10',
];

export function Features({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container space-y-10 md:space-y-14">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {section.items?.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative p-6 rounded-2xl",
                  "bg-gradient-to-br border border-border/50",
                  "hover:shadow-xl hover:-translate-y-1",
                  "transition-all duration-300",
                  cardColors[idx % cardColors.length]
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  "group-hover:scale-110 transition-transform duration-300",
                  iconColors[idx % iconColors.length]
                )}>
                  <SmartIcon name={item.icon as string} size={24} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
