import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debugging: Log if values are missing (masking the sensitive part)
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase credentials missing from .env!')
    console.log('Available Env Keys:', Object.keys(import.meta.env))
} else {
    console.log('Supabase initialized with URL:', supabaseUrl.substring(0, 15) + '...')
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
