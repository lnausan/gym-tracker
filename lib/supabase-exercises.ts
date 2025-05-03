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
  // Verificar si el ejercicio ya existe para este día y semana
  const { data: existingExercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user_id)
    .eq("week", week)
    .eq("day", day)
    .eq("name", name)
    .limit(1);

  if (existingExercises && existingExercises.length > 0) {
    // Si existe, actualizarlo en lugar de crear uno nuevo
    const { error } = await supabase
      .from("exercises")
      .update({
        sets,
        reps,
        weight,
      })
      .eq("id", existingExercises[0].id);

    if (error) console.error("❌ Error updating exercise:", error.message);
    return;
  }

  // Si no existe, crear uno nuevo
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
export async function getExercisesFromSupabase(user_id: string, week?: number, day?: string) {
  let query = supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user_id);

  if (week) {
    query = query.eq("week", week);
  }
  
  if (day) {
    query = query.eq("day", day);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

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

export async function updateExerciseInSupabase(
  id: number,
  name: string,
  sets: number,
  reps: number,
  weight: number
) {
  const { error } = await supabase
    .from("exercises")
    .update({
      name,
      sets,
      reps,
      weight,
    })
    .eq("id", id);

  if (error) console.error("❌ Error updating exercise:", error.message);
}
