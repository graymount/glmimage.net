import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CompareGenerator } from '@/shared/blocks/compare';

export const metadata: Metadata = {
  title: 'Compare & Generate | glmimage.net',
  description: 'Compare multiple AI models with one prompt. Find your visual direction faster.',
};

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background pt-8">
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">
            One prompt. Multiple directions.
          </h1>
          <p className="text-muted-foreground">
            Compare different AI models side by side. Pick a direction. Keep iterating.
          </p>
        </div>

        <CompareGenerator />
      </div>
    </main>
  );
}
