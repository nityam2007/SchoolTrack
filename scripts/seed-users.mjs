#!/usr/bin/env node
// Seed demo auth users for SchoolTrack via the Supabase Admin API.
// Idempotent: matches by email and updates if found, otherwise creates.
//
// Usage:
//   node scripts/seed-users.mjs
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
// The service_role key bypasses RLS and is required to create auth.users.
// NEVER expose this key to the browser.

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local if dotenv didn't pick it up
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
    if (m) process.env[m[1]] ||= m[2]
  }
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false } })

const DEMO_USERS = [
  {
    email: 'admin@schooltrack.in',
    password: 'admin123',
    full_name: 'Platform Admin',
    role: 'superadmin',
    school_id: '',
    teacher_id: '',
    class_id: '',
  },
  {
    email: 'principal@greenwood.edu',
    password: 'school123',
    full_name: 'Principal — Greenwood Academy',
    role: 'schooladmin',
    school_id: 'SCH001',
    teacher_id: '',
    class_id: '',
  },
  {
    email: 'principal@sunrise.edu',
    password: 'sunrise123',
    full_name: 'Principal — Sunrise Public School',
    role: 'schooladmin',
    school_id: 'SCH002',
    teacher_id: '',
    class_id: '',
  },
  {
    email: 'principal@blueridge.edu',
    password: 'blueridge123',
    full_name: 'Principal — Blue Ridge International',
    role: 'schooladmin',
    school_id: 'SCH003',
    teacher_id: '',
    class_id: '',
  },
  {
    email: 'priya@greenwood.edu',
    password: 'teacher123',
    full_name: 'Ms. Priya Sharma',
    role: 'teacher',
    school_id: 'SCH001',
    teacher_id: 'T001',
    class_id: 'CLS001',
  },
  {
    email: 'rahul@greenwood.edu',
    password: 'rahul123',
    full_name: 'Mr. Rahul Mehta',
    role: 'teacher',
    school_id: 'SCH001',
    teacher_id: 'T002',
    class_id: 'CLS002',
  },
  {
    email: 'anita@greenwood.edu',
    password: 'anita123',
    full_name: 'Ms. Anita Roy',
    role: 'teacher',
    school_id: 'SCH001',
    teacher_id: 'T003',
    class_id: 'CLS003',
  },
]

async function findUserByEmail(email) {
  // listUsers paginates; for ~10 demo users one page is enough.
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw error
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null
}

async function upsertUser(u) {
  // SECURITY: role + tenant scope go in app_metadata (admin-only writable).
  // Only display name lives in user_metadata.
  const appMeta = {
    role: u.role,
    school_id: u.school_id,
    teacher_id: u.teacher_id,
    class_id: u.class_id,
  }
  const userMeta = { full_name: u.full_name }
  const existing = await findUserByEmail(u.email)
  if (existing) {
    const { error } = await sb.auth.admin.updateUserById(existing.id, {
      password: u.password,
      email_confirm: true,
      app_metadata: appMeta,
      user_metadata: userMeta,
    })
    if (error) throw error
    return { action: 'updated', id: existing.id, email: u.email }
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    app_metadata: appMeta,
    user_metadata: userMeta,
  })
  if (error) throw error
  return { action: 'created', id: data.user.id, email: u.email }
}

console.log(`Seeding ${DEMO_USERS.length} demo users into ${url}…`)
let ok = 0
for (const u of DEMO_USERS) {
  try {
    const r = await upsertUser(u)
    console.log(`  ✓ ${r.action.padEnd(7)} ${r.email}  (${r.id})`)
    ok++
  } catch (e) {
    console.error(`  ✗ failed ${u.email}: ${e.message}`)
  }
}
console.log(`Done. ${ok}/${DEMO_USERS.length} succeeded.`)
process.exit(ok === DEMO_USERS.length ? 0 : 1)
