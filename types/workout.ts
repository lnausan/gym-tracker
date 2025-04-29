export interface WorkoutSet {
  id: number
  weight: number
  reps: number
  completed: boolean
}

export interface Exercise {
  name: string
  type: string
  sets: WorkoutSet[]
}

export interface WorkoutDay {
  exercises: Exercise[]
}

export interface WeekPlan {
  monday: WorkoutDay
  tuesday: WorkoutDay
  wednesday: WorkoutDay
  thursday: WorkoutDay
  friday: WorkoutDay
  saturday: WorkoutDay
  sunday: WorkoutDay
}

export interface WorkoutPlan {
  weeks: WeekPlan[]
}
