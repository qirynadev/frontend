<script setup lang="ts">
/** Écran provisoire, déjà protégé : la messagerie est propre à un compte. */
definePageMeta({ middleware: 'auth' })

useHead({ title: 'Qiryna — Messages' })
</script>

<template>
  <PagePlaceholder :title="$t('nav.messages')" />
</template>
