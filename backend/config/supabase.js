import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const isProduction = process.env.NODE_ENV === 'production';
const hasValidCreds =
  process.env.SUPABASE_URL?.includes('supabase.co') &&
  process.env.SUPABASE_KEY?.length > 20;

if (!hasValidCreds) {
  if (isProduction) {
    throw new Error('❌ Faltan SUPABASE_URL y SUPABASE_KEY en .env');
  } else {
    console.warn('⚠️  Supabase no configurado — algunas funciones sin persistencia');
  }
}

export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_KEY || 'placeholder-key',
  {
    auth: { persistSession: false },
    realtime: { transport: ws }
  }
);
