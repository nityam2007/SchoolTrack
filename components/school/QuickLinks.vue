<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Quick links</p>
    <div class="flex flex-col gap-2">
      <NuxtLink to="/credits" class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-ctl bg-accentSoft flex items-center justify-center">
            <i class="pi pi-credit-card text-accent text-sm" />
          </div>
          <span class="font-semibold text-sm">Manage credits</span>
        </div>
        <i class="pi pi-chevron-right text-muted text-xs" />
      </NuxtLink>
      <NuxtLink to="/analytics" class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-ctl bg-violet/10 flex items-center justify-center">
            <i class="pi pi-chart-bar text-violet text-sm" />
          </div>
          <span class="font-semibold text-sm">Platform analytics</span>
        </div>
        <i class="pi pi-chevron-right text-muted text-xs" />
      </NuxtLink>
    </div>
  </div>
</template>
