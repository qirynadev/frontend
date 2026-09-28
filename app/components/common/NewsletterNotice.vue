<script setup lang="ts">
/**
 * Issue du lien de confirmation de la newsletter, montée une fois dans
 * `app.vue` (mobile et desktop).
 *
 * `server/routes/newsletter-confirmation.get.ts` valide le jeton puis renvoie
 * à l'accueil avec `?newsletter=confirmed|invalid` : ce paramètre est la seule
 * source de l'avis. Le fermer le retire de l'URL, pour qu'un rechargement ou
 * un partage de lien ne le réaffiche pas.
 */
const route = useRoute()
const router = useRouter()

const status = computed(() => {
  const value = route.query.newsletter
  return value === 'confirmed' || value === 'invalid' ? value : null
})

function dismiss() {
  const { newsletter: _, ...query } = route.query
  router.replace({ query })
}
</script>

<template>
  <div
    v-if="status"
    class="fixed inset-x-16 top-16 z-50 mx-auto max-w-[480px] shadow-lg"
  >
    <QAlert
      :tone="status === 'confirmed' ? 'success' : 'warning'"
      :title="$t(status === 'confirmed' ? 'newsletterNotice.confirmedTitle' : 'newsletterNotice.invalidTitle')"
      :message="$t(status === 'confirmed' ? 'newsletterNotice.confirmedMessage' : 'newsletterNotice.invalidMessage')"
      dismissible
      :dismiss-label="$t('newsletterNotice.dismiss')"
      @dismiss="dismiss"
    />
  </div>
</template>
