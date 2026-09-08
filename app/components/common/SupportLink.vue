<script setup lang="ts">
/**
 * Lien « Nous contacter » / « Contacter le support ».
 *
 * Priorité : hub Centre d’aide (`/reglages/centre-aide`) si la session est
 * ouverte. Sinon, `mailto:` sur `settings.site.email` par défaut (repli FAQ
 * si l'e-mail n'est pas connu) — sauf `prefer-contact-page`, qui renvoie vers
 * `/reglages/contact` à la place : cet écran fonctionne sans connexion
 * (`POST /send-email`, voir son docblock), donc adapté aux écrans où
 * l'utilisateur n'est par nature jamais connecté (inscription, mot de passe
 * oublié — 2026-09-08). Pas le comportement par défaut partout : le menu
 * latéral et les écrans de paiement gardent le repli existant, plus léger.
 */
import { useCatalogStore, useSessionStore } from '~/core/stores'

const props = defineProps<{ preferContactPage?: boolean }>()

const catalog = useCatalogStore()
const session = useSessionStore()
const localePath = useLocalePath()

onMounted(() => {
  if (!catalog.isReady) catalog.load()
})

const email = computed(() => catalog.settings?.email ?? '')
const contactTo = computed(() => {
  if (session.isAuthenticated) return localePath('/reglages/centre-aide')
  if (props.preferContactPage) return localePath('/reglages/contact')
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
