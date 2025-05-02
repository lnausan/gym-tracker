"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Exercise } from "@/types/workout"

interface AddExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddExercise: (exercise: Exercise) => void
}

export default function AddExerciseDialog({ open, onOpenChange, onAddExercise }: AddExerciseDialogProps) {
  const [exerciseName, setExerciseName] = useState("")
  const [exerciseType, setExerciseType] = useState("strength")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!exerciseName.trim()) return

    const newExercise: Exercise = {
      name: exerciseName,
      type: exerciseType,
      sets: [{ id: Date.now(), weight: 0, reps: 0, completed: false }],
    }

    onAddExercise(newExercise)
    setExerciseName("")
    setExerciseType("strength")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-blue-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-blue-700">Add New Exercise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise-name" className="text-blue-700">
                Exercise Name
              </Label>
              <Input
                id="exercise-name"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Bench Press"
                className="border-blue-200 focus-visible:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-blue-700">Exercise Type</Label>
              <RadioGroup value={exerciseType} onValueChange={setExerciseType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strength" id="strength" className="border-blue-300 text-blue-600" />
                  <Label htmlFor="strength" className="font-normal">
                    Strength
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cardio" id="cardio" className="border-blue-300 text-blue-600" />
                  <Label htmlFor="cardio" className="font-normal">
                    Cardio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobility" id="mobility" className="border-blue-300 text-blue-600" />
                  <Label htmlFor="mobility" className="font-normal">
                    Mobility
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!exerciseName.trim()} className="bg-blue-600 hover:bg-blue-700">
              Add Exercise
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
