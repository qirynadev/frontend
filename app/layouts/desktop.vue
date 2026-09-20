<script setup lang="ts">
/**
 * Shell desktop — artboard Figma 1728 px, zoom uniforme (100vw / 1728).
 * Auth (sans footer) : hauteur viewport verrouillée.
 * Pages avec footer : le shell grandit, le footer défile avec le contenu.
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
const shellAuthColumn = computed(() =>
  route.meta.desktopNav === 'auth'
  || route.meta.desktopNav === 'auth-reset'
  || route.meta.desktopNav === 'auth-card',
)
</script>

<template>
  <div
    id="q-shell-desktop"
    class="flex flex-col"
    :class="[
      shellAuthCard ? 'bg-[#f2f1f6]' : 'bg-white',
      showFooter ? '' : 'is-locked',
    ]"
  >
    <AppDesktopNav v-if="showGlobalNav" :variant="navVariant" />
    <main
      class="w-full flex-1"
      :class="[
        showFooter ? '' : 'min-h-0 overflow-hidden',
        shellAuthColumn ? 'flex min-h-0 flex-col' : '',
      ]"
    >
      <slot />
    </main>
    <AppDesktopFooter v-if="showFooter" />
    <AppDesktopBackToTop />
  </div>
</template>
