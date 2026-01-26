'use client';

import { ArrowRight } from 'lucide-react';

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
      className={cn('py-16 md:py-24 bg-muted/30', section.className, className)}
    >
      <div className="container space-y-10 md:space-y-14">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
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
          <div className="relative max-w-5xl mx-auto">
            {/* Connection line - desktop */}
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Arrow between steps - mobile */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2 md:hidden">
                      <ArrowRight className="w-5 h-5 text-primary/40 rotate-90" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    {/* Step number badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon circle */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {step.icon ? (
                        <SmartIcon name={step.icon} size={28} className="text-primary" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">{step.number}</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
