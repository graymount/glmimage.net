'use client';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-20 md:py-32 relative overflow-hidden', section.className, className)}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="relative max-w-4xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-background/80 to-muted/50 border border-border/50 backdrop-blur-sm">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {section.title}
            </h2>
          </ScrollAnimation>
          <ScrollAnimation delay={0.15}>
            <p
              className="mt-4 md:mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-4">
              {section.buttons?.map((button, idx) => (
                <Button
                  asChild
                  size="lg"
                  variant={button.variant || 'default'}
                  className={cn(
                    "px-8 py-6 text-base font-medium transition-all duration-300",
                    idx === 0 && "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                  )}
                  key={idx}
                >
                  <Link
                    href={button.url || ''}
                    target={button.target || '_self'}
                  >
                    {button.icon && <SmartIcon name={button.icon as string} className="mr-2" />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollAnimation>

          {/* Domain reminder */}
          <ScrollAnimation delay={0.4}>
            <p className="mt-8 text-sm text-muted-foreground/70">
              <span className="font-mono font-medium text-primary">glmimage.net</span>
            </p>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
