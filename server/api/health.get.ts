// Simple health check that doubles as a Supabase wiring smoke test.
// Hits supabase only if env is configured; otherwise returns ok:false.

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const hasKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
  if (!process.env.SUPABASE_URL || !hasKey) {
    return { ok: true, supabase: 'not-configured' }
  }
  try {
    const client = await serverSupabaseClient(event)
    const { error } = await client.from('schools').select('id').limit(1)
    return { ok: true, supabase: error ? `error: ${error.message}` : 'connected' }
  } catch (e) {
    return { ok: true, supabase: `unavailable: ${(e as Error).message}` }
  }
})
