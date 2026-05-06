<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const { greeting, firstName } = useUserDisplay()

const heading = computed(() => {
  if (auth.role === 'superadmin') return 'Platform overview'
  if (auth.role === 'schooladmin') {
    const sid = auth.schoolId
    return sid ? db.schools.find((s) => s.id === sid)?.name ?? '' : ''
  }
  if (auth.role === 'teacher') {
    const cid = auth.user?.classId
    return cid ? `${db.classes.find((c) => c.id === cid)?.name ?? '—'} · today` : ''
  }
  return ''
})

const dateLabel = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
})
</script>

<template>
  <div>
    <p class="text-muted text-sm font-medium">{{ greeting }}, {{ firstName }} 👋</p>
    <h2 class="st-h1 m-0 mt-1">{{ heading }}</h2>
    <p class="text-muted text-sm mt-1.5">{{ dateLabel }}</p>
  </div>
</template>
