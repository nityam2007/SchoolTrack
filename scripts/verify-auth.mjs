import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
  if (m) env[m[1]] = m[2]
}

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
const cases = [
  ['admin@schooltrack.in', 'admin123'],
  ['principal@greenwood.edu', 'school123'],
  ['priya@greenwood.edu', 'teacher123'],
]
for (const [email, password] of cases) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) { console.log(`✗ ${email}: ${error.message}`); continue }
  const { data: prof, error: perr } = await sb.from('profiles').select('role,school_id,class_id').eq('id', data.user.id).single()
  if (perr) { console.log(`✗ ${email}: profile read failed: ${perr.message}`); continue }
  const { data: schools } = await sb.from('schools').select('id,name')
  const { data: students } = await sb.from('students').select('id')
  console.log(`✓ ${email.padEnd(28)} role=${prof.role.padEnd(11)} school=${(prof.school_id||'-').padEnd(7)} class=${prof.class_id||'-'} sees ${schools?.length||0} schools, ${students?.length||0} students`)
  await sb.auth.signOut()
}
