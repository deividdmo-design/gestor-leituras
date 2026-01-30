import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Trava de segurança para garantir que as chaves existem
if (!supabaseUrl || !supabaseKey) {
  throw new Error('ERRO CRÍTICO: Chaves do Supabase ausentes no arquivo .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)