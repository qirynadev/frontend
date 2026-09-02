<script setup lang="ts">
/**
 * Paiement réussi — **tunnel orientation**.
 *
 * Layout aligné sur `/paiement-reussi` (tunnel domaines) : illustration,
 * bienvenue, frise horizontale, aide. Les titres d’étapes restent ceux du
 * parcours orientation (4 étapes éditoriales).
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

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

const steps = [
  { icon: 'ic-paiement-step1', tone: 'bg-paiement-step-1', titleKey: 'orientation.confirmation.step1Title' },
  { icon: 'ic-paiement-step2', tone: 'bg-paiement-step-2', titleKey: 'orientation.confirmation.step2Title' },
  { icon: 'ic-paiement-step3', tone: 'bg-success', titleKey: 'orientation.confirmation.step3Title' },
  { icon: 'ic-paiement-step4', tone: 'bg-paiement-step-4', titleKey: 'orientation.confirmation.step4Title' },
] as const

usePageSeo(() => ({
  title: t('orientation.confirmation.seoTitle'),
  description: t('orientation.confirmation.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="flex flex-col gap-22">
    <AppTopBar back :back-to="`/orientation/formules?path=${path}`" :gap="0" />

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

      <template v-if="confirmed">
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
            {{ $t('orientation.confirmation.title') }}
          </h1>

          <div class="pt-8 text-center text-xl leading-normal font-normal whitespace-pre-line text-text">
            {{ $t('orientation.confirmation.subtitle') }}
          </div>
        </div>

        <div>
          <div class="flex items-start gap-16 rounded-xl border border-welcome-border bg-welcome-bg px-10 py-21">
            <QIcon name="ic-gift" :size="44" />
            <div class="min-w-0">
              <p class="m-0 text-base leading-20 font-bold text-text">
                {{ $t('orientation.confirmation.welcomeTitle') }}
              </p>
              <p class="mt-4 mb-0 text-sm leading-16 font-normal text-text">
                {{ $t('orientation.confirmation.welcomeDescription') }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">
            {{ $t('orientation.confirmation.stepsHeading') }}
          </h2>

          <div class="relative flex min-h-150 items-start pt-10">
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

      <div>
        <div class="relative flex min-h-91 items-center justify-between gap-8 rounded-xl bg-surface-2 p-9">
          <div class="flex min-w-0 flex-1 items-start gap-11 pr-120 max-[375.02px]:pr-0 max-[375.02px]:pb-44">
            <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
              <QIcon name="ic-headset2" :size="24" />
            </span>
            <div class="min-w-0">
              <p class="m-0 text-md leading-20 font-bold text-text">{{ $t('orientation.confirmation.supportTitle') }}</p>
              <p class="mt-4 mb-0 text-sm leading-16 font-normal whitespace-pre-line text-text">
                {{ $t('orientation.confirmation.supportDescription') }}
              </p>
            </div>
          </div>

          <SupportLink
            class="absolute top-1/2 right-9 inline-flex shrink-0 -translate-y-1/2 items-center gap-6 rounded-lg bg-primary-btn px-14 py-8 text-sm leading-16 font-medium whitespace-nowrap text-white no-underline max-[375.02px]:top-auto max-[375.02px]:bottom-9 max-[375.02px]:translate-y-0"
          >
            {{ $t('orientation.confirmation.supportCta') }}
            <QIcon name="ic-btn-arrow" :size="8" :height="7" />
          </SupportLink>
        </div>
      </div>
    </PageState>
  </div>
</template>
