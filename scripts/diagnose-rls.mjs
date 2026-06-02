#!/usr/bin/env node
// Diagnose why RLS writes are failing.
//
// RLS on every tenant table calls current_role() / current_school_id() / is_super_admin(),
// all of which read from public.profiles keyed by auth.uid(). If a user's profiles row
// is missing or has the wrong role/school_id, every write fails with
//   "new row violates row-level security policy for table '<x>'"
//
// This script prints, for every auth.user:
//   - what app_metadata claims (the JWT view, what the front-end shows)
//   - what public.profiles actually contains (what RLS uses)
//   - any mismatch.
//
// Usage:
//   node scripts/diagnose-rls.mjs
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
    if (m) process.env[m[1]] ||= m[2]
  }
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: au, error: aErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 })
if (aErr) { console.error(aErr.message); process.exit(1) }

const { data: profiles, error: pErr } = await sb.from('profiles').select('*')
if (pErr) { console.error(pErr.message); process.exit(1) }

const byId = new Map(profiles.map((p) => [p.id, p]))

console.log(`auth.users: ${au.users.length} · public.profiles: ${profiles.length}\n`)

let bad = 0
for (const u of au.users) {
  const meta = u.app_metadata ?? {}
  const p = byId.get(u.id)
  const want = {
    role:      meta.role ?? '(missing)',
    school_id: meta.school_id || null,
    teacher_id: meta.teacher_id || null,
    class_id:  meta.class_id || null,
  }
  if (!p) {
    bad++
    console.log(`✗ ${u.email}  NO profiles row  (jwt says role=${want.role} school=${want.school_id})`)
    continue
  }
  const drift = []
  if (p.role       !== want.role)      drift.push(`role: ${p.role} ≠ ${want.role}`)
  if (p.school_id  !== want.school_id) drift.push(`school: ${p.school_id} ≠ ${want.school_id}`)
  if (p.teacher_id !== want.teacher_id) drift.push(`teacher: ${p.teacher_id} ≠ ${want.teacher_id}`)
  if (p.class_id   !== want.class_id)  drift.push(`class: ${p.class_id} ≠ ${want.class_id}`)
  if (drift.length) {
    bad++
    console.log(`✗ ${u.email}  DRIFT  ${drift.join(' · ')}`)
  } else {
    console.log(`✓ ${u.email}  role=${p.role} school=${p.school_id ?? '-'}`)
  }
}

console.log(`\n${bad} of ${au.users.length} accounts have problems.`)
if (bad > 0) {
  console.log('Fix: apply supabase/migrations/0003_backfill_profiles.sql, then re-run this script.')
}
process.exit(bad === 0 ? 0 : 2)
