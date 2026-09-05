<script setup lang="ts">
/**
 * Inscription desktop ← Figma `Inscription-V2` (640:6).
 * Wings `p-30` + carte arrondie · gauche 738 · droite hero · trust ×4.
 * Logique métier dans `pages/inscription.vue`.
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
  { icon: '/img/desktop/auth/register-trust-schools.svg', line1Key: 'desktop.register.trust1a', line2Key: 'desktop.register.trust1b' },
  { icon: '/img/desktop/auth/register-trust-programs.svg', line1Key: 'desktop.register.trust2a', line2Key: 'desktop.register.trust2b' },
  { icon: '/img/desktop/auth/register-trust-opportunities.svg', line1Key: 'desktop.register.trust3a', line2Key: 'desktop.register.trust3b' },
  { icon: '/img/desktop/auth/register-trust-support.svg', line1Key: 'desktop.register.trust4a', line2Key: 'desktop.register.trust4b' },
] as const
</script>

<template>
  <!-- Wings + carte — nav intégrée au-dessus du split -->
  <div class="box-border flex h-full min-h-0 w-full flex-col bg-[#f2f1f6] p-30">
    <div
      class="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[50px] bg-white shadow-[0_18px_10px_rgba(112,144,176,0.1)]"
    >
      <!-- Hero pleine hauteur panneau droit — derrière la navbar -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 hidden overflow-hidden opacity-85 lg:left-738 lg:block lg:rounded-br-[50px] lg:rounded-tr-[50px]"
      >
        <img
          src="/img/desktop/auth/inscription-hero.jpg"
          alt=""
          class="absolute inset-0 size-full object-cover object-center"
        >
      </div>

      <!-- Fond blanc colonne gauche (nav + formulaire) -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 hidden bg-white lg:block lg:w-738"
      />

      <AppDesktopAuthCardNav variant="signup" class="relative z-10" />

      <div class="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
        <!-- 640:46 — panneau gauche 738 -->
        <section
          class="box-border flex h-full w-full flex-col overflow-y-auto bg-white px-48 pb-48 pt-16 lg:w-738 lg:shrink-0 lg:rounded-bl-[50px] lg:bg-transparent"
        >
        <div class="flex w-full flex-col gap-5 pl-[clamp(0px,6.36vw,110px)]">
          <div class="w-full">
            <h1 class="m-0 text-[36px] leading-40 font-semibold text-black">
              {{ $t('desktop.register.titleLine1') }}
              <span class="block">
                {{ $t('desktop.register.titleLine2Before') }}
                <span class="text-[#fd1d36]">{{ $t('desktop.register.titleAccent') }}</span>{{ $t('desktop.register.titleLine2After') }}
              </span>
            </h1>
            <p class="m-0 pt-12 text-xl leading-[19.5px] font-medium whitespace-pre-line text-black">
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
              <div class="flex flex-col gap-24">
                <div class="flex flex-col gap-14">
                  <p class="m-0 text-xl leading-15 font-semibold tracking-[0.5px] text-black">
                    {{ $t('desktop.register.emailTitle') }}
                  </p>

                  <div class="flex flex-col gap-10">
                    <div class="flex gap-15">
                      <QInput
                        :model-value="firstName"
                        icon="ic-user"
                        :icon-width="14"
                        :icon-height="18"
                        :icon-bleed="0.6"
                        :label="$t('auth.register.firstNameLabel')"
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
                        :label="$t('auth.register.lastNameLabel')"
                        :placeholder="$t('auth.register.lastNamePlaceholder')"
                        :error="fieldErrors.lastName?.[0]"
                        :disabled="submitting"
                        autocomplete="family-name"
                        name="last_name"
                        class="min-w-0 flex-1"
                        @update:model-value="emit('update:lastName', $event)"
                      />
                    </div>

                    <QInput
                      :model-value="email"
                      type="email"
                      icon="ic-email"
                      :icon-width="16.25"
                      :icon-height="12.5"
                      :icon-bleed="0.6"
                      :label="$t('auth.emailLabel')"
                      :placeholder="$t('auth.emailPlaceholder')"
                      :error="fieldErrors.email?.[0]"
                      :disabled="submitting"
                      autocomplete="email"
                      name="email"
                      @update:model-value="emit('update:email', $event)"
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
                          :label="$t('auth.passwordLabel')"
                          :placeholder="$t('auth.passwordPlaceholder')"
                          :state="passwordState"
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

                    <div>
                      <QInput
                        :model-value="passwordConfirm"
                        type="password"
                        icon="ic-lock"
                        :icon-width="12.5"
                        :icon-height="16.25"
                        :icon-bleed="0.6"
                        :label="$t('auth.register.confirmLabel')"
                        :placeholder="$t('auth.passwordPlaceholder')"
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
                  class="flex w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <QSpinner v-if="submitting" size="sm" class="text-white" />
                  <span v-else>{{ $t('auth.register.submit') }}</span>
                </button>
              </div>
            </form>

            <p class="m-0 pt-24 text-center text-lg leading-16 font-medium text-black">
              {{ $t('desktop.register.hasAccount') }}
              <NuxtLink :to="localePath('/connexion')" class="font-semibold text-[#fc1333] no-underline">
                {{ $t('auth.signIn') }}
              </NuxtLink>
            </p>
          </template>

          <form v-else class="w-full pt-24" novalidate @submit.prevent="emit('confirm')">
            <QInput
              :model-value="code"
              icon="ic-email"
              :icon-width="16.25"
              :icon-height="12.5"
              :icon-bleed="0.6"
              :label="$t('auth.register.codeLabel')"
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
              class="mt-24 flex w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.register.codeSubmit') }}</span>
            </button>
            <div class="flex justify-center pt-14">
              <QButton variant="link" size="sm" @click="emit('resend')">{{ $t('auth.register.resend') }}</QButton>
            </div>
          </form>
        </div>
      </section>

      <!-- 640:159 — panneau droit (trust bar sur hero) -->
      <aside class="relative hidden h-full min-h-0 flex-1 lg:flex">
        <div class="relative min-h-0 min-w-0 flex-1 px-78 py-48 lg:rounded-br-[50px]">
          <div class="absolute inset-x-0 bottom-0 flex justify-center px-55 pb-60 lg:pr-90">
            <div
              class="box-border flex h-74 w-full items-center justify-center gap-16 rounded-[10px] border border-[#f1f5f9] bg-white px-21 py-11 shadow-[0_0_3.5px_rgba(0,0,0,0.15)]"
            >
              <template v-for="(item, index) in trustItems" :key="item.line1Key">
                <div
                  v-if="index > 0"
                  class="h-34 w-px shrink-0 bg-[#e6e5f5]"
                  aria-hidden="true"
                />
                <div class="flex min-w-0 flex-1 items-center justify-center gap-10">
                  <img
                    :src="item.icon"
                    alt=""
                    width="20"
                    height="20"
                    class="block size-20 shrink-0"
                  >
                  <div class="min-w-0 text-md leading-[13.125px] text-black">
                    <p class="m-0 font-semibold">{{ $t(item.line1Key) }}</p>
                    <p class="m-0 font-normal">{{ $t(item.line2Key) }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  </div>
</template>
