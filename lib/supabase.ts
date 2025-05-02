import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsxaqfqcisazchbasdhi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGFxZnFjaXNhemNoYmFzZGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4OTQ3NTEsImV4cCI6MjA2MTQ3MDc1MX0.-YtWFFzjkQBQf-7pzyrpRnItwyc4n6aaHzutPtXQPhc';

export const supabase = createClient(supabaseUrl, supabaseKey);
