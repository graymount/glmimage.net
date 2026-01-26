'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

export function HowItWorks({
  section,
  className,
}: {
  section: Section & { steps?: Step[] };
  className?: string;
}) {
  const steps = section.steps || [];

  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container space-y-12 md:space-y-16">
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
          <div className="relative max-w-4xl mx-auto">
            {/* Connection line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  {/* Step number circle */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
                    {step.icon ? (
                      <SmartIcon name={step.icon} size={24} className="text-primary" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{step.number}</span>
                    )}
                  </div>

                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
