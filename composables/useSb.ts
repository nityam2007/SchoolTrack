import type { SupabaseClient } from '@supabase/supabase-js'

// Wrap useSupabaseClient as an untyped SupabaseClient so .from(<table>) accepts
// our hand-written interfaces from ~/types/database. We don't generate the
// Supabase Database<T> types — the hand-written types are the source of truth.
export const useSb = (): SupabaseClient => useSupabaseClient() as unknown as SupabaseClient
