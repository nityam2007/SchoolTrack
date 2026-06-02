#!/usr/bin/env node
// Reproduce the schools-insert RLS failure with a real superadmin session.
// Uses the anon key + signs in (does NOT bypass RLS like service-role would).

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
    if (m) process.env[m[1]] ||= m[2]
  }
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

console.log('1) Sign in as admin@schooltrack.in')
const { data: signin, error: signErr } = await sb.auth.signInWithPassword({
  email: 'admin@schooltrack.in', password: 'admin123',
})
if (signErr) { console.error('  sign in failed:', signErr.message); process.exit(1) }
console.log(`  ✓ signed in as ${signin.user.email}`)
console.log(`  app_metadata role=${signin.user.app_metadata?.role}`)

console.log('\n2) Probe RLS helper functions via the PostgREST RPC (requires explicit grant — skipped)')

console.log('\n3) Try select from schools (RLS allows superadmin select)')
const { data: schools, error: selErr } = await sb.from('schools').select('id,name')
if (selErr) console.log('  ✗', selErr.message)
else console.log(`  ✓ ${schools.length} schools visible`)

console.log('\n4) Try insert into schools as superadmin')
const id = `DIAG${Date.now().toString(36).toUpperCase()}`
const { error: insErr } = await sb.from('schools').insert({
  id, name: 'RLS Diagnostic', city: '', credits: 0, active: false,
})
if (insErr) {
  console.log('  ✗ insert failed:', insErr.message)
  console.log('  code:', insErr.code, 'details:', insErr.details, 'hint:', insErr.hint)
} else {
  console.log('  ✓ insert succeeded — cleaning up')
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  await admin.from('schools').delete().eq('id', id)
}

await sb.auth.signOut()
