<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const messages = computed(() => (auth.schoolId ? db.messagesForSchool(auth.schoolId) : []))
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">WhatsApp Messages</h2>
    <div class="st-card">
      <DataTable :value="messages" responsive-layout="scroll" striped-rows>
        <Column field="studentName" header="Student" sortable />
        <Column field="parentPhone" header="Parent Phone" />
        <Column field="date" header="Sent At" sortable />
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="
                data.status === 'delivered'
                  ? 'success'
                  : data.status === 'failed'
                  ? 'danger'
                  : 'warn'
              "
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
