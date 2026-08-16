<script setup lang="ts">
/**
 * Paiement réussi — **parcours langue** ← `maquette/pwa/pages/langues-post-payment.html`.
 *
 * C'est la dernière marche du tunnel : `/langues` → objectifs → formules →
 * paiement → **ici**.
 *
 * ### Un écran par tunnel, et c'est voulu
 *
 * La maquette livre **deux** pages de succès distinctes :
 * `langues-post-payment.html` (celle-ci) et `paiement-reussi.html`, la
 * générique des domaines d'étude. Elles ne diffèrent pas d'un détail : cinq
 * étapes contre quatre, une frise verticale contre une rangée horizontale, un
 * récapitulatif de formule contre un récapitulatif d'école. Logement et
 * orientation auront les leurs.
 *
 * D'où le chemin `langues/[slug]/paiement-reussi` plutôt qu'un écran unique
 * paramétré : ces pages divergent par leur **contenu**, pas par une option.
 * Le jour où deux tunnels convergent, c'est un composant partagé qu'on
 * extraira — pas un `v-if` de plus.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | shell | `.page-lpp { background: #faf9fe }` — seul écran teinté en entier |
 * | barre supérieure | `padding-bottom: 30px`, retour 24×24, logo 145×45, cloche 49×49 |
 * | réussite | `padding: 8px 0 0 26px` · pastille 96×96 (halo flouté 16,287px, cercle 80×80 à +8/+8) · texte 254px, `padding-left: 16px` |
 * | étapes | frise absolue à 10px, `top`/`bottom` 10px · pastilles 20×20 · cartes `padding: 17px 11px 17px 6px` |
 * | assistance | `min-height: 86px`, `padding: 9px`, fond `#f5f3ff` |
 * | sous 400px | réussite alignée en haut, titre 16px/24px · cartes d'étape enroulées `padding: 14px 10px` |
 *
 * Le récapitulatif de commande (formule, prix, date, numéro, e-mail de
 * confirmation) a été retiré de la maquette — la page ne montre plus que la
 * réussite, la frise des cinq étapes et l'assistance.
 *
 * ### Ce que la maquette invente, et ce qu'on en fait
 *
 * | Maquette | Réel | Décision |
 * |---|---|---|
 * | 5 étapes avec statuts | seule la première a une source (l'e-mail part avec la commande) | étape 1 « Terminé », les autres gardent les statuts de la maquette — voir LOT-5.md |
 * | pastille de notification « 3 » | aucun compteur exposé | pas de pastille |
 *
 * ### Les quatre états
 *
 * **Chargement** — squelettes calés sur la réussite et les cinq étapes.
 * **Erreur** — `PageState` ; le retour de Stripe peut échouer.
 * **Vide** — aucun identifiant de commande dans l'URL : message explicite avec
 * un renvoi vers « Mon projet », plutôt qu'une page de succès mensongère.
 * **Nominal** — et ses deux variantes : paiement refusé, paiement en attente.
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({
  // `.page-lpp { background: #faf9fe }`
  shellBackground: 'tint',
  // La commande appartient à un compte : sans session, il n'y a rien à montrer.
  middleware: 'auth',
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))
/** Stripe renvoie l'identifiant de commande dans l'URL. */
const orderId = computed(() => {
  const raw = route.query.order_id ?? route.query.orderId
  return typeof raw === 'string' ? raw : ''
})

const { data: validation, apiError, isInitialLoading, refresh } = await usePageData(
  `payment-validation-${orderId.value}`,
  () => (orderId.value === '' ? Promise.resolve(null) : paymentRepo.validate(orderId.value, locale.value)),
  { watch: [orderId, locale] },
)

const confirmed = computed(() => validation.value?.confirmed === true)
const failed = computed(() => validation.value?.failed === true)

/**
 * Les cinq étapes.
 *
 * Seul le statut de la première est **réel** : la commande confirmée déclenche
 * l'envoi de l'e-mail. Les quatre autres relèvent de modules (test de niveau,
 * choix de professeur, planning, visio) que l'API n'expose pas encore ; leurs
 * statuts sont ceux de la maquette, et le resteront jusqu'à ce qu'un endpoint
 * les décrive.
 */
const steps = computed(() => [
  { icon: 'ic-lpp-step-mail', tint: 'bg-step-mail-bg', size: 20, titleKey: 'confirmation.step1Title', descKey: 'confirmation.step1Desc', status: confirmed.value ? 'done' : 'todo', strong: true },
  { icon: 'ic-lpp-step-tests', tint: 'bg-step-icon-bg', size: 20, titleKey: 'confirmation.step2Title', descKey: 'confirmation.step2Desc', status: 'todo', strong: false },
  { icon: 'ic-lpp-step-prof', tint: 'bg-step-icon-bg', size: 20, titleKey: 'confirmation.step3Title', descKey: 'confirmation.step3Desc', status: 'soon', strong: false },
  // La maquette rend l'icône calendrier à 44×44, sans pastille de fond.
  { icon: 'ic-lpp-step-calendar', tint: 'bg-transparent', size: 44, titleKey: 'confirmation.step4Title', descKey: 'confirmation.step4Desc', status: 'soon', strong: false },
  { icon: 'ic-lpp-step-visio', tint: 'bg-step-icon-bg', size: 20, titleKey: 'confirmation.step5Title', descKey: 'confirmation.step5Desc', status: 'soon', strong: false },
] as const)

/**
 * Calage de la frise verticale.
 *
 * La maquette la positionne **en JavaScript** (`updateLppLine`) : elle part du
 * centre de la première pastille et s'arrête au centre de la dernière. Un
 * `top: 10px / bottom: 10px` en CSS ne donne le bon résultat que si les cartes
 * font toutes la hauteur d'une pastille — ce qui est faux dès que le texte
 * passe à la ligne, donc dès 375px de large.
 *
 * On reprend donc la même mécanique, avec un `ResizeObserver` là où la maquette
 * se contente d'un écouteur `resize` : les cartes changent aussi de hauteur
 * quand la police finit de charger.
 */
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
  // Les cartes grandissent quand Jost remplace la police de repli.
  useResizeObserver(stepsList, measureLine)
  if (document.fonts?.ready) document.fonts.ready.then(measureLine)
})

const badgeClass: Record<string, string> = {
  done: 'bg-step-done-bg text-step-done px-10 py-4',
  todo: 'bg-step-todo-bg text-step-num px-12 py-4',
  soon: 'bg-step-todo-bg text-step-num px-12 py-4',
}

usePageSeo(() => ({
  title: t('confirmation.seoTitle'),
  description: t('confirmation.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div>
    <AppTopBar back :back-to="`/offres/${slug}`" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="orderId === ''"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-20">
          <QSkeleton variant="rect" :height="96" />
          <QSkeleton v-for="index in 5" :key="index" variant="rect" :height="78" />
        </div>
      </template>

      <template #empty>
        <QEmptyState :title="$t('confirmation.orderTitle')" :description="$t('confirmation.missingOrder')">
          <template #action>
            <QButton :to="localePath('/mon-projet')">{{ $t('nav.project') }}</QButton>
          </template>
        </QEmptyState>
      </template>

      <!-- Paiement refusé : la maquette ne prévoit rien, mais il faut le dire. -->
      <QAlert
        v-if="failed"
        tone="danger"
        :title="$t('confirmation.failedTitle')"
        :message="$t('confirmation.failedDescription')"
        class="mb-20"
      />
      <QAlert
        v-else-if="!confirmed"
        tone="warning"
        :title="$t('confirmation.pendingTitle')"
        :message="$t('confirmation.pendingDescription')"
        class="mb-20"
      />

      <!-- Réussite -->
      <div class="flex w-full items-center pt-8 pl-26 max-xs:items-start max-xs:pl-0">
        <div class="relative size-96 shrink-0" aria-hidden="true">
          <span class="absolute -top-4 -left-4 text-base leading-16 text-spark-1">✦</span>
          <span class="absolute top-8 left-[94.48px] text-base leading-16 text-spark-2">✦</span>
          <span class="absolute top-88 left-[70.48px] text-base leading-16 text-spark-3">✦</span>
          <span class="absolute top-76 -left-8 text-base leading-16 text-spark-2">✦</span>
          <div
            class="pointer-events-none absolute -top-[0.86px] -left-[0.86px] size-[97.724px] rounded-full bg-glow opacity-85 blur-[16.287px]"
          />
          <div class="absolute top-8 left-8 flex size-80 items-center justify-center rounded-full bg-white shadow-glow">
            <QIcon name="ic-lpp-check" :size="40" />
          </div>
        </div>

        <div class="w-254 shrink-0 pl-16 max-xs:w-auto max-xs:min-w-0 max-xs:flex-1">
          <h1
            class="m-0 text-3xl leading-30 font-semibold tracking-[-0.6px] whitespace-nowrap text-text max-xs:text-exact-16 max-xs:leading-24 max-xs:whitespace-normal"
          >
            {{ $t('confirmation.title') }}
          </h1>
          <p class="m-0 max-w-238 pt-4 text-sm leading-[17.875px] font-medium whitespace-pre-line text-text">
            {{ $t('confirmation.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Prochaines étapes -->
      <div class="flex w-full flex-col gap-10 py-20">
        <h2 class="m-0 text-xl leading-24 font-semibold text-text">{{ $t('confirmation.stepsHeading') }}</h2>

        <div ref="stepsList" class="relative flex w-full flex-col gap-10">
          <!-- Frise verticale, calée sur le centre des pastilles extrêmes —
               voir `measureLine`. Les valeurs CSS de repli (10px) sont celles
               de la maquette avant l'exécution de son script : c'est aussi ce
               que voit un visiteur sans JavaScript. -->
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
                  <QIcon :name="step.icon" :size="step.size" />
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
                <QIcon v-if="step.status === 'done'" name="ic-lpp-step-done" :size="12" />
                {{ $t(`confirmation.status.${step.status}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assistance -->
      <div
        class="flex min-h-86 w-full items-center justify-between gap-8 rounded-xl bg-surface-2 p-9 max-xs:flex-wrap"
      >
        <div class="flex min-w-0 flex-1 items-start gap-11">
          <div class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
            <QIcon name="ic-lpp-support" :size="24" />
          </div>
          <div class="min-w-0">
            <p class="m-0 text-base leading-20 font-bold text-text">{{ $t('confirmation.supportTitle') }}</p>
            <p class="m-0 pt-4 text-xs leading-16 font-normal whitespace-pre-line text-text">
              {{ $t('confirmation.supportDescription') }}
            </p>
          </div>
        </div>

        <SupportLink
          class="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary-link bg-white px-11 py-9 text-sm leading-16 font-medium whitespace-nowrap text-primary-link no-underline"
        >
          {{ $t('confirmation.supportCta') }}
        </SupportLink>
      </div>
    </PageState>
  </div>
</template>
