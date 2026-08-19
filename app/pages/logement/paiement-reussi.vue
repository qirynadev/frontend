<script setup lang="ts">
/**
 * Logement — après paiement ← `maquette/pwa/pages/logement-post-paiement.html`
 * (`.page-lp`, `.lp-*`, en-tête partagée avec `formule.html`).
 *
 * ⚠️ **Malgré son nom, cet écran n'a rien d'une confirmation de paiement.**
 * Envoyé par e-mail avec la confirmation d'achat, c'est le tableau de bord
 * où le client complète ses préférences de logement (deux onglets, un
 * récapitulatif de la formule achetée, un formulaire de 8 champs) — confirmé
 * par le responsable. Il chevauche `mon-projet/logement.vue` (même sujet,
 * chronologie différente) : les deux coexistent, atteints par des chemins
 * différents.
 *
 * **Commande réelle depuis 2026-08-17** — comme `orientation/paiement-reussi.vue`
 * et `langues/[slug]/paiement-reussi.vue`, l'écran attend `?order_id=` (renvoyé
 * par Stripe) et valide la commande via `paymentRepo.validate` avant
 * d'afficher quoi que ce soit : auparavant il lisait `pays`/`formule` dans
 * l'URL et affichait le formulaire sans jamais vérifier qu'une commande avait
 * été payée. La formule achetée (`order.offer`) vient de `toOrderOffer` — même
 * mécanisme générique que les autres tunnels, aucun champ propre au logement à
 * ajouter côté adapter.
 *
 * Le formulaire de préférences reste un no-op côté client : aucun endpoint ne
 * l'expose encore (voir la mémoire projet — `ClientDataController` existe côté
 * API pour ce cas, mais n'a pas été câblé ici, hors du périmètre de cette
 * correction). Comportement inchangé, comme la maquette elle-même.
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

/** Stripe renvoie l'identifiant de commande dans l'URL. */
const orderId = computed(() => {
  const raw = route.query.order_id ?? route.query.orderId
  return typeof raw === 'string' ? raw : ''
})

const { data: validation, apiError, isInitialLoading, refresh } = await usePageData(
  `logement-payment-validation-${orderId.value}`,
  () => (orderId.value === '' ? Promise.resolve(null) : paymentRepo.validate(orderId.value, locale.value)),
  { watch: [orderId, locale] },
)

const confirmed = computed(() => validation.value?.confirmed === true)
const failed = computed(() => validation.value?.failed === true)
const order = computed(() => validation.value?.order ?? null)
const offer = computed(() => order.value?.offer ?? null)

/** Retour vers la bonne destination : `Order.serviceSlug` la porte déjà. */
const backTo = computed(() => (order.value?.serviceSlug ? `/logement/${order.value.serviceSlug}` : '/logement'))

const paidOnDate = computed(() => {
  if (!order.value?.createdAt) return null
  const date = new Date(order.value.createdAt)
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
})

type TabId = 'apercu' | 'formule'
const activeTab = ref<TabId>('formule')

onMounted(() => {
  const fromQuery = route.query.tab
  if (fromQuery === 'apercu' || fromQuery === 'formule') activeTab.value = fromQuery
})

function setTab(tab: TabId) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab: tab === 'formule' ? undefined : tab } })
}

const form = reactive({
  arrivee: '',
  budget: '',
  ecole: '',
  ville: '',
  duree: '',
  type: '',
  occupants: '',
  preferences: '',
})

/** La maquette n'envoie ce formulaire nulle part : même comportement ici. */
function onSubmit() {}

usePageSeo(() => ({
  title: t('logementConfirmation.seoTitle'),
  description: t('logementConfirmation.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div>
    <AppTopBar back :back-to="backTo" :notifications="3" :gap="0" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="orderId === ''"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="mt-22 flex flex-col gap-20">
          <QSkeleton variant="rect" :height="96" />
          <QSkeleton variant="rect" :height="180" />
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
        class="mt-22"
      />
      <QAlert
        v-else-if="!confirmed"
        tone="warning"
        :title="$t('confirmation.pendingTitle')"
        :message="$t('confirmation.pendingDescription')"
        class="mt-22"
      />

      <!-- Progression / onglets / formulaire : réservés au paiement confirmé
           — sinon l'alerte ("échoué"/"en attente") cohabitait avec "75 %
           terminé" et "Payé le [date]", un vrai contresens. -->
      <template v-if="confirmed">
      <!-- Progression -->
      <section class="mt-22 box-border w-full rounded-xl border border-lp-progress-border bg-white p-17">
        <div class="flex items-start justify-between gap-12">
          <div class="min-w-0 flex-1">
            <h1 class="m-0 text-exact-16 leading-25 font-semibold text-text">{{ $t('logementConfirmation.progressTitle') }}</h1>
            <p class="m-0 text-md leading-[17px] font-normal text-slate">{{ $t('logementConfirmation.progressDesc') }}</p>
          </div>
          <div class="flex shrink-0 flex-col items-end">
            <span class="text-3xl leading-26 font-bold text-lp-progress-num">75%</span>
            <span class="text-sm leading-11 font-medium text-muted">{{ $t('logementConfirmation.progressDone') }}</span>
          </div>
        </div>
        <div class="mt-12 h-6 w-full overflow-hidden rounded-full bg-border-slate" aria-hidden="true">
          <span class="block h-full w-3/4 rounded-full bg-lp-progress-num" />
        </div>
      </section>

      <!-- Onglets -->
      <div role="tablist" :aria-label="$t('logementConfirmation.progressTitle')" class="mt-22 flex w-full border-b border-border-slate">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'apercu'"
          :class="['flex flex-1 items-center justify-center gap-8 border-0 border-b-2 bg-transparent py-10 px-8 text-base leading-20 font-medium', activeTab === 'apercu' ? 'border-lp-tab-active text-lp-tab-active' : 'border-transparent text-muted']"
          @click="setTab('apercu')"
        >
          <img :src="`/img/icons/ic-lp-tab-eye${activeTab === 'apercu' ? '-active' : ''}.svg`" alt="" width="16" height="16" class="block shrink-0">
          <span>{{ $t('logementConfirmation.tabApercu') }}</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'formule'"
          :class="['flex flex-1 items-center justify-center gap-8 border-0 border-b-2 bg-transparent py-10 px-8 text-base leading-20 font-medium', activeTab === 'formule' ? 'border-lp-tab-active text-lp-tab-active' : 'border-transparent text-muted']"
          @click="setTab('formule')"
        >
          <img :src="`/img/icons/ic-lp-tab-calendar${activeTab === 'formule' ? '-active' : ''}.svg`" alt="" width="14" height="16" class="block shrink-0">
          <span>{{ $t('logementConfirmation.tabFormule') }}</span>
        </button>
      </div>

      <!-- Aperçu -->
      <div v-if="activeTab === 'apercu'" class="mt-22 w-full">
        <div class="box-border w-full rounded-xl border border-lp-apercu-border bg-lp-apercu-bg px-16 py-20">
          <p class="m-0 mb-6 text-xl font-bold text-text">{{ $t('logementConfirmation.apercuTitle') }}</p>
          <!-- Le fragment en gras vit dans le gabarit : aucune balise ne doit
               entrer dans un message i18n (le plugin rejetterait la locale). -->
          <p class="m-0 text-base leading-18 text-lp-offer-desc">
            {{ $t('logementConfirmation.apercuDescBefore') }}<strong>{{ $t('logementConfirmation.apercuDescTab') }}</strong>{{ $t('logementConfirmation.apercuDescAfter') }}
          </p>
        </div>
      </div>

      <!-- Formule achetée -->
      <div v-else class="mt-22 flex w-full flex-col gap-22">
        <article v-if="offer" class="box-border w-full rounded-xl border border-lp-offer-border bg-white p-17">
          <div class="flex items-start justify-between gap-8">
            <div class="flex min-w-0 flex-1 gap-12">
              <div class="flex size-80 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-lp-feature-bg">
                <NuxtImg v-if="offer.icon" :src="offer.icon" alt="" width="80" height="80" format="webp" class="size-full object-cover" />
                <QIcon v-else name="ic-log-home" :size="40" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="m-0 text-4xl leading-23 font-bold text-text">{{ offer.title }}</p>
                <p v-if="offer.description" class="m-0 mt-4 text-sm leading-14 font-normal text-lp-offer-desc">
                  {{ offer.description }}
                </p>
              </div>
            </div>
            <div class="flex min-w-98 shrink-0 flex-col items-end">
              <p class="m-0 text-4xl leading-22 font-bold text-right text-lp-price">{{ $n(order?.price.amount ?? 0, 'currency') }}</p>
              <p class="m-0 mt-4 text-md leading-[16.5px] font-medium text-right text-muted">{{ $t('logementConfirmation.offerPeriod') }}</p>
              <span v-if="paidOnDate" class="mt-4 inline-flex rounded-md bg-lp-paid-bg px-5 py-3 text-2xs leading-16 font-medium whitespace-nowrap text-lp-paid">
                {{ $t('logementConfirmation.offerPaidOn', { date: paidOnDate }) }}
              </span>
            </div>
          </div>

          <div v-if="offer.features.length > 0" class="mt-16 flex flex-wrap items-start justify-center gap-x-4 gap-y-8 border-t border-border-soft pt-9">
            <div v-for="feature in offer.features" :key="feature" class="box-border flex w-63 flex-col items-center gap-4 p-4 text-center">
              <span class="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-lp-feature-bg">
                <QIcon name="ic-lp-feat-house" :size="14" />
              </span>
              <span class="text-2xs leading-[11.875px] font-medium text-lp-feature-label">{{ feature }}</span>
            </div>
          </div>
        </article>

        <div class="w-full">
          <h2 class="m-0 text-xl leading-[27.5px] font-bold text-black">{{ $t('logementConfirmation.helpIntroTitle') }}</h2>
          <p class="m-0 mt-2 text-base leading-[18.563px] font-normal text-rg-row-desc">{{ $t('logementConfirmation.helpIntroDesc') }}</p>
        </div>

        <form class="flex w-full flex-col gap-10" @submit.prevent="onSubmit">
          <div class="flex w-full gap-6 max-2xs:flex-col">
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-date.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldArrivalLabel') }}</span>
                <input v-model="form.arrivee" type="date" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none" :aria-label="$t('logementConfirmation.fieldArrivalLabel')">
              </span>
              <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
            </label>
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-budget.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">
                  {{ $t('logementConfirmation.fieldBudgetLabel') }} <small class="text-md font-medium text-lp-field-hint">{{ $t('logementConfirmation.fieldBudgetSub') }}</small>
                </span>
                <input v-model="form.budget" type="text" :placeholder="$t('logementConfirmation.fieldBudgetPlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
              </span>
            </label>
          </div>

          <div class="flex w-full gap-6 max-2xs:flex-col">
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-school.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldSchoolLabel') }}</span>
                <input v-model="form.ecole" type="text" :placeholder="$t('logementConfirmation.fieldSchoolPlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
              </span>
              <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
            </label>
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-city.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldCityLabel') }}</span>
                <input v-model="form.ville" type="text" :placeholder="$t('logementConfirmation.fieldCityPlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
              </span>
              <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
            </label>
          </div>

          <div class="flex w-full gap-6 max-2xs:flex-col">
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-duree.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldDurationLabel') }}</span>
                <input v-model="form.duree" type="text" :placeholder="$t('logementConfirmation.fieldDurationPlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
              </span>
              <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
            </label>
            <label class="box-border flex flex-1 min-w-0 cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
              <img src="/img/icons/ic-lp-field-type.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
              <span class="flex min-w-0 flex-1 flex-col gap-2">
                <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldTypeLabel') }}</span>
                <input v-model="form.type" type="text" :placeholder="$t('logementConfirmation.fieldTypePlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
              </span>
              <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
            </label>
          </div>

          <label class="box-border flex w-full cursor-text items-center gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
            <img src="/img/icons/ic-lp-field-people.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col gap-2">
              <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldOccupantsLabel') }}</span>
              <input v-model="form.occupants" type="text" :placeholder="$t('logementConfirmation.fieldOccupantsPlaceholder')" class="w-full border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted">
            </span>
            <img src="/img/icons/ic-lp-field-chevron.svg" alt="" width="12" height="12" class="block size-12 shrink-0 rotate-90 opacity-85">
          </label>

          <label class="box-border flex min-h-125 w-full cursor-text items-start gap-12 rounded-xl border border-lp-field-border bg-white py-14 px-12">
            <img src="/img/icons/ic-lp-field-pref.svg" alt="" width="28" height="28" class="block size-28 shrink-0">
            <span class="relative flex min-w-0 flex-1 flex-col gap-2">
              <span class="text-base leading-16 font-medium tracking-wide text-lp-field-label">{{ $t('logementConfirmation.fieldPreferencesLabel') }}</span>
              <textarea
                v-model="form.preferences"
                maxlength="300"
                rows="3"
                :placeholder="$t('logementConfirmation.fieldPreferencesPlaceholder')"
                class="mt-4 min-h-48 w-full resize-none border-0 bg-transparent p-0 text-xl leading-20 font-medium text-text outline-none placeholder:font-normal placeholder:text-muted"
              />
              <span class="mt-4 self-end text-md text-muted">{{ form.preferences.length }}/300</span>
            </span>
          </label>

          <button type="submit" class="mt-10 flex w-full items-center justify-center gap-10 rounded-xl border-0 bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white">
            <span>{{ $t('logementConfirmation.ctaSubmit') }}</span>
            <img src="/img/icons/ic-lp-cta-arrow.svg" alt="" width="20" height="20" class="block shrink-0">
          </button>
        </form>
      </div>
      </template>
    </PageState>
  </div>
</template>
