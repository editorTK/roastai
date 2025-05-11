
import RoastPageClient from '@/components/roast-page-client';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen"> {/* Changed justify-center to justify-start and added min-h-screen */}
      <RoastPageClient />
    </main>
  );
}
