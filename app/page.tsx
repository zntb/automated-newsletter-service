import { Suspense } from 'react';
import HomeContent from '@/components/home-content';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
