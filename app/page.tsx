'use client';

import { Suspense } from 'react';
import WorkoutTracker from '@/components/workout-tracker';
import { Skeleton } from '@/components/ui/skeleton';
import UserMenu from '@/components/UserMenu';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <UserMenu />
      <h1 className="text-3xl font-bold text-center text-blue-700 mt-6">Gym Workout Inausan</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <WorkoutTracker />
      </Suspense>
      <Footer />
    </main>
  );
}
