<script setup lang="ts">
/**
 * Connexion desktop ← Figma `Connexion` (567:5582).
 * Gauche 680 (alignée logo) · hero flex · trust bar centrée.
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
</script>

<template>
  <!-- Canevas 1728 · gutters 150 des deux côtés · image 748 fixe · pas de `lg:`. -->
  <div class="desktop-canvas flex min-h-0 flex-row overflow-hidden bg-white pr-[var(--q-desktop-gutter)]">
    <section
      class="box-border flex h-full w-[calc(var(--q-desktop-gutter)+680px)] shrink-0 flex-col justify-center overflow-y-auto bg-white py-24 pr-32 pl-[var(--q-desktop-gutter)]"
    >
      <div class="flex w-full flex-col gap-7">
        <div class="w-full">
          <h1 class="m-0 text-[43px] leading-40 font-semibold whitespace-nowrap text-black">
            {{ $t('desktop.auth.welcomeBefore') }}
            <span class="text-[#fd1d36]">{{ $t('desktop.auth.welcomeAccent') }}</span>
          </h1>
          <p class="m-0 pt-12 text-exact-16 leading-[19.5px] font-medium whitespace-nowrap text-black">
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

    <AuthDesktopHero src="/img/desktop/auth/connexion-hero.jpg" />
  </div>
</template>
