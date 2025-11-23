import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const supabase = createClient(
  env.supabase.url || 'https://placeholder.supabase.co',
  env.supabase.anonKey || 'placeholder-key'
);

