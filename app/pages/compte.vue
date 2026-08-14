<script setup lang="ts">
/**
 * Écran provisoire — remplacé par sa maquette quand elle existera.
 *
 * Déjà protégé : un compte est nécessaire pour le consulter. La garde vit ici
 * plutôt que dans la barre de navigation, pour la même raison que partout
 * ailleurs — un onglet masqué se contourne en tapant l'URL, une garde de route
 * non.
 */
definePageMeta({ middleware: 'auth' })

useHead({ title: 'Qiryna — Compte' })
</script>

<template>
  <PagePlaceholder :title="$t('nav.account')" />
</template>
