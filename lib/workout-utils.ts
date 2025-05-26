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

  // Inicialmente creamos solo la primera semana
  const weeks: WeekPlan[] = [{
    monday: { ...emptyDay },
    tuesday: { ...emptyDay },
    wednesday: { ...emptyDay },
    thursday: { ...emptyDay },
    friday: { ...emptyDay },
    saturday: { ...emptyDay },
    sunday: { ...emptyDay },
  }];

  initialWorkoutPlan = { weeks };
  return initialWorkoutPlan;
}

// Función para agregar una nueva semana al plan
export function addWeekToPlan(plan: WorkoutPlan): WorkoutPlan {
  const emptyDay: WorkoutDay = {
    exercises: [],
  };

  const newWeek: WeekPlan = {
    monday: { ...emptyDay },
    tuesday: { ...emptyDay },
    wednesday: { ...emptyDay },
    thursday: { ...emptyDay },
    friday: { ...emptyDay },
    saturday: { ...emptyDay },
    sunday: { ...emptyDay },
  };

  return {
    weeks: [...plan.weeks, newWeek],
  };
}
