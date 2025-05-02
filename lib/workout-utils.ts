import type { WorkoutPlan, WeekPlan, WorkoutDay, Exercise } from "@/types/workout";

// Crea y reutiliza un plan inicial de entrenamiento evitando su recreación constante
let initialWorkoutPlan: WorkoutPlan | null = null;

export function generateInitialWorkoutPlan(): WorkoutPlan {
  if (initialWorkoutPlan) {
    return initialWorkoutPlan;
  }

  const emptyDay: WorkoutDay = {
    exercises: [],
  };

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
    }));

  initialWorkoutPlan = { weeks };
  return initialWorkoutPlan;
}
