"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

const supabase = createClientComponentClient<Database>();

// 👉 Agrega un ejercicio con info completa
export async function addExerciseToSupabase(
  name: string,
  sets: number,
  reps: number,
  weight: number,
  user_id: string,
  date: string,
  week: number,
  day: string
) {
  const { error } = await supabase.from("exercises").insert([
    {
      name,
      sets,
      reps,
      weight,
      user_id,
      date,
      week,
      day,
    },
  ]);

  if (error) console.error("❌ Error inserting exercise:", error.message);
}

// ✅ Obtiene solo los ejercicios de ese usuario
export async function getExercisesFromSupabase(user_id: string) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching exercises:", error.message);
    return [];
  }

  return data;
}

// 🧼 Borra un ejercicio real en Supabase según ID (te lo paso luego cómo usarlo)
export async function deleteExerciseFromSupabase(id: number) {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    console.error("❌ Error deleting exercise:", error.message);
  }
}
