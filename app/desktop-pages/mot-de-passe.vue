<script setup lang="ts">
/**
 * Mot de passe oublié desktop — même split que `/connexion` et `/inscription`.
 * Formulaire à gauche, hero à droite, trust bar identique.
 */
defineProps<{
  step: 'request' | 'reset'
  email: string
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
  'update:password': [value: string]
  request: []
  reset: []
  /** Lien expiré ou perdu : revenir à la demande d'un nouveau lien. */
  restart: []
}>()

const localePath = useLocalePath()

const trustItems = [
  { icon: '/img/desktop/auth/trust-secure.svg', labelKey: 'desktop.auth.trust1' },
  { icon: '/img/desktop/auth/trust-support.svg', labelKey: 'desktop.auth.trust2' },
  { icon: '/img/desktop/auth/trust-studies.svg', labelKey: 'desktop.auth.trust3' },
] as const
</script>

<template>
  <div class="desktop-canvas flex min-h-0 flex-row overflow-hidden">
    <section
      class="box-border flex h-full w-[calc(var(--q-desktop-gutter)+680px)] shrink-0 flex-col overflow-y-auto bg-white pb-48 pr-32 pl-[var(--q-desktop-gutter)] pt-0"
    >
      <div class="flex w-full flex-col gap-7 pt-39">
        <div class="w-full pt-32">
          <NuxtLink
            :to="localePath('/connexion')"
            class="mb-30 inline-flex items-center gap-8 text-base leading-16 font-bold text-black no-underline"
          >
            <img
              src="/img/desktop/auth/reset-back-arrow.svg"
              alt=""
              width="16"
              height="16"
              class="block size-16 shrink-0"
              loading="lazy"
              decoding="async"
            >
            {{ $t('desktop.reset.backToLogin') }}
          </NuxtLink>

          <h1 class="m-0 pt-30 text-[43px] leading-40 font-semibold text-black">
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
          class="mt-24"
        />

        <QAlert v-if="notice" tone="success" :message="notice" class="mt-24" />

        <form
          v-if="step === 'request'"
          class="w-full pt-24"
          novalidate
          @submit.prevent="emit('request')"
        >
          <BotTrap />
          <div class="flex flex-col gap-18">
            <div class="flex flex-col gap-16">
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

            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center gap-8 rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <template v-else>
                <span>{{ $t('desktop.reset.submit') }}</span>
                <span aria-hidden="true">→</span>
              </template>
            </button>
          </div>
        </form>

        <form
          v-else
          class="w-full pt-24"
          novalidate
          @submit.prevent="emit('reset')"
        >
          <div class="flex flex-col gap-18">
            <!-- Étape 2 : nouveau mot de passe, ouverte par le lien de l'e-mail (plus de code à saisir). -->
            <div>
              <QInput
                :model-value="password"
                type="password"
                icon="ic-lock"
                :icon-width="12.5"
                :icon-height="16.25"
                :icon-bleed="0.6"
                :placeholder="$t('auth.passwordPlaceholder')"
                :state="password === '' ? 'default' : strengthTone === 'ok' ? 'valid' : 'invalid'"
                :error="fieldErrors.password?.[0]"
                :disabled="submitting"
                autocomplete="new-password"
                name="password"
                revealable
                @update:model-value="emit('update:password', $event)"
              />
              <QPasswordStrength class="pt-10" :score="score" :hint="strengthHint" :hint-tone="strengthTone" />
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center gap-8 rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <template v-else>
                <span>{{ $t('auth.reset.submitNew') }}</span>
                <span aria-hidden="true">→</span>
              </template>
            </button>

            <QButton variant="link" size="sm" class="self-center" @click="emit('restart')">
              {{ $t('auth.reset.requestNewLink') }}
            </QButton>
          </div>
        </form>

        <div class="box-border flex items-center justify-between rounded-[10px] bg-[#f7f3f7] px-19 py-20">
          <div class="flex min-w-0 flex-1 items-start gap-16">
            <img
              src="/img/desktop/auth/reset-help-headset.svg"
              alt=""
              width="44"
              height="44"
              class="block size-44 shrink-0"
              loading="lazy"
              decoding="async"
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

        <p class="m-0 flex items-center justify-center gap-8 pt-32 text-lg leading-16 font-medium text-[#535a83]">
          <QIcon name="ic-shield" :size="26" />
          {{ $t('desktop.auth.secureNote') }}
        </p>
      </div>
    </section>

    <aside class="relative flex h-full min-h-0 flex-1 items-stretch">
      <div class="relative min-h-0 min-w-0 flex-1 overflow-hidden border-l border-[#f1f5f9] bg-[#f8fafc]">
        <div class="absolute inset-0 overflow-hidden opacity-85">
          <NuxtImg
            src="/img/desktop/auth/mot-de-passe-hero.jpg"
            alt=""
            width="1100"
            height="1194"
            format="webp"
            fit="cover"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 size-full object-cover object-center"
          />
        </div>

        <div class="absolute inset-x-0 bottom-0 flex justify-center px-48 pb-48">
          <div
            class="box-border flex h-74 w-fit max-w-full items-center justify-center gap-26 rounded-[10px] border border-[#f1f5f9] bg-white px-32 py-11 shadow-[0_0_3.5px_rgba(0,0,0,0.15)]"
          >
            <template v-for="(item, index) in trustItems" :key="item.labelKey">
              <div
                v-if="index > 0"
                class="h-34 w-px shrink-0 bg-[#e6e5f5]"
                aria-hidden="true"
              />
              <div
                class="flex shrink-0 items-center gap-10"
                :class="index === 0 ? 'justify-center' : 'items-start'"
              >
                <img
                  :src="item.icon"
                  alt=""
                  width="40"
                  height="40"
                  class="block size-40 shrink-0"
                  loading="lazy"
                  decoding="async"
                >
                <p class="m-0 pt-6 text-md leading-[13.125px] font-semibold whitespace-pre-line text-black">
                  {{ $t(item.labelKey) }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
