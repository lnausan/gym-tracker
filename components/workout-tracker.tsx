"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addExerciseToSupabase,
  getExercisesFromSupabase,
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
import {
  generateInitialWorkoutPlan,
} from "@/lib/workout-utils";
import ProgressTracker from "@/components/progress-tracker";

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
  const [userId, setUserId] = useState<string | null>(null);

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    setMounted(true);

    const fetchUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const data = await getExercisesFromSupabase(user.id);
      const initialPlan = generateInitialWorkoutPlan();

      data.forEach((exercise) => {
        const ex: Exercise = {
          name: exercise.name,
          type: "default",
          sets: [
            {
              reps: exercise.reps,
              weight: exercise.weight,
              completed: false,
            },
          ],
        };

        (initialPlan.weeks[0]["monday"] as WorkoutDay).exercises.push(ex);
      });

      setWorkoutPlan(initialPlan);
    };

    fetchUserAndData();
  }, []);

  if (!mounted) return null;

  const handleAddExercise = async (exercise: Exercise) => {
    setWorkoutPlan((prev) => {
      const updatedPlan = { ...prev };
      const currentWeekPlan: WeekPlan = updatedPlan.weeks[currentWeek - 1];
      const currentDayPlan: WorkoutDay = {
        ...currentWeekPlan[currentDay as keyof WeekPlan],
      };

      currentDayPlan.exercises = [...currentDayPlan.exercises, exercise];
      currentWeekPlan[currentDay as keyof WeekPlan] = currentDayPlan;
      updatedPlan.weeks[currentWeek - 1] = currentWeekPlan;

      return updatedPlan;
    });

    if (userId) {
      const firstSet = exercise.sets[0];
      await addExerciseToSupabase(
        exercise.name,
        exercise.sets.length,
        firstSet?.reps || 0,
        firstSet?.weight || 0,
        userId
      );
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

  const handleDeleteExercise = (exerciseIndex: number) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-blue-700">
            12-Week Workout Plan
          </h2>
          <p className="text-sm text-blue-600">
            Track your progress and stay consistent
          </p>
        </div>
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
            Previous
          </Button>
          <span className="font-medium text-blue-700">
            Week {currentWeek} of 12
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek((prev) => Math.min(12, prev + 1))}
            disabled={currentWeek === 12}
            className="border-blue-300 hover:bg-blue-50"
          >
            Next
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue={currentDay}
        value={currentDay}
        onValueChange={setCurrentDay}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7 h-auto bg-blue-100">
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
            <Card className="border-blue-200">
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
