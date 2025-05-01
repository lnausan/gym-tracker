// lib/supabase-client.ts
"use client";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const createClientComponentClient = () => createPagesBrowserClient();
