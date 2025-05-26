"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addExerciseToSupabase,
  getExercisesFromSupabase,
  deleteExerciseFromSupabase,
} from "@/lib/supabase-exercises";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ExerciseList from "@/components/exercise-list";
import { PlusCircle } from "lucide-react";
import AddExerciseDialog from "@/components/add-exercise-dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type {
  WorkoutPlan,
  Exercise,
  WorkoutDay,
  WeekPlan,
} from "@/types/workout";
import { generateInitialWorkoutPlan, addWeekToPlan } from "@/lib/workout-utils";
import ProgressTracker from "@/components/progress-tracker";
import type { Database } from "@/types/database";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"];

export default function WorkoutTracker() {
  const supabase = createClientComponentClient();
  const initialWorkoutPlan = useMemo(() => generateInitialWorkoutPlan(), []);
  const [workoutPlan, setWorkoutPlan] = useLocalStorage<WorkoutPlan>(
    "workout-plan",
    initialWorkoutPlan
  );
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState("monday");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const syncExercises = async () => {
    if (!userId) return;
    setIsSyncing(true);
    try {
      const data = await getExercisesFromSupabase(userId, currentWeek, currentDay);
      const plan = { ...workoutPlan };

      // Limpiar solo los ejercicios del día actual
      const currentWeekPlan = plan.weeks[currentWeek - 1];
      const currentDayKey = currentDay as keyof WeekPlan;
      if (currentWeekPlan && currentWeekPlan[currentDayKey]) {
        currentWeekPlan[currentDayKey].exercises = [];
      }

      // Solo agregar ejercicios al día actual
      (data as ExerciseRow[]).forEach((exercise) => {
        const weekIndex = (exercise.week ?? 1) - 1;
        const dayKey = (exercise.day ?? "monday") as keyof WeekPlan;

        // Solo procesar ejercicios del día y semana actual
        if (weekIndex === currentWeek - 1 && dayKey === currentDay) {
          if (plan.weeks[weekIndex] && plan.weeks[weekIndex][dayKey]) {
            const newExercise: Exercise = {
              id: exercise.id,
              name: exercise.name ?? "",
              type: "default",
              sets: Array(exercise.sets || 1).fill(null).map(() => ({
                reps: exercise.reps ?? 0,
                weight: exercise.weight ?? 0,
                completed: false,
              })),
            };

            plan.weeks[weekIndex][dayKey].exercises.push(newExercise);
          }
        }
      });

      setWorkoutPlan(plan);
    } catch (error) {
      console.error("Error syncing exercises:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    const fetchUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.id) return;

      setUserId(user.id);
      await syncExercises();
    };

    fetchUserAndData();

    // Configurar suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('exercises')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'exercises',
          filter: `user_id=eq.${userId}`
        }, 
        async (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['exercises']['Row']>) => {
          console.log('Change received!', payload);
          await syncExercises();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentWeek, currentDay, userId]);

  if (!mounted) return null;

  const handleAddExercise = async (exercise: Exercise) => {
    if (!userId) return;

    const firstSet = exercise.sets[0];
    const date = new Date().toISOString();

    try {
      const newExercise = await addExerciseToSupabase(
        exercise.name,
        exercise.sets.length,
        firstSet?.reps || 0,
        firstSet?.weight || 0,
        userId,
        date,
        currentWeek,
        currentDay
      );

      if (newExercise) {
        setWorkoutPlan((prev) => {
          const updatedPlan = { ...prev };
          const currentWeekPlan: WeekPlan = updatedPlan.weeks[currentWeek - 1];
          const currentDayPlan: WorkoutDay = {
            ...currentWeekPlan[currentDay as keyof WeekPlan],
          };

          const exerciseWithId: Exercise = {
            ...exercise,
            id: newExercise.id,
          };

          currentDayPlan.exercises = [...currentDayPlan.exercises, exerciseWithId];
          currentWeekPlan[currentDay as keyof WeekPlan] = currentDayPlan;
          updatedPlan.weeks[currentWeek - 1] = currentWeekPlan;

          return updatedPlan;
        });
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
    }

    setIsAddExerciseOpen(false);
  };

  const handleUpdateExercise = (exerciseIndex: number, updatedExercise: Exercise) => {
    setWorkoutPlan((prev) => {
      const updatedPlan = { ...prev };
      const currentWeekPlan = { ...updatedPlan.weeks[currentWeek - 1] };
      const currentDayPlan = {
        ...(currentWeekPlan[currentDay as keyof typeof currentWeekPlan] as WorkoutDay),
      };

      currentDayPlan.exercises = currentDayPlan.exercises.map((ex, idx) =>
        idx === exerciseIndex ? updatedExercise : ex
      );

      currentWeekPlan[currentDay as keyof typeof currentWeekPlan] = currentDayPlan;
      updatedPlan.weeks[currentWeek - 1] = currentWeekPlan;

      return updatedPlan;
    });
  };

  const handleDeleteExercise = async (exerciseIndex: number) => {
    const exercise = currentDayExercises[exerciseIndex];
    
    // Eliminar de Supabase si existe
    if (exercise.id) {
      await deleteExerciseFromSupabase(exercise.id);
    }

    setWorkoutPlan((prev) => {
      const updatedPlan = { ...prev };
      const currentWeekPlan = { ...updatedPlan.weeks[currentWeek - 1] };
      const currentDayPlan = {
        ...(currentWeekPlan[currentDay as keyof typeof currentWeekPlan] as WorkoutDay),
      };

      currentDayPlan.exercises = currentDayPlan.exercises.filter(
        (_, idx) => idx !== exerciseIndex
      );

      currentWeekPlan[currentDay as keyof typeof currentWeekPlan] = currentDayPlan;
      updatedPlan.weeks[currentWeek - 1] = currentWeekPlan;

      return updatedPlan;
    });
  };

  const currentDayExercises =
    workoutPlan.weeks[currentWeek - 1]?.[
      currentDay as keyof (typeof workoutPlan.weeks)[0]
    ]?.exercises || [];

  const calculateWeekProgress = (weekIndex: number) => {
    const week = workoutPlan.weeks[weekIndex];
    let totalExercises = 0;
    let completedExercises = 0;

    Object.values(week).forEach((day: WorkoutDay) => {
      day.exercises.forEach((exercise) => {
        totalExercises += exercise.sets.length;
        completedExercises += exercise.sets.filter((set) => set.completed).length;
      });
    });

    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const calculateOverallProgress = () => {
    let totalExercises = 0;
    let completedExercises = 0;

    workoutPlan.weeks.forEach((week) => {
      Object.values(week).forEach((day: WorkoutDay) => {
        day.exercises.forEach((exercise) => {
          totalExercises += exercise.sets.length;
          completedExercises += exercise.sets.filter((set) => set.completed).length;
        });
      });
    });

    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const weekProgress = calculateWeekProgress(currentWeek - 1);
  const overallProgress = calculateOverallProgress();

  const handleNextWeek = () => {
    setCurrentWeek((prev) => {
      const nextWeek = prev + 1;
      // Si la semana siguiente no existe, la creamos
      if (nextWeek > workoutPlan.weeks.length) {
        setWorkoutPlan((currentPlan) => addWeekToPlan(currentPlan));
      }
      return nextWeek;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-blue-700">
            Weekly Workout Tracker
          </h2>
          <p className="text-sm text-blue-600">
            Track your progress and stay consistent
          </p>
        </div>
        <Button
          onClick={syncExercises}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? "Updating..." : "Update Exercises"}
        </Button>
      </div>

      <ProgressTracker
        weekProgress={weekProgress}
        overallProgress={overallProgress}
        currentWeek={currentWeek}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek((prev) => Math.max(1, prev - 1))}
            disabled={currentWeek === 1}
            className="border-blue-300 hover:bg-blue-50"
          >
            Previous Week
          </Button>
          <span className="font-medium text-blue-700">
            Week {currentWeek}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="border-blue-300 hover:bg-blue-50"
          >
            Next Week
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue={currentDay}
        value={currentDay}
        onValueChange={setCurrentDay}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7 h-auto bg-blue-50/50 backdrop-blur-sm">
          {daysOfWeek.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className="capitalize data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {daysOfWeek.map((day) => (
          <TabsContent key={day} value={day} className="mt-4">
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-sm">
              <CardContent className="p-4 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium capitalize text-blue-700">
                    {day}'s Workout
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setIsAddExerciseOpen(true)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Exercise
                  </Button>
                </div>

                <ExerciseList
                  exercises={currentDayExercises}
                  onUpdateExercise={handleUpdateExercise}
                  onDeleteExercise={handleDeleteExercise}
                  userId={userId}
                  currentWeek={currentWeek}
                  currentDay={currentDay}
                />

                {currentDayExercises.length === 0 && (
                  <div className="py-8 text-center text-blue-400">
                    No exercises for this day. Add one to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AddExerciseDialog
        open={isAddExerciseOpen}
        onOpenChange={setIsAddExerciseOpen}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
}
