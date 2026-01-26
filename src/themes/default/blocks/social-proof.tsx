'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

interface Stat {
  value: string;
  label: string;
  icon?: string;
}

export function SocialProof({
  section,
  className,
}: {
  section: Section & { stats?: Stat[] };
  className?: string;
}) {
  const stats = section.stats || [];

  return (
    <section
      id={section.id}
      className={cn('py-12 md:py-20 border-y border-border/50', section.className, className)}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative group text-center p-6 rounded-2xl bg-gradient-to-br from-background to-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  {stat.icon && (
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <SmartIcon
                        name={stat.icon}
                        size={24}
                        className="text-primary"
                      />
                    </div>
                  )}
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
