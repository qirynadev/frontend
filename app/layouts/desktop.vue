<script setup lang="ts">
/**
 * Shell desktop — pleine largeur.
 * Auth (sans footer) : `h-dvh` verrouillé, pas de scroll page.
 * Variantes via `definePageMeta({ desktopNav, desktopFooter })`.
 */
const route = useRoute()

const navVariant = computed(() => {
  const v = route.meta.desktopNav
  if (v === 'auth' || v === 'auth-reset') return v
  return 'default'
})
const showGlobalNav = computed(() => route.meta.desktopNav !== 'auth-card')
const showFooter = computed(() => route.meta.desktopFooter !== false)
const shellAuthCard = computed(() => route.meta.desktopNav === 'auth-card')
</script>

<template>
  <div
    id="q-shell-desktop"
    class="flex w-full flex-col"
    :class="[
      showFooter ? 'min-h-dvh' : 'h-dvh overflow-hidden',
      shellAuthCard ? 'bg-[#f2f1f6]' : 'bg-white',
    ]"
  >
    <AppDesktopNav v-if="showGlobalNav" :variant="navVariant" />
    <main
      class="min-h-0 w-full flex-1"
      :class="showFooter ? 'overflow-y-auto' : 'overflow-hidden'"
    >
      <slot />
    </main>
    <AppDesktopFooter v-if="showFooter" />
  </div>
</template>
