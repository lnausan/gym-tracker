import { Suspense } from "react"
import WorkoutTracker from "@/components/workout-tracker"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  return (
    <main className="container max-w-3xl px-4 py-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-700">Gym Workout Inausan</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <WorkoutTracker />
      </Suspense>
    </main>
  )
}
