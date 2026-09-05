<script setup lang="ts">
/**
 * Connexion desktop ← Figma `Connexion` (567:5582).
 * Gauche 772 · droite flex + pr 150 · trust bar centrée (max 560).
 * Viewport lock : pas de scroll page, image pleine hauteur.
 */
import type { SocialLinkRequest, SocialProvider } from '~/core/contracts'

defineProps<{
  email: string
  password: string
  rememberMe: boolean
  submitting: boolean
  visibleError: string | null
  fieldErrors: Record<string, string[]>
  socialConfigured: Record<SocialProvider, boolean>
  socialPending: SocialProvider | null
  linkRequest: SocialLinkRequest | null
  pendingPayment: boolean
  pendingLabel: string
  isAuthenticated: boolean
}>()

const emit = defineEmits<{
  'update:email': [value: string]
  'update:password': [value: string]
  'update:rememberMe': [value: boolean]
  submit: []
  social: [provider: SocialProvider]
  'confirm-link': []
  'cancel-link': []
  resume: []
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
  <!-- Hauteur = viewport − nav → pas de scroll page ; image remplit le panneau droit -->
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
    <!-- 567:5945 — 772 · pl 48 / pr 31 · form inset 110
         Nav hors flux : le py-48 Figma est sous la nav → pt visible ≈ 39 -->
    <section
      class="box-border flex h-full w-full flex-col overflow-y-auto bg-white pb-48 pl-48 pr-31 pt-0 lg:w-772 lg:shrink-0"
    >
      <div class="flex w-full flex-col gap-7 pl-[clamp(0px,6.36vw,110px)] pt-39">
        <div class="w-full pt-32">
          <h1 class="m-0 text-[43px] leading-40 font-semibold text-black">
            {{ $t('desktop.auth.welcomeBefore') }}
            <span class="text-[#fd1d36]">{{ $t('desktop.auth.welcomeAccent') }}</span>
          </h1>
          <p class="m-0 pt-12 text-exact-16 leading-[19.5px] font-medium whitespace-pre-line text-black">
            {{ $t('desktop.auth.welcomeDesc') }}
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

        <div class="flex w-full flex-col gap-12 pt-24">
          <p class="m-0 text-xl leading-15 font-semibold tracking-[0.5px] text-black">
            {{ $t('desktop.auth.socialTitle') }}
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
                {{ $t('desktop.auth.emailTitle') }}
              </p>
              <div class="flex flex-col">
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
                <div class="pt-15">
                  <QInput
                    :model-value="password"
                    type="password"
                    icon="ic-lock"
                    :icon-width="12.5"
                    :icon-height="16.25"
                    :icon-bleed="0.6"
                    :placeholder="$t('auth.passwordPlaceholder')"
                    :error="fieldErrors.password?.[0]"
                    :disabled="submitting"
                    autocomplete="current-password"
                    name="password"
                    revealable
                    @update:model-value="emit('update:password', $event)"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4">
              <label class="flex cursor-pointer items-center gap-8 text-md leading-[16.5px] font-semibold text-black">
                <input
                  type="checkbox"
                  class="size-16 accent-[#fe1334]"
                  :checked="rememberMe"
                  @change="emit('update:rememberMe', ($event.target as HTMLInputElement).checked)"
                >
                {{ $t('desktop.auth.rememberMe') }}
              </label>
              <NuxtLink
                :to="localePath('/mot-de-passe')"
                class="text-xl leading-[16.5px] font-medium text-[#0051bd] no-underline"
              >
                {{ $t('auth.forgotPassword') }}
              </NuxtLink>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center gap-8 rounded-md border-0 bg-[#fc1333] px-32 py-14 text-xl leading-20 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <template v-else>
                <span>{{ $t('auth.signIn') }}</span>
                <span aria-hidden="true">→</span>
              </template>
            </button>
          </div>
        </form>

        <div v-if="pendingPayment && isAuthenticated" class="pt-24">
          <QButton block :loading="submitting" @click="emit('resume')">{{ $t('auth.resume.cta') }}</QButton>
        </div>

        <!-- 567:6028 -->
        <p class="m-0 flex items-center justify-center gap-8 pt-32 text-lg leading-16 font-medium text-[#535a83]">
          <QIcon name="ic-shield" :size="26" />
          {{ $t('desktop.auth.secureNote') }}
        </p>
      </div>
    </section>

    <!-- 1146:777 — flex-1 + pr 150 (wing droite = gutter nav) · panel 567:6034 -->
    <aside
      class="relative hidden h-full min-h-0 flex-1 items-stretch pr-[clamp(24px,8.68vw,150px)] lg:flex"
    >
      <div
        class="relative min-h-0 min-w-0 flex-1 overflow-hidden border-l border-[#f1f5f9] bg-[#f8fafc]"
      >
        <!-- 567:6036 — image contenue dans le cadre inset-0 -->
        <div class="absolute inset-0 overflow-hidden opacity-85">
          <img
            src="/img/desktop/auth/connexion-hero.jpg"
            alt=""
            class="absolute inset-0 size-full object-cover object-center"
          >
        </div>

        <!-- Trust bar — largeur contenu, centrée (Figma 567:6271) -->
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
