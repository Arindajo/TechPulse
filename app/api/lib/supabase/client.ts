// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
console.log("Checking Env Vars:", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Instead of crashing the build, log a clear error or handle it
  console.error("Supabase environment variables are missing!");
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);