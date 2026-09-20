<script setup lang="ts">
/**
 * Bouton fixe bas-droite, hors canevas zoomé (`Teleport` → `body`).
 * Visible après un scroll down, avec une courte animation d’apparition.
 */
const visible = ref(false)
const THRESHOLD = 240

function onScroll() {
  visible.value = window.scrollY > THRESHOLD
}

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Teleport to="body">
    <button
      type="button"
      class="fixed right-24 bottom-24 z-[200] hidden size-40 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f9172d] text-white shadow-[0_8px_20px_rgba(249,23,45,0.28)] transition-[opacity,transform] duration-300 ease-out shell:flex"
      :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-12 opacity-0'"
      :tabindex="visible ? 0 : -1"
      :aria-hidden="!visible"
      :aria-label="$t('desktop.nav.backToTop')"
      @click="goTop"
    >
      <QIcon name="chevron-up" :size="18" />
    </button>
  </Teleport>
</template>
