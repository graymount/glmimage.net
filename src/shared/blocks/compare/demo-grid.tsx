'use client';

import { ArrowRight } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';

const DEMO_TASKS = [
  {
    model: 'Flux Pro',
    style: 'Photorealistic',
    src: '/imgs/gallery/sample-1.png',
  },
  {
    model: 'Flux Dev',
    style: 'Balanced',
    src: '/imgs/gallery/sample-5.png',
  },
  {
    model: 'Recraft',
    style: 'Design',
    src: '/imgs/gallery/sample-3.png',
  },
  {
    model: 'Ideogram',
    style: 'Typography',
    src: '/imgs/gallery/sample-4.png',
  },
  {
    model: 'Gemini',
    style: 'Creative',
    src: '/imgs/gallery/sample-2.png',
  },
];

export function DemoGrid() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Here&apos;s what a comparison looks like
        </p>
        <p className="text-xs text-muted-foreground/70 italic">
          &ldquo;Professional headshot, studio lighting, confident businesswoman&rdquo;
        </p>
      </div>

      <div className="relative">
        {/* Demo cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {DEMO_TASKS.map((item, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden opacity-75 hover:opacity-90 transition-opacity"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.model}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.style}
                  </Badge>
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={item.src}
                  alt={`Demo - ${item.model}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg">
          <div className="text-center space-y-2 p-6 rounded-xl bg-background/90 border shadow-lg">
            <p className="text-base font-medium text-foreground">
              Enter a prompt above to see your own comparison
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-primary">
              <span>5 AI models, one prompt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
