<script setup lang="ts">
/**
 * Porte d'entrée vers le LMS (plateforme d'apprentissage, application à part).
 *
 * Sert à la **reconnexion** : quand la session d'un client expire dans le LMS,
 * celui-ci renvoie le navigateur vers le back-office (`/lms/reconnexion`), qui
 * redirige ici. La session du client étant tenue par le site, c'est cette
 * page qui demande une nouvelle adresse de connexion unique et y repart.
 *
 * - client connecté : nouvelle adresse, puis redirection immédiate ;
 * - client non connecté : le middleware `auth` passe par `/connexion` et
 *   ramène ici ensuite ;
 * - entrée refusée ou LMS indisponible : message et retour à l'espace personnel.
 *
 * Paramètres facultatifs : `order_id` (commande dont on veut le test) et
 * `target` (`placement` ou `courses`). Sans eux : tableau de bord du LMS.
 *
 * Le chemin de cette page est connu du back-office (`LMS_FRONT_ENTRY_PATH`).
 */
import { ApiError } from '~/core/http/errors'
import type { LmsTarget } from '~/core/repositories'
import { lmsRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const failure = ref<string | null>(null)

// Côté navigateur seulement : l'adresse ne vaut que 60 secondes et une seule
// fois, elle ne doit pas être fabriquée par un rendu serveur.
onMounted(async () => {
  const orderId = typeof route.query.order_id === 'string' ? route.query.order_id : ''
  const asked = route.query.target
  const target: LmsTarget = asked === 'placement' || asked === 'courses' ? asked : orderId ? 'placement' : 'courses'

  try {
    const { url } = await lmsRepo.entryUrl({ ...(orderId ? { orderId } : {}), target }, locale.value)
    // `replace` : cette page ne doit pas rester dans l'historique, un retour
    // arrière y rejouerait une adresse déjà utilisée.
    window.location.replace(url)
  }
  catch (error) {
    failure.value = error instanceof ApiError && error.code ? error.message : t('lmsEntry.error')
  }
})

usePageSeo(() => ({
  title: t('lmsEntry.seoTitle'),
  description: t('lmsEntry.loading'),
  noindex: true,
}))
</script>

<template>
  <div class="flex w-full flex-col gap-22 pb-22">
    <AppTopBar back back-to="/mon-projet" :gap="0" />

    <QEmptyState v-if="failure" :title="$t('lmsEntry.errorTitle')" :description="failure">
      <template #action>
        <QButton :to="localePath('/mon-projet')">{{ $t('lmsEntry.back') }}</QButton>
      </template>
    </QEmptyState>

    <div v-else class="flex flex-col gap-22" role="status" aria-live="polite">
      <p class="m-0 text-[14px] leading-[22.5px] font-medium text-[#0a142f]">{{ $t('lmsEntry.loading') }}</p>
      <QSkeleton variant="rect" :height="180" />
    </div>
  </div>
</template>
