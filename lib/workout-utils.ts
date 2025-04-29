import type { WorkoutPlan, WeekPlan, WorkoutDay } from "@/types/workout"

// Create a memoized initial workout plan to avoid recreating it on every render
let initialWorkoutPlan: WorkoutPlan | null = null

export function generateInitialWorkoutPlan(): WorkoutPlan {
  // Return the cached plan if it exists
  if (initialWorkoutPlan) {
    return initialWorkoutPlan
  }

  const emptyDay: WorkoutDay = {
    exercises: [],
  }

  const weeks: WeekPlan[] = Array(12)
    .fill(null)
    .map(() => ({
      monday: { ...emptyDay },
      tuesday: { ...emptyDay },
      wednesday: { ...emptyDay },
      thursday: { ...emptyDay },
      friday: { ...emptyDay },
      saturday: { ...emptyDay },
      sunday: { ...emptyDay },
    }))

  initialWorkoutPlan = {
    weeks,
  }

  return initialWorkoutPlan
}
