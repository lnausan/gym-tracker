import { supabase } from "@/lib/supabase";

export async function addExerciseToSupabase(name: string, sets: number, reps: number, weight: number) {
  const { data, error } = await supabase
    .from('exercises')
    .insert([
      {
        name,
        sets,
        reps,
        weight,
        date: new Date(),
      }
    ]);

  if (error) {
    console.error('Error guardando ejercicio en Supabase:', error.message);
    return null;
  } else {
    console.log('Ejercicio guardado en Supabase:', data);
    return data;
  }
}

export async function getExercisesFromSupabase() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error trayendo ejercicios de Supabase:', error.message);
    return [];
  } else {
    return data;
  }
}
