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
      className={cn('py-12 md:py-16 bg-muted/50', section.className, className)}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                {stat.icon && (
                  <SmartIcon
                    name={stat.icon}
                    size={32}
                    className="mx-auto mb-3 text-primary"
                  />
                )}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
