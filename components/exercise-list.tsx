"use client";

import { useState } from "react";
import type { Exercise } from "@/types/workout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { addExerciseToSupabase, updateExerciseInSupabase } from "@/lib/supabase-exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  onUpdateExercise: (index: number, exercise: Exercise) => void;
  onDeleteExercise: (index: number) => void;
  userId?: string;
  currentWeek?: number;
  currentDay?: string;
}

export default function ExerciseList({ exercises, onUpdateExercise, onDeleteExercise, userId, currentWeek, currentDay }: ExerciseListProps) {
  const [editingExercise, setEditingExercise] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleStartEditing = (index: number) => {
    setEditingExercise(index);
    setEditingName(exercises[index].name);
  };

  const handleSaveExerciseName = async (index: number) => {
    const updatedExercise = { ...exercises[index], name: editingName };
    onUpdateExercise(index, updatedExercise);
    setEditingExercise(null);

    if (userId && currentWeek && currentDay) {
      const firstSet = updatedExercise.sets[0];
      const date = new Date().toISOString();

      if (updatedExercise.id) {
        // Si el ejercicio ya existe, actualizarlo
        await updateExerciseInSupabase(
          updatedExercise.id,
          updatedExercise.name,
          updatedExercise.sets.length,
          firstSet?.reps || 0,
          firstSet?.weight || 0,
          currentWeek,
          currentDay
        );
      } else {
        // Si es un nuevo ejercicio, crearlo
        await addExerciseToSupabase(
          updatedExercise.name,
          updatedExercise.sets.length,
          firstSet?.reps || 0,
          firstSet?.weight || 0,
          userId,
          date,
          currentWeek,
          currentDay
        );
      }
    }
  };

  const handleAddSet = async (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const newSet = { weight: 0, reps: 0, completed: false };
    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    };
    
    onUpdateExercise(exerciseIndex, updatedExercise);

    // Actualizar en Supabase si existe el ID
    if (exercise.id && userId && currentWeek && currentDay) {
      await updateExerciseInSupabase(
        exercise.id,
        exercise.name,
        updatedExercise.sets.length,
        0,
        0,
        currentWeek,
        currentDay
      );
    }
  };

  const handleUpdateSet = async (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean
  ) => {
    const exercise = exercises[exerciseIndex];
    const updatedSets = exercise.sets.map((set, idx) =>
      idx === setIndex ? { ...set, [field]: value } : set
    );

    const updatedExercise = {
      ...exercise,
      sets: updatedSets,
    };

    onUpdateExercise(exerciseIndex, updatedExercise);

    // Actualizar en Supabase si existe el ID
    if (exercise.id && userId && currentWeek && currentDay) {
      const currentSet = updatedSets[setIndex];
      await updateExerciseInSupabase(
        exercise.id,
        exercise.name,
        updatedSets.length,
        currentSet.reps || 0,
        currentSet.weight || 0,
        currentWeek,
        currentDay
      );
    }
  };

  const handleDeleteSet = async (exerciseIndex: number, setIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const updatedSets = exercise.sets.filter((_, idx) => idx !== setIndex);

    const updatedExercise = {
      ...exercise,
      sets: updatedSets,
    };

    onUpdateExercise(exerciseIndex, updatedExercise);

    // Actualizar en Supabase si existe el ID
    if (exercise.id && userId && currentWeek && currentDay) {
      const currentSet = updatedSets[setIndex] || { reps: 0, weight: 0 };
      await updateExerciseInSupabase(
        exercise.id,
        exercise.name,
        updatedSets.length,
        currentSet.reps || 0,
        currentSet.weight || 0,
        currentWeek,
        currentDay
      );
    }
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise, exerciseIndex) => (
        <Card key={`exercise-${exerciseIndex}`} className="overflow-hidden border-blue-200">
          <CardHeader className="p-4 pb-2 bg-blue-50">
            <div className="flex items-center justify-between">
              {editingExercise === exerciseIndex ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8 border-blue-300 focus-visible:ring-blue-500"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveExerciseName(exerciseIndex)}
                    className="h-8 w-8 text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingExercise(null)}
                    className="h-8 w-8 text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-base font-medium flex items-center gap-2 text-blue-700">
                    {exercise.name}
                    {exercise.type && (
                      <Badge variant="outline" className="ml-2 text-xs border-blue-300 text-blue-600">
                        {exercise.type}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEditing(exerciseIndex)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteExercise(exerciseIndex)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-blue-50">
                  <TableHead className="w-[60px]">Set</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead className="w-[60px]">Done</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercise.sets.map((set, setIndex) => (
                  <TableRow key={`set-${exerciseIndex}-${setIndex}`} className="hover:bg-blue-50">
                    <TableCell className="font-medium text-blue-700">{setIndex + 1}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={set.weight ?? 0}
                        onChange={(e) =>
                          handleUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "weight",
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 w-20 border-blue-200 focus-visible:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={set.reps ?? 0}
                        onChange={(e) =>
                          handleUpdateSet(
                            exerciseIndex,
                            setIndex,
                            "reps",
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 w-20 border-blue-200 focus-visible:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={!!set.completed}
                        onCheckedChange={(checked) =>
                          handleUpdateSet(exerciseIndex, setIndex, "completed", !!checked)
                        }
                        className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddSet(exerciseIndex)}
              className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Set
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
