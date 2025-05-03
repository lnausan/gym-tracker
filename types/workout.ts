export type ExerciseSet = {
  reps: number | null;
  weight: number | null;
  completed: boolean;
};

export type Exercise = {
  id?: number;
  name: string;
  type: string; // agregado para resolver el error
  sets: ExerciseSet[];
};

export type WorkoutDay = {
  exercises: Exercise[];
};

export type WeekPlan = {
  [key: string]: WorkoutDay;
};

export type WorkoutPlan = {
  weeks: WeekPlan[];
};