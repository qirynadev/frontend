<script setup lang="ts">
/**
 * Lien « Nous contacter » / « Contacter le support ».
 *
 * Priorité : écran Centre d’aide (`/reglages/contact`) si la session est
 * ouverte — c’est le formulaire produit. Sinon `mailto:` sur
 * `settings.site.email`, sinon la FAQ.
 */
import { useCatalogStore, useSessionStore } from '~/core/stores'

const catalog = useCatalogStore()
const session = useSessionStore()
const localePath = useLocalePath()

onMounted(() => {
  if (!catalog.isReady) catalog.load()
})

const email = computed(() => catalog.settings?.email ?? '')
const contactTo = computed(() => {
  if (session.isAuthenticated) return localePath('/reglages/contact')
  if (email.value) return `mailto:${email.value}`
  return localePath('/pages/faq')
})
const isExternal = computed(() => contactTo.value.startsWith('mailto:'))
</script>

<template>
  <a v-if="isExternal" :href="contactTo">
    <slot />
  </a>
  <NuxtLink v-else :to="contactTo">
    <slot />
  </NuxtLink>
</template>
