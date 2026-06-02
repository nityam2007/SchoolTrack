#!/usr/bin/env node
// End-to-end RLS sanity check across roles. Signs in as each demo user and
// tries the write each role is supposed to be allowed to do, then deletes
// the test row via service-role.

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

const URL = process.env.SUPABASE_URL
const ANON = process.env.SUPABASE_ANON_KEY
const SR  = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = createClient(URL, SR, { auth: { persistSession: false } })
const id = (p) => `${p}${Date.now().toString(36).toUpperCase()}`

const tests = [
  {
    name: 'superadmin insert into schools',
    email: 'admin@schooltrack.in', password: 'admin123',
    table: 'schools',
    row: () => ({ id: id('DIAG'), name: 'Diag', city: '', credits: 0, active: false }),
  },
  {
    name: 'principal insert into teachers',
    email: 'principal@greenwood.edu', password: 'school123',
    table: 'teachers',
    row: () => ({ id: id('TDIAG'), school_id: 'SCH001', name: 'Diag', email: `diag${Date.now()}@x`, phone: '' }),
  },
  {
    name: 'principal insert into students',
    email: 'principal@greenwood.edu', password: 'school123',
    table: 'students',
    row: () => ({ id: id('SDIAG'), school_id: 'SCH001', class_id: 'CLS001', name: 'Diag', roll: `Z${Date.now()}` }),
  },
  {
    name: 'principal insert into holidays',
    email: 'principal@greenwood.edu', password: 'school123',
    table: 'holidays',
    row: () => ({ id: id('HDIAG'), school_id: 'SCH001', date: '2099-01-01', title: 'Diag' }),
  },
  {
    name: 'principal insert into messages',
    email: 'principal@greenwood.edu', password: 'school123',
    table: 'messages',
    row: () => ({ id: id('MDIAG'), school_id: 'SCH001', student_name: 'Diag', parent_phone: '+910', date: new Date().toISOString(), status: 'delivered' }),
  },
  {
    name: 'teacher insert into attendance (own class)',
    email: 'priya@greenwood.edu', password: 'teacher123',
    table: 'attendance',
    row: () => ({ id: id('ADIAG'), school_id: 'SCH001', class_id: 'CLS001', student_id: 'STU001', date: '2099-01-01', status: 'present', teacher_id: 'T001', photo: true }),
  },
]

let pass = 0, fail = 0
for (const t of tests) {
  const sb = createClient(URL, ANON, { auth: { persistSession: false } })
  const { error: signErr } = await sb.auth.signInWithPassword({ email: t.email, password: t.password })
  if (signErr) { console.log(`✗ ${t.name}  sign in failed: ${signErr.message}`); fail++; continue }
  const row = t.row()
  const { error } = await sb.from(t.table).insert(row)
  if (error) {
    console.log(`✗ ${t.name}  ${error.message}`)
    fail++
  } else {
    console.log(`✓ ${t.name}`)
    pass++
    // cleanup with service role (bypasses RLS)
    await admin.from(t.table).delete().eq('id', row.id)
  }
  await sb.auth.signOut()
}
console.log(`\n${pass} pass · ${fail} fail`)
process.exit(fail === 0 ? 0 : 2)
