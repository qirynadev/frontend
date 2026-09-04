<script setup lang="ts">
/**
 * Mot de passe oublié desktop ← Figma `576:38`.
 * Split identique à connexion (772 / hero) · trust bar 3 étapes.
 */
defineProps<{
  step: 'request' | 'reset'
  email: string
  code: string
  password: string
  submitting: boolean
  formError: string | null
  notice: string | null
  fieldErrors: Record<string, string[]>
  score: number
  strengthHint: string
  strengthTone: 'neutral' | 'error' | 'ok'
}>()

const emit = defineEmits<{
  'update:email': [value: string]
  'update:code': [value: string]
  'update:password': [value: string]
  request: []
  reset: []
}>()

const localePath = useLocalePath()

const trustItems = [
  {
    icon: '/img/desktop/auth/reset-trust-step1.svg',
    titleKey: 'desktop.reset.trust1Title',
    descKey: 'desktop.reset.trust1Desc',
  },
  {
    icon: '/img/desktop/auth/reset-trust-step2.svg',
    titleKey: 'desktop.reset.trust2Title',
    descKey: 'desktop.reset.trust2Desc',
  },
  {
    icon: '/img/desktop/auth/reset-trust-step3.svg',
    titleKey: 'desktop.reset.trust3Title',
    descKey: 'desktop.reset.trust3Desc',
  },
] as const
</script>

<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
    <!-- 576:64 — panneau gauche 772 -->
    <section
      class="box-border flex h-full w-full flex-col overflow-y-auto bg-white pb-48 pl-48 pr-31 pt-0 lg:w-772 lg:shrink-0"
    >
      <div class="flex w-full flex-col gap-41 pl-[clamp(0px,6.36vw,110px)] pt-39">
        <div class="w-full pt-32">
          <!-- 583:835 — retour connexion -->
          <NuxtLink
            :to="localePath('/connexion')"
            class="mb-30 inline-flex items-center gap-8 pb-30 text-base leading-16 font-bold text-black no-underline"
          >
            <img
              src="/img/desktop/auth/reset-back-arrow.svg"
              alt=""
              width="16"
              height="16"
              class="block size-16 shrink-0"
            >
            {{ $t('desktop.reset.backToLogin') }}
          </NuxtLink>

          <h1 class="m-0 text-[43px] leading-40 font-semibold text-black">
            {{ $t('desktop.reset.titleLine1') }}
            <span class="block text-[#fd1d36]">{{ $t('desktop.reset.titleAccent') }}</span>
          </h1>
          <p class="m-0 pt-12 text-exact-16 leading-[19.5px] font-medium text-black">
            {{ $t('desktop.reset.descLine1') }}
            <span class="block">{{ $t('desktop.reset.descLine2') }}</span>
          </p>
        </div>

        <QAlert
          v-if="formError"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="formError"
        />

        <QAlert v-if="notice" tone="success" :message="notice" />

        <!-- Étape 1 — demande du code -->
        <div v-if="step === 'request'" class="flex w-full flex-col gap-22">
          <form class="flex w-full flex-col gap-18" novalidate @submit.prevent="emit('request')">
            <div class="flex flex-col gap-10 pb-10">
              <p class="m-0 text-xl leading-15 font-semibold tracking-[0.5px] text-black">
                {{ $t('desktop.reset.emailTitle') }}
              </p>
              <QInput
                :model-value="email"
                type="email"
                icon="ic-email"
                :icon-width="16.25"
                :icon-height="12.5"
                :icon-bleed="0.6"
                :placeholder="$t('desktop.reset.emailPlaceholder')"
                :error="fieldErrors.email?.[0]"
                :disabled="submitting"
                autocomplete="email"
                name="email"
                @update:model-value="emit('update:email', $event)"
              />
            </div>

            <div class="flex flex-col gap-22">
              <button
                type="submit"
                :disabled="submitting"
                class="flex w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QSpinner v-if="submitting" size="sm" class="text-white" />
                <span v-else>{{ $t('desktop.reset.submit') }}</span>
              </button>

              <div class="flex items-center">
                <span aria-hidden="true" class="h-px flex-1 bg-[#e3e5ef]" />
                <span class="px-14 text-base leading-16 font-semibold text-[#646b8c] uppercase">{{ $t('auth.or') }}</span>
                <span aria-hidden="true" class="h-px flex-1 bg-[#e3e5ef]" />
              </div>

              <!-- 576:304 — encart aide -->
              <div class="box-border flex items-center justify-between rounded-[10px] bg-[#f7f3f7] px-19 py-20">
                <div class="flex min-w-0 flex-1 items-start gap-16">
                  <img
                    src="/img/desktop/auth/reset-help-headset.svg"
                    alt=""
                    width="44"
                    height="44"
                    class="block size-44 shrink-0"
                  >
                  <div class="min-w-0">
                    <p class="m-0 text-base leading-20 font-bold text-[#191919]">
                      {{ $t('desktop.reset.helpTitle') }}
                    </p>
                    <p class="m-0 pt-4 text-sm leading-16 font-normal text-[#191919]">
                      {{ $t('desktop.reset.helpDesc') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <p class="m-0 flex items-center gap-8 text-lg leading-16 font-medium text-[#535a83]">
            <QIcon name="ic-shield" :size="16" />
            {{ $t('desktop.reset.secureNote') }}
          </p>
        </div>

        <!-- Étape 2 — code + nouveau mot de passe -->
        <div v-else class="flex w-full flex-col gap-22">
          <form class="w-full" novalidate @submit.prevent="emit('reset')">
            <div class="flex flex-col gap-18">
              <QInput
                :model-value="code"
                icon="ic-email"
                :icon-width="16.25"
                :icon-height="12.5"
                :icon-bleed="0.6"
                :label="$t('auth.reset.codeLabel')"
                :placeholder="$t('auth.reset.codePlaceholder')"
                :error="fieldErrors.code?.[0]"
                :disabled="submitting"
                inputmode="numeric"
                autocomplete="one-time-code"
                name="code"
                @update:model-value="emit('update:code', $event)"
              />

              <div>
                <div class="pb-10">
                  <QInput
                    :model-value="password"
                    type="password"
                    icon="ic-lock"
                    :icon-width="12.5"
                    :icon-height="16.25"
                    :icon-bleed="0.6"
                    :label="$t('auth.reset.newPasswordLabel')"
                    :placeholder="$t('auth.passwordPlaceholder')"
                    :state="password === '' ? 'default' : strengthTone === 'ok' ? 'valid' : 'invalid'"
                    :error="fieldErrors.password?.[0]"
                    :disabled="submitting"
                    autocomplete="new-password"
                    name="password"
                    revealable
                    @update:model-value="emit('update:password', $event)"
                  />
                </div>
                <QPasswordStrength :score="score" :hint="strengthHint" :hint-tone="strengthTone" />
              </div>

              <button
                type="submit"
                :disabled="submitting"
                class="flex w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QSpinner v-if="submitting" size="sm" class="text-white" />
                <span v-else>{{ $t('auth.reset.submitNew') }}</span>
              </button>
            </div>
          </form>

          <p class="m-0 flex items-center gap-8 text-lg leading-16 font-medium text-[#535a83]">
            <QIcon name="ic-shield" :size="16" />
            {{ $t('desktop.reset.secureNote') }}
          </p>
        </div>
      </div>
    </section>

    <!-- 1146:778 — panneau droit hero -->
    <aside
      class="relative hidden h-full min-h-0 flex-1 items-stretch pr-[clamp(24px,8.68vw,150px)] lg:flex"
    >
      <div
        class="relative min-h-0 min-w-0 flex-1 overflow-hidden border-l border-[#f1f5f9] bg-[#f8fafc]"
      >
        <div class="absolute inset-0 overflow-hidden opacity-85">
          <img
            src="/img/desktop/auth/mot-de-passe-hero.jpg"
            alt=""
            class="absolute inset-0 size-full object-cover object-center"
          >
        </div>

        <!-- 576:150 — trust bar 3 étapes (hauteur fluide) -->
        <div class="absolute inset-x-0 bottom-0 flex justify-center px-48 pb-48">
          <div
            class="box-border flex w-full min-h-0 items-stretch justify-center gap-[clamp(8px,1.2vw,16px)] rounded-[10px] border border-[#f1f5f9] bg-white px-[clamp(8px,1vw,13px)] py-[clamp(8px,0.9vw,11px)] shadow-[0_0_3.5px_rgba(0,0,0,0.15)]"
          >
            <template v-for="(item, index) in trustItems" :key="item.titleKey">
              <div
                v-if="index > 0"
                class="w-px shrink-0 self-stretch bg-[#e6e5f5]"
                aria-hidden="true"
              />
              <div class="flex min-w-0 flex-1 items-center gap-[clamp(6px,0.8vw,10px)]">
                <img
                  :src="item.icon"
                  alt=""
                  width="40"
                  height="40"
                  class="block size-[clamp(28px,3.2vw,40px)] shrink-0"
                >
                <div class="min-w-0 text-[clamp(9px,0.75vw,11px)] leading-[1.2] text-black">
                  <p class="m-0 font-semibold">{{ $t(item.titleKey) }}</p>
                  <p class="m-0 pt-[clamp(2px,0.4vw,6px)] font-normal">{{ $t(item.descKey) }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
