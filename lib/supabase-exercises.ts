'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export async function addExerciseToSupabase(
  name: string,
  sets: number,
  reps: number,
  weight: number,
  user_id: string
) {
  const { error } = await supabase.from('exercises').insert([
    {
      name,
      sets,
      reps,
      weight,
      user_id,
    },
  ]);
  if (error) console.error('Error inserting exercise:', error.message);
}

export async function getExercisesFromSupabase(user_id: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercises:', error.message);
    return [];
  }

  return data;
}
