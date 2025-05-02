'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export type SupabaseExercise = {
  id: number;
  created_at: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  user_id: string;
  week: number;
  day: string;
};

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
  const { error } = await supabase.from('exercises').insert([
    {
      name,
      sets,
      reps,
      weight,
      user_id,
      created_at: date,
      date,
      week,
      day,
    },
  ]);
  if (error) console.error('Error inserting exercise:', error.message);
}

export async function getExercisesFromSupabase(user_id: string): Promise<SupabaseExercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercises:', error.message);
    return [];
  }

  return data as SupabaseExercise[];
}
