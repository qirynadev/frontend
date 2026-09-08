<script setup lang="ts">
/**
 * Paiement réussi — **tunnel domaines d'étude** ← `maquette/pwa/pages/paiement-reussi.html`.
 *
 * L'écran générique de fin de paiement : celui vers lequel reviennent les
 * parcours qui n'ont pas le leur. Le parcours langue, lui, a
 * `langues/[slug]/paiement-reussi.vue` — cinq étapes empilées au lieu de
 * quatre en rangée. Voir LOT-5.md § 7 quinquies.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `padding-bottom: 30px`, retour 24×24, logo 145×45, cloche 49×49 |
 * | réussite | illustration 276×123 `object-fit: cover` · titre 24px / 31,25px `-0.625px` insécable · sous-titre 8px au-dessus, centré |
 * | bienvenue | `padding-bottom: 20px` · encart `#f4f9f6`, bord `#f3f9f5`, `padding: 21px 10px`, `gap: 16px` |
 * | frise | rangée `min-height: 150px`, `padding-top: 10px` · séparateurs **absolus** à 25 / 50 / 75 % |
 * | étapes | icône 50×50, pastille 21×20 — une couleur par rang · **sans** description (maquette) |
 * | aide | `min-height: 91px`, bouton **absolu** à droite, centré verticalement |
 * | sous 375px | titre enroulable · le bouton d'aide passe **sous** le texte |
 *
 * Le récapitulatif de commande (école, prix, date, moyen de paiement) a été
 * retiré de la maquette — la page ne montre plus que la réussite, la carte de
 * bienvenue, la frise et l'aide.
 *
 * ### Les quatre états
 *
 * **Chargement** squelettes · **erreur** `PageState` · **vide** aucun
 * `order_id` dans l'URL, avec un renvoi vers « Mon projet » plutôt qu'une page
 * de succès mensongère · **nominal**, et ses deux variantes : refusé, en
 * attente.
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

/** Stripe renvoie l'identifiant de commande dans l'URL. */
const orderId = computed(() => {
  const raw = route.query.order_id ?? route.query.orderId
  return typeof raw === 'string' ? raw : ''
})

const { data: validation, apiError, isInitialLoading, refresh } = await usePageData(
  `payment-success-${orderId.value}`,
  () => (orderId.value === '' ? Promise.resolve(null) : paymentRepo.validate(orderId.value, locale.value)),
  { watch: [orderId, locale] },
)

/**
 * Filet de sécurité : cet écran générique est censé rester réservé au tunnel
 * domaines d'étude — Stripe doit renvoyer chaque autre tunnel vers son propre
 * écran de succès (`success_url` calculée côté back-office selon le type de
 * commande, voir `docs/directives-backend.md`). Repéré en direct le
 * 2026-08-29 : une commande langue atterrit ici malgré tout — la commande a
 * bien son `serviceSlug` réel, la cause n'est pas côté front. Redirige vers
 * le bon écran plutôt que d'exposer le mauvais.
 */
const order = computed(() => validation.value?.order ?? null)
const redirectPath = computed(() => {
  const current = order.value
  if (!current) return null
  if (current.serviceType === 'course' && current.serviceSlug !== '') return localePath(`/langues/${current.serviceSlug}/paiement-reussi`)
  if (current.serviceType === 'costofliving') return localePath('/logement/paiement-reussi')
  if (current.serviceType === 'profilage') return localePath('/orientation/paiement-reussi')
  return null
})

if (redirectPath.value) {
  await navigateTo({ path: redirectPath.value, query: { order_id: orderId.value } }, { replace: true })
}

const confirmed = computed(() => validation.value?.confirmed === true)
const failed = computed(() => validation.value?.failed === true)

/**
 * Les quatre étapes — éditoriales.
 *
 * Aucune n'a de source côté API : ce sont les engagements de service que
 * décrit la maquette, pas un suivi. Elles ne portent donc **aucun statut**,
 * contrairement à celles du parcours langue.
 */
const steps = [
  { icon: 'ic-paiement-step1', tone: 'bg-paiement-step-1', titleKey: 'checkout.success.step1Title' },
  { icon: 'ic-paiement-step2', tone: 'bg-paiement-step-2', titleKey: 'checkout.success.step2Title' },
  { icon: 'ic-paiement-step3', tone: 'bg-success', titleKey: 'checkout.success.step3Title' },
  { icon: 'ic-paiement-step4', tone: 'bg-paiement-step-4', titleKey: 'checkout.success.step4Title' },
] as const

usePageSeo(() => ({
  title: t('checkout.success.seoTitle'),
  description: t('checkout.success.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <!-- Rythme vertical porté par le conteneur (`gap: var(--pr-block-gap)` = 22px
       dans la maquette) : les blocs ne portent aucun retrait propre. -->
  <div class="flex flex-col gap-22">
    <AppTopBar back back-to="/" :gap="0" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="orderId === ''"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-20">
          <QSkeleton variant="rect" :height="123" />
          <QSkeleton variant="rect" :height="205" />
        </div>
      </template>

      <template #empty>
        <QEmptyState
          :title="$t('checkout.success.orderTitle')"
          :description="$t('confirmation.missingOrder')"
        >
          <template #action>
            <QButton :to="localePath('/mon-projet')">{{ $t('nav.project') }}</QButton>
          </template>
        </QEmptyState>
      </template>

      <!-- La maquette ne montre que le succès ; le refus et l'attente existent. -->
      <QAlert
        v-if="failed"
        tone="danger"
        :title="$t('confirmation.failedTitle')"
        :message="$t('confirmation.failedDescription')"
        />
      <QAlert
        v-else-if="!confirmed"
        tone="warning"
        :title="$t('confirmation.pendingTitle')"
        :message="$t('confirmation.pendingDescription')"
      />

      <!-- Réussite / Bienvenue / étapes : réservées au paiement confirmé —
           sinon l'alerte ci-dessus ("échoué"/"en attente") cohabitait avec
           une coche verte "Paiement réussi !", un vrai contresens. -->
      <template v-if="confirmed">
        <!-- Réussite -->
        <div class="flex flex-col items-center">
          <div class="h-123 w-276 shrink-0 overflow-hidden">
            <img
              src="/img/hero-paiement.webp"
              alt=""
              width="276"
              height="123"
              class="pointer-events-none size-full object-cover"
            >
          </div>

          <h1
            class="m-0 text-5xl leading-[31.25px] font-semibold tracking-[-0.625px] whitespace-nowrap text-text max-[375.02px]:whitespace-normal"
          >
            {{ $t('checkout.success.title') }}
          </h1>

          <div class="pt-8 text-center text-xl leading-normal font-normal whitespace-pre-line text-text">
            {{ $t('checkout.success.subtitle') }}
          </div>
        </div>

        <!-- Bienvenue -->
        <div>
          <div class="flex items-start gap-16 rounded-xl border border-welcome-border bg-welcome-bg px-10 py-21">
            <QIcon name="ic-gift" :size="44" />
            <div class="min-w-0">
              <p class="m-0 text-base leading-20 font-bold text-text">
                {{ $t('checkout.success.welcomeTitle') }}
              </p>
              <p class="mt-4 mb-0 text-sm leading-16 font-normal text-text">
                {{ $t('checkout.success.welcomeDescription') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Et maintenant ? -->
        <div>
          <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">
            {{ $t('checkout.success.stepsHeading') }}
          </h2>

          <div class="relative flex min-h-150 items-start pt-10">
            <!-- Séparateurs posés en absolu aux quarts, pas entre les colonnes. -->
            <QIcon
              v-for="position in ['left-[calc(25%-10px)]', 'left-[calc(50%-10px)]', 'left-[calc(75%-10px)]']"
              :key="position"
              name="ic-step-divider"
              :size="20"
              :height="8"
              :class="['pointer-events-none absolute top-30', position]"
            />

            <div v-for="(step, index) in steps" :key="step.icon" class="flex min-w-0 flex-1 flex-col items-center gap-11">
              <div class="flex w-88 flex-col items-center gap-18">
                <QIcon :name="step.icon" :size="50" />
                <span
                  :class="[
                    'flex h-20 w-21 items-center justify-center rounded-full text-md leading-20 font-semibold text-white',
                    step.tone,
                  ]"
                >{{ index + 1 }}</span>
              </div>

              <p class="m-0 text-center text-sm leading-14 font-bold text-text">{{ $t(step.titleKey) }}</p>
            </div>
          </div>
        </div>
      </template>

      <NuxtLink
        v-if="confirmed"
        :to="localePath('/mon-projet')"
        class="box-border block w-full rounded-xl bg-primary px-16 py-16 text-center text-xl leading-20 font-semibold whitespace-nowrap text-white no-underline shadow-ed-float-cta"
      >
        {{ $t('checkout.success.completeFileCta') }}
      </NuxtLink>

      <!-- Une question ? -->
      <div>
        <div class="relative flex min-h-91 items-center justify-between gap-8 rounded-xl bg-surface-2 p-9">
          <!-- `padding-right: 120px` réserve la place du bouton, qui est en
               absolu. Sous 375px il passe dessous, d'où la bascule. -->
          <div class="flex min-w-0 flex-1 items-start gap-11 pr-120 max-[375.02px]:pr-0 max-[375.02px]:pb-44">
            <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
              <QIcon name="ic-headset2" :size="24" />
            </span>
            <div class="min-w-0">
              <p class="m-0 text-md leading-20 font-bold text-text">{{ $t('checkout.success.helpTitle') }}</p>
              <p class="mt-4 mb-0 text-sm leading-16 font-normal whitespace-pre-line text-text">
                {{ $t('checkout.success.helpDescription') }}
              </p>
            </div>
          </div>

          <SupportLink
            class="absolute top-1/2 right-9 inline-flex shrink-0 -translate-y-1/2 items-center gap-6 rounded-lg bg-primary-btn px-14 py-8 text-sm leading-16 font-medium whitespace-nowrap text-white no-underline max-[375.02px]:top-auto max-[375.02px]:bottom-9 max-[375.02px]:translate-y-0"
          >
            {{ $t('checkout.success.helpCta') }}
            <QIcon name="ic-btn-arrow" :size="8" :height="7" />
          </SupportLink>
        </div>
      </div>
    </PageState>
  </div>
</template>
