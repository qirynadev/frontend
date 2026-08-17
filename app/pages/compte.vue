<script setup lang="ts">
/**
 * `/compte` n'a pas d'écran propre : la maquette n'en a jamais dessiné un,
 * `reglages.html` en tient lieu (thème, mot de passe, langue…). L'onglet
 * bottom-nav et la cloche d'`AppTopBar` pointent tous deux ici — redirection
 * plutôt que doublon, pour ne garder qu'un seul écran de compte.
 *
 * Toujours protégé par la garde d'authentification : sans elle, un visiteur
 * non connecté atterrirait directement sur `/reglages` (elle-même gardée),
 * perdant la destination d'origine que `middleware/auth.ts` restaure après
 * connexion.
 */
definePageMeta({ middleware: 'auth' })

const localePath = useLocalePath()

await navigateTo(localePath('/reglages'), { replace: true })
</script>

<template>
  <div />
</template>
