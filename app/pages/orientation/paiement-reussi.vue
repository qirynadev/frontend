<script setup lang="ts">
/**
 * Paiement réussi — **tunnel orientation** ← `maquette/pwa/pages/orientation-post-paiement.html`
 * (`.page-lpp.page-opp`, partage la famille `.lpp-*` de `langues-post-payment.html`,
 * pas celle de `paiement-reussi.html`).
 *
 * Portage très proche de `langues/[slug]/paiement-reussi.vue` (même halo,
 * mêmes étincelles, même frise verticale calée en JS) : quatre étapes au
 * lieu de cinq, sans le cas particulier de la 4ᵉ icône à 44px sans pastille.
 *
 * `.page-opp .lpp-support` bascule en colonne dès 400px de large (bouton
 * pleine largeur), là où la version langue reste en ligne avec retour à la
 * ligne — un vrai écart entre les deux tunnels, pas une coquille.
 *
 * ### Les quatre états
 *
 * **Chargement** squelettes · **erreur** `PageState` · **vide** aucun
 * `order_id` dans l'URL · **nominal**, et ses deux variantes : refusé, en
 * attente.
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({
  // `.page-lpp { background: #faf9fe }` — s'applique aussi à `.page-opp`.
  shellBackground: 'tint',
  middleware: 'auth',
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const path = computed(() => (route.query.path === 'enfant' ? 'enfant' : 'moi'))

/** Stripe renvoie l'identifiant de commande dans l'URL. */
const orderId = computed(() => {
  const raw = route.query.order_id ?? route.query.orderId
  return typeof raw === 'string' ? raw : ''
})

const { data: validation, apiError, isInitialLoading, refresh } = await usePageData(
  `payment-validation-orientation-${orderId.value}`,
  () => (orderId.value === '' ? Promise.resolve(null) : paymentRepo.validate(orderId.value, locale.value)),
  { watch: [orderId, locale] },
)

const confirmed = computed(() => validation.value?.confirmed === true)
const failed = computed(() => validation.value?.failed === true)

/**
 * Les quatre étapes — éditoriales, comme sur l'écran langue : seul le statut
 * de la première a une source réelle (la commande confirmée déclenche
 * l'e-mail). Les trois autres gardent les statuts de la maquette.
 */
const steps = computed(() => [
  { icon: 'ic-opp-step-mail', tint: 'bg-step-mail-bg', titleKey: 'orientation.confirmation.step1Title', descKey: 'orientation.confirmation.step1Desc', status: confirmed.value ? 'done' : 'todo', strong: true },
  { icon: 'ic-opp-step-tests', tint: 'bg-step-icon-bg', titleKey: 'orientation.confirmation.step2Title', descKey: 'orientation.confirmation.step2Desc', status: 'todo', strong: false },
  { icon: 'ic-opp-step-bilan', tint: 'bg-step-icon-bg', titleKey: 'orientation.confirmation.step3Title', descKey: 'orientation.confirmation.step3Desc', status: 'soon', strong: false },
  { icon: 'ic-opp-step-visio', tint: 'bg-step-icon-bg', titleKey: 'orientation.confirmation.step4Title', descKey: 'orientation.confirmation.step4Desc', status: 'soon', strong: false },
] as const)

/** Calage de la frise verticale — voir `langues/[slug]/paiement-reussi.vue`. */
const stepsList = useTemplateRef<HTMLElement>('stepsList')
const lineInset = ref<{ top: string; bottom: string }>({ top: '10px', bottom: '10px' })

function measureLine(): void {
  const list = stepsList.value
  if (!list) return

  const dots = list.querySelectorAll<HTMLElement>('[data-step-dot]')
  const first = dots[0]
  const last = dots[dots.length - 1]
  if (!first || !last) return

  const listRect = list.getBoundingClientRect()
  const firstRect = first.getBoundingClientRect()
  const lastRect = last.getBoundingClientRect()

  lineInset.value = {
    top: `${firstRect.top + firstRect.height / 2 - listRect.top}px`,
    bottom: `${listRect.bottom - (lastRect.top + lastRect.height / 2)}px`,
  }
}

onMounted(() => {
  measureLine()
  useResizeObserver(stepsList, measureLine)
  if (document.fonts?.ready) document.fonts.ready.then(measureLine)
})

const badgeClass: Record<string, string> = {
  done: 'bg-step-done-bg text-step-done px-10 py-4',
  todo: 'bg-step-todo-bg text-step-num px-12 py-4',
  soon: 'bg-step-todo-bg text-step-num px-12 py-4',
}

usePageSeo(() => ({
  title: t('orientation.confirmation.seoTitle'),
  description: t('orientation.confirmation.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <!-- Rythme vertical porté par le conteneur (`gap: var(--lpp-block-gap)` = 22px). -->
  <div class="flex flex-col gap-22">
    <AppTopBar back :back-to="`/orientation/formules?path=${path}`" :notifications="3" :gap="0" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="orderId === ''"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-20">
          <QSkeleton variant="rect" :height="96" />
          <QSkeleton v-for="index in 4" :key="index" variant="rect" :height="78" />
        </div>
      </template>

      <template #empty>
        <QEmptyState :title="$t('confirmation.orderTitle')" :description="$t('confirmation.missingOrder')">
          <template #action>
            <QButton :to="localePath('/mon-projet')">{{ $t('nav.project') }}</QButton>
          </template>
        </QEmptyState>
      </template>

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

      <!-- Réussite / étapes : réservées au paiement confirmé — sinon
           l'alerte ("échoué"/"en attente") cohabitait avec la grande coche
           verte "Paiement réussi !", un vrai contresens. -->
      <template v-if="confirmed">
        <!-- Réussite -->
        <div class="flex w-full items-center pl-26 max-xs:items-start max-xs:pl-0">
          <div class="relative size-96 shrink-0" aria-hidden="true">
            <span class="absolute -top-4 -left-4 text-base leading-16 text-spark-1">✦</span>
            <span class="absolute top-8 left-[94.48px] text-base leading-16 text-spark-2">✦</span>
            <span class="absolute top-88 left-[70.48px] text-base leading-16 text-spark-3">✦</span>
            <span class="absolute top-76 -left-8 text-base leading-16 text-spark-2">✦</span>
            <div
              class="pointer-events-none absolute -top-[0.86px] -left-[0.86px] size-[97.724px] rounded-full bg-glow opacity-85 blur-[16.287px]"
            />
            <div class="absolute top-8 left-8 flex size-80 items-center justify-center rounded-full bg-white shadow-glow">
              <QIcon name="ic-opp-check" :size="40" />
            </div>
          </div>

          <div class="w-254 shrink-0 pl-16 max-xs:w-auto max-xs:min-w-0 max-xs:flex-1">
            <h1
              class="m-0 text-3xl leading-30 font-semibold tracking-[-0.6px] whitespace-nowrap text-text max-xs:text-exact-16 max-xs:leading-24 max-xs:whitespace-normal"
            >
              {{ $t('orientation.confirmation.title') }}
            </h1>
            <p class="m-0 max-w-238 pt-4 text-sm leading-[17.875px] font-medium whitespace-pre-line text-text">
              {{ $t('orientation.confirmation.subtitle') }}
            </p>
          </div>
        </div>

        <!-- Prochaines étapes -->
        <div class="flex w-full flex-col gap-10">
          <h2 class="m-0 text-xl leading-24 font-semibold text-text">{{ $t('orientation.confirmation.stepsHeading') }}</h2>

          <div ref="stepsList" class="relative flex w-full flex-col gap-10">
            <div
              aria-hidden="true"
              class="pointer-events-none absolute left-10 z-0 -ml-[0.5px] w-1 bg-step-line"
              :style="lineInset"
            />

            <div v-for="(step, index) in steps" :key="step.titleKey" class="relative z-1 flex w-full items-center gap-5">
              <div
                aria-hidden="true"
                data-step-dot
                class="flex size-20 shrink-0 items-center justify-center rounded-full bg-step-num text-sm leading-16 font-medium text-white shadow-xs"
              >
                {{ index + 1 }}
              </div>

              <div
                class="flex min-w-0 flex-1 items-center rounded-xl border border-border-soft bg-white py-17 pr-11 pl-6 shadow-xs max-xs:flex-wrap max-xs:gap-8 max-xs:px-10 max-xs:py-14"
              >
                <div class="flex min-w-0 flex-1 items-center">
                  <span
                    :class="['ml-14 flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-full', step.tint]"
                  >
                    <QIcon :name="step.icon" :size="20" />
                  </span>
                  <div class="min-w-0 flex-1 pr-8 pl-14">
                    <p :class="['m-0 text-sm leading-16', step.strong ? 'font-bold text-step-title-bold' : 'font-semibold text-order-title']">
                      {{ $t(step.titleKey) }}
                    </p>
                    <p class="m-0 pt-2 text-sm leading-15 font-normal text-text">{{ $t(step.descKey) }}</p>
                  </div>
                </div>

                <span
                  :class="[
                    'inline-flex shrink-0 items-center gap-4 rounded-full text-sm leading-15 font-medium whitespace-nowrap max-xs:ml-auto',
                    badgeClass[step.status],
                  ]"
                >
                  <QIcon v-if="step.status === 'done'" name="ic-opp-step-done" :size="12" />
                  {{ $t(`confirmation.status.${step.status}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Assistance : bascule en colonne dès 400px, propre à ce tunnel. -->
      <div
        class="flex min-h-86 w-full items-center justify-between gap-8 rounded-xl bg-surface-2 p-9 max-xs:flex-col max-xs:items-stretch"
      >
        <div class="flex min-w-0 flex-1 items-start gap-11">
          <div class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
            <QIcon name="ic-opp-support" :size="24" />
          </div>
          <div class="min-w-0">
            <p class="m-0 text-base leading-20 font-bold text-text">{{ $t('orientation.confirmation.supportTitle') }}</p>
            <p class="m-0 pt-4 text-xs leading-16 font-normal whitespace-pre-line text-text">
              {{ $t('orientation.confirmation.supportDescription') }}
            </p>
          </div>
        </div>

        <SupportLink
          class="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary-link bg-white px-11 py-9 text-sm leading-16 font-medium whitespace-nowrap text-primary-link no-underline max-xs:w-full max-xs:box-border"
        >
          {{ $t('orientation.confirmation.supportCta') }}
        </SupportLink>
      </div>
    </PageState>
  </div>
</template>
