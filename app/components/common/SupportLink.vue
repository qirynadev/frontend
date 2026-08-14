<script setup lang="ts">
import { useCatalogStore } from '~/core/stores'

/**
 * Lien « Nous contacter » / « Contacter le support ».
 *
 * ### Pourquoi ce composant existe
 *
 * La maquette écrit `href="#"` sur chacun de ces boutons : elle ne dit pas où
 * ils mènent. Il n'existe **aucun écran de contact** dans les quinze pages, et
 * aucune route côté API. Trois possibilités, donc : un lien mort, un écran
 * inventé, ou la donnée réelle.
 *
 * Le back-office expose `settings.site.email`. C'est la donnée réelle : le lien
 * ouvre le client de messagerie sur cette adresse.
 *
 * Repli si l'adresse n'est pas renseignée : la FAQ, qui est une page
 * éditoriale réellement administrée. Jamais de `#`, jamais de 404.
 *
 * Le catalogue est chargé à la demande — l'appel est mis en cache par Nitro et
 * dédoublonné par le store, donc sans effet sur les écrans qui l'ont déjà.
 */
const catalog = useCatalogStore()
const localePath = useLocalePath()

onMounted(() => {
  if (!catalog.isReady) catalog.load()
})

const email = computed(() => catalog.settings?.email ?? '')
</script>

<template>
  <a v-if="email" :href="`mailto:${email}`">
    <slot />
  </a>
  <NuxtLink v-else :to="localePath('/pages/faq')">
    <slot />
  </NuxtLink>
</template>
