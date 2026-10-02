<script setup lang="ts">
/**
 * Inscription desktop — même split que `/connexion` (canevas 1728, gutter 150).
 * Formulaire à gauche, hero à droite, trust bar identique.
 */
import type { SocialLinkRequest, SocialProvider } from '~/core/contracts'

defineProps<{
  step: 'form' | 'code'
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirm: string
  code: string
  acceptedTerms: boolean
  submitting: boolean
  visibleError: string | null
  notice: string | null
  fieldErrors: Record<string, string[]>
  socialConfigured: Record<SocialProvider, boolean>
  socialPending: SocialProvider | null
  linkRequest: SocialLinkRequest | null
  pendingPayment: boolean
  pendingLabel: string
  score: number
  strengthHint: string
  strengthTone: 'neutral' | 'error' | 'ok'
  matchHint: { text: string; tone: 'ok' | 'error' } | null
  passwordState: 'default' | 'valid' | 'invalid'
  confirmState: 'default' | 'valid' | 'invalid'
}>()

const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
  'update:email': [value: string]
  'update:password': [value: string]
  'update:passwordConfirm': [value: string]
  'update:code': [value: string]
  'update:acceptedTerms': [value: boolean]
  submit: []
  confirm: []
  resend: []
  social: [provider: SocialProvider]
  'confirm-link': []
  'cancel-link': []
}>()

const localePath = useLocalePath()

const socialOrder: SocialProvider[] = ['facebook', 'google', 'linkedin']

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
          <h1 class="m-0 text-[43px] leading-40 font-semibold text-black">
            {{ $t('desktop.register.titleLine1') }}
            <span class="block">
              {{ $t('desktop.register.titleLine2Before') }}
              <span class="text-[#fd1d36]">{{ $t('desktop.register.titleAccent') }}</span>{{ $t('desktop.register.titleLine2After') }}
            </span>
          </h1>
          <p class="m-0 pt-12 text-exact-16 leading-[19.5px] font-medium whitespace-pre-line text-black">
            {{ $t('desktop.register.desc') }}
          </p>
        </div>

        <QAlert
          v-if="pendingPayment"
          tone="info"
          :title="$t('auth.resume.title')"
          :message="$t('auth.resume.description', { label: pendingLabel })"
          class="mt-24"
        />

        <QAlert
          v-if="visibleError"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="visibleError"
          class="mt-24"
        />

        <QAlert v-if="notice" tone="success" :message="notice" class="mt-24" />

        <QAlert
          v-if="linkRequest"
          tone="warning"
          :title="$t('auth.social.link.title')"
          :message="$t('auth.social.link.description', {
            email: linkRequest.email,
            provider: linkRequest.provider,
          })"
          class="mt-24"
        >
          <template #actions>
            <QButton size="sm" @click="emit('confirm-link')">{{ $t('auth.social.link.confirm') }}</QButton>
            <QButton size="sm" variant="ghost" @click="emit('cancel-link')">{{ $t('auth.social.link.cancel') }}</QButton>
          </template>
        </QAlert>

        <template v-if="step === 'form'">
          <div class="flex w-full flex-col gap-12 pt-24">
            <p class="m-0 text-xl leading-15 font-semibold tracking-[0.5px] text-black">
              {{ $t('desktop.register.socialTitle') }}
            </p>
            <div class="flex gap-10">
              <QSocialButton
                v-for="provider in socialOrder"
                :key="provider"
                :provider="provider"
                layout="icon-label"
                class="flex-1 shadow-[0_0_7px_rgba(0,0,0,0.15)]"
                :loading="socialPending === provider"
                :disabled="!socialConfigured[provider] || (socialPending !== null && socialPending !== provider)"
                @click="emit('social', provider)"
              />
            </div>
          </div>

          <div class="flex items-center py-20">
            <span aria-hidden="true" class="h-px flex-1 bg-[#e3e5ef]" />
            <span class="px-14 text-base leading-16 font-semibold text-[#646b8c] uppercase">{{ $t('auth.or') }}</span>
            <span aria-hidden="true" class="h-px flex-1 bg-[#e3e5ef]" />
          </div>

          <form class="w-full" novalidate @submit.prevent="emit('submit')">
            <div class="flex flex-col gap-18">
              <div class="flex flex-col gap-16">
                <p class="m-0 text-xl leading-15 font-semibold tracking-[0.5px] text-black">
                  {{ $t('desktop.register.emailTitle') }}
                </p>
                <div class="flex flex-col">
                  <div class="flex gap-15">
                    <QInput
                      :model-value="firstName"
                      icon="ic-user"
                      :icon-width="14"
                      :icon-height="18"
                      :icon-bleed="0.6"
                      :placeholder="$t('auth.register.firstNamePlaceholder')"
                      :error="fieldErrors.firstName?.[0]"
                      :disabled="submitting"
                      autocomplete="given-name"
                      name="first_name"
                      class="min-w-0 flex-1"
                      @update:model-value="emit('update:firstName', $event)"
                    />
                    <QInput
                      :model-value="lastName"
                      icon="ic-user"
                      :icon-width="14"
                      :icon-height="18"
                      :icon-bleed="0.6"
                      :placeholder="$t('auth.register.lastNamePlaceholder')"
                      :error="fieldErrors.lastName?.[0]"
                      :disabled="submitting"
                      autocomplete="family-name"
                      name="last_name"
                      class="min-w-0 flex-1"
                      @update:model-value="emit('update:lastName', $event)"
                    />
                  </div>
                  <div class="pt-15">
                    <QInput
                      :model-value="email"
                      type="email"
                      icon="ic-email"
                      :icon-width="16.25"
                      :icon-height="12.5"
                      :icon-bleed="0.6"
                      :placeholder="$t('auth.emailPlaceholder')"
                      :error="fieldErrors.email?.[0]"
                      :disabled="submitting"
                      autocomplete="email"
                      name="email"
                      @update:model-value="emit('update:email', $event)"
                    />
                  </div>
                  <div class="pt-15">
                    <QInput
                      :model-value="password"
                      type="password"
                      icon="ic-lock"
                      :icon-width="12.5"
                      :icon-height="16.25"
                      :icon-bleed="0.6"
                      :placeholder="$t('auth.passwordPlaceholder')"
                      :state="passwordState"
                      :error="fieldErrors.password?.[0]"
                      :disabled="submitting"
                      autocomplete="new-password"
                      name="password"
                      revealable
                      @update:model-value="emit('update:password', $event)"
                    />
                    <QPasswordStrength class="pt-10" :score="score" :hint="strengthHint" :hint-tone="strengthTone" />
                  </div>
                  <div class="pt-15">
                    <QInput
                      :model-value="passwordConfirm"
                      type="password"
                      icon="ic-lock"
                      :icon-width="12.5"
                      :icon-height="16.25"
                      :icon-bleed="0.6"
                      :placeholder="$t('auth.register.confirmLabel')"
                      :state="confirmState"
                      :error="fieldErrors.passwordConfirmation?.[0]"
                      :disabled="submitting"
                      autocomplete="new-password"
                      name="password_confirmation"
                      revealable
                      @update:model-value="emit('update:passwordConfirm', $event)"
                    />
                    <p
                      v-if="matchHint"
                      :class="['mt-6 mb-0 text-xs leading-16', matchHint.tone === 'ok' ? 'text-success' : 'text-danger']"
                    >
                      {{ matchHint.text }}
                    </p>
                  </div>
                </div>
              </div>

              <QCheckbox
                :model-value="acceptedTerms"
                :invalid="Boolean(fieldErrors.terms)"
                :error="fieldErrors.terms?.[0]"
                @update:model-value="emit('update:acceptedTerms', $event)"
              >
                {{ $t('auth.register.cguPrefix') }}
                <NuxtLink
                  :to="localePath('/pages/cgu')"
                  class="font-medium text-[#0051bd] underline decoration-skip-ink-none [text-underline-position:from-font]"
                >{{ $t('auth.register.cguTerms') }}</NuxtLink>
                {{ $t('auth.register.cguSeparator') }}
                <NuxtLink
                  :to="localePath('/pages/privacy')"
                  class="font-medium text-[#0051bd] underline decoration-skip-ink-none [text-underline-position:from-font]"
                >{{ $t('auth.register.cguPrivacy') }}</NuxtLink>
              </QCheckbox>

              <button
                type="submit"
                :disabled="submitting"
                class="flex w-full cursor-pointer items-center justify-center gap-8 rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QSpinner v-if="submitting" size="sm" class="text-white" />
                <template v-else>
                  <span>{{ $t('auth.register.submit') }}</span>
                  <span aria-hidden="true">→</span>
                </template>
              </button>
            </div>
          </form>
        </template>

        <form v-else class="w-full pt-24" novalidate @submit.prevent="emit('confirm')">
          <QInput
            :model-value="code"
            icon="ic-email"
            :icon-width="16.25"
            :icon-height="12.5"
            :icon-bleed="0.6"
            :placeholder="$t('auth.register.codePlaceholder')"
            :error="fieldErrors.code?.[0]"
            :disabled="submitting"
            inputmode="numeric"
            autocomplete="one-time-code"
            name="code"
            @update:model-value="emit('update:code', $event)"
          />
          <button
            type="submit"
            :disabled="submitting"
            class="mt-24 flex w-full cursor-pointer items-center justify-center gap-8 rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <QSpinner v-if="submitting" size="sm" class="text-white" />
            <template v-else>
              <span>{{ $t('auth.register.codeSubmit') }}</span>
              <span aria-hidden="true">→</span>
            </template>
          </button>
          <div class="flex justify-center pt-14">
            <QButton variant="link" size="sm" @click="emit('resend')">{{ $t('auth.register.resend') }}</QButton>
          </div>
        </form>

        <p class="m-0 flex items-center justify-center gap-8 pt-32 text-lg leading-16 font-medium text-[#535a83]">
          <QIcon name="ic-shield" :size="26" />
          {{ $t('desktop.auth.secureNote') }}
        </p>
      </div>
    </section>

    <aside class="relative flex h-full min-h-0 flex-1 items-stretch">
      <div class="relative min-h-0 min-w-0 flex-1 overflow-hidden border-l border-[#f1f5f9] bg-[#f8fafc]">
        <div class="absolute inset-0 overflow-hidden opacity-85">
          <img
            src="/img/desktop/auth/inscription-hero.jpg"
            alt=""
            class="absolute inset-0 size-full object-cover object-center"
          >
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
