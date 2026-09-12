<script setup lang="ts">
/**
 * Mot de passe oublié ← `maquette/pwa/pages/mot-de-passe.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | accroche | `pt-30 pb-22`, min-height 230 (30 + illus 178 + 22) · texte `min-height: 84.75px`, paragraphe `width: 165px` |
 * | illustration | **absolue** `left: 185px`, `top: 30px`, 185×178 · image 228×181 décalée de −25 / 0 |
 * | carte | `padding: 25px 20px` · champs `padding-bottom: 20px` · envoi `padding-top: 5px` |
 * | séparateur | `padding: 14px 0`, libellé `padding: 0 16px`, en capitales |
 * | retour | `.btn-outline` `padding: 17px`, bord `--q-primary`, icône 20×20 |
 * | frise | une **ligne par étape**, cercle / numéro / titre alignés au milieu |
 * | pastilles | 40×40 violettes, **50×50** verte pour la dernière · colonne 56px |
 * | numéros | 15×14, centrés sur le cercle · `#5121fc`, `#0ca62f` pour le dernier |
 * | connecteurs | pointillés sous les pastilles, trait plein sous les numéros |
 * | textes | titre 12px / 20px gras, centré sur le cercle · description 10px, `min-height: 32px` |
 * | encart d'aide | `padding-top: 24px`, même bloc que `/inscription` (`min-h-86`, `px-9`, `py-21`) |
 * | sous 360px | titre enroulable · illustration calée à droite, en `clamp()` |
 *
 * ### Deux étapes, là où la maquette n'en montre qu'une
 *
 * `/auth/forgot-password` envoie un **code**, et `/auth/new-password` attend ce
 * code plus le nouveau mot de passe. La maquette s'arrête au premier écran ;
 * le second est rendu à sa place, dans la même carte et avec les mêmes
 * primitives — comme pour l'inscription.
 */
import { ApiError } from '~/core/http/errors'
import { authRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'
import DesktopMotDePasse from '~/desktop-pages/mot-de-passe.vue'

definePageMeta({
  bottomNav: false,
  desktopNav: 'auth-reset',
  desktopFooter: false,
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()
const { resume } = useAuthFlow()

/** `request` : demande du code · `reset` : saisie du code et du nouveau mot de passe. */
const step = ref<'request' | 'reset'>('request')

const email = ref('')
const code = ref('')
const password = ref('')

const submitting = ref(false)
const formError = ref<string | null>(null)
const notice = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const { score, valid: passwordValid, missing, hasDisallowedChars } = usePasswordStrength(password)

/** Même règle que l'inscription (`newPassword` porte le même regex côté back-office). */
const strengthHint = computed(() => {
  if (password.value === '') return t('auth.register.strengthHint')
  if (hasDisallowedChars.value) return t('auth.register.disallowedChars')
  if (missing.value.length === 0) return t('auth.register.strengthOk')
  if (missing.value.length === 5) return t('auth.register.strengthHint')

  const labels: Record<string, string> = {
    length: t('auth.register.missingLength'),
    lower: t('auth.register.missingLower'),
    upper: t('auth.register.missingUpper'),
    digit: t('auth.register.missingDigit'),
    symbol: t('auth.register.missingSymbol'),
  }
  return t('auth.register.missing', { list: missing.value.map((key) => labels[key]).join(', ') })
})

const strengthTone = computed<'neutral' | 'error' | 'ok'>(() => {
  if (password.value === '') return 'neutral'
  return passwordValid.value ? 'ok' : 'error'
})

/** Les trois étapes de la frise — éditoriales, aucune donnée derrière. */
const steps = [
  { icon: 'ic-step-email', width: 20, height: 16, circle: 40, titleKey: 'auth.reset.step1Title', descKey: 'auth.reset.step1Desc' },
  { icon: 'ic-step-link', width: 19.887, height: 19.867, circle: 40, titleKey: 'auth.reset.step2Title', descKey: 'auth.reset.step2Desc' },
  { icon: 'ic-step-check', width: 20, height: 20, circle: 50, titleKey: 'auth.reset.step3Title', descKey: 'auth.reset.step3Desc' },
] as const

function applyError(error: unknown): void {
  if (!(error instanceof ApiError)) {
    formError.value = t('auth.error.generic')
    return
  }

  const mapping: Record<string, string> = { email: 'email', code: 'code', password: 'password' }
  const mapped: Record<string, string[]> = {}
  for (const [key, target] of Object.entries(mapping)) {
    if (error.fieldErrors[key]) mapped[target] = error.fieldErrors[key]!
  }
  fieldErrors.value = mapped

  formError.value = error.kind === 'network' || error.kind === 'timeout'
    ? t('auth.error.network')
    : Object.keys(mapped).length > 0
      ? null
      : t('auth.error.generic')
}

async function onRequest(): Promise<void> {
  formError.value = null
  notice.value = null
  fieldErrors.value = {}

  const value = email.value.trim()
  if (value === '') {
    fieldErrors.value.email = [t('auth.error.emailRequired')]
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    fieldErrors.value.email = [t('auth.error.emailInvalid')]
    return
  }
  if (submitting.value) return

  submitting.value = true
  try {
    await authRepo.forgotPassword(value, locale.value)
    step.value = 'reset'
    // Formulé sans confirmer que le compte existe : ce serait offrir un moyen
    // d'énumérer les comptes. Le back-office répond 200 dans les deux cas.
    notice.value = t('auth.reset.sent', { email: value })
  }
  catch (error) {
    applyError(error)
  }
  finally {
    submitting.value = false
  }
}

async function onReset(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  if (code.value.trim() === '') fieldErrors.value.code = [t('auth.error.emailRequired')]
  if (!passwordValid.value) fieldErrors.value.password = [t('auth.register.strengthHint')]
  if (Object.keys(fieldErrors.value).length > 0 || submitting.value) return

  submitting.value = true
  try {
    const outcome = await authRepo.resetPassword(
      { email: email.value.trim(), code: code.value.trim(), password: password.value },
      locale.value,
    )

    // Le back-office connecte parfois dans la foulée, parfois non.
    if (outcome) {
      session.apply(outcome)
      await resume(outcome)
      return
    }

    notice.value = t('auth.reset.success')
    await navigateTo(localePath('/connexion'))
  }
  catch (error) {
    applyError(error)
  }
  finally {
    submitting.value = false
  }
}

usePageSeo(() => ({
  title: t('auth.reset.seoTitle'),
  description: t('auth.reset.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <!-- Mobile -->
  <div class="shell:hidden">
    <!-- Logo -->
    <div class="pb-20">
      <NuxtLink :to="localePath('/')" class="mx-auto block w-fit no-underline" :aria-label="$t('nav.home')">
        <AppLogo :width="150" :height="47" />
      </NuxtLink>
    </div>

    <!-- Accroche. L'illustration est hors flux ; le bas du bloc reste à 22px. -->
    <div class="relative min-h-[230px] pt-30 pb-22">
      <div class="relative z-1 min-h-[84.75px]">
        <h1
          class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] whitespace-nowrap text-text max-3xs:whitespace-normal"
        >
          {{ $t('auth.reset.title') }}
        </h1>
        <p class="m-0 w-165 max-w-full pt-8 text-xl leading-normal font-normal text-text">
          {{ $t('auth.reset.intro') }}
        </p>
      </div>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute top-30 left-185 h-178 w-185 max-3xs:right-0 max-3xs:left-auto max-3xs:h-[clamp(135px,40vw,178px)] max-3xs:w-[clamp(140px,42vw,185px)]"
      >
        <img
          src="/img/hero-mot-de-passe.webp"
          alt=""
          width="228"
          height="181"
          class="absolute top-0 -left-25 h-181 w-228 max-w-none object-cover max-3xs:left-[-12%] max-3xs:h-[101.69%] max-3xs:w-[123.24%]"
        >
      </div>
    </div>

    <!-- Formulaire -->
    <div class="pt-15 pb-20">
      <div class="rounded-xl bg-surface-card px-20 py-25 shadow-card">
        <QAlert
          v-if="formError"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="formError"
          class="mb-20"
        />

        <QAlert v-if="notice" tone="success" :message="notice" class="mb-20" />

        <!-- Étape 1 — la demande, telle que la maquette la dessine. -->
        <form v-if="step === 'request'" novalidate @submit.prevent="onRequest">
          <div class="pb-20">
            <QInput
              v-model="email"
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
            />
          </div>

          <div class="pt-5">
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary p-16 text-xl leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.reset.submit') }}</span>
            </button>
          </div>
        </form>

        <!-- Étape 2 — code et nouveau mot de passe. Absente de la maquette. -->
        <form v-else novalidate @submit.prevent="onReset">
          <div class="pb-20">
            <QInput
              v-model="code"
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
            />
          </div>

          <div class="pb-10">
            <QInput
              v-model="password"
              type="password"
              icon="ic-lock"
              :icon-width="12.5"
              :icon-height="16.25"
              :icon-bleed="0.6"
              :label="$t('auth.reset.newPasswordLabel')"
              :placeholder="$t('auth.passwordPlaceholder')"
              :state="password === '' ? 'default' : passwordValid ? 'valid' : 'invalid'"
              :disabled="submitting"
              autocomplete="new-password"
              name="password"
              revealable
            />
          </div>
          <QPasswordStrength :score="score" :hint="strengthHint" :hint-tone="strengthTone" />

          <div class="pt-20">
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary p-16 text-xl leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.reset.submitNew') }}</span>
            </button>
          </div>
        </form>

        <!-- Séparateur « ou » puis retour à la connexion -->
        <div class="flex items-center py-14">
          <span aria-hidden="true" class="h-1 flex-1 bg-border" />
          <span class="px-16 text-base leading-16 font-medium tracking-widest whitespace-nowrap text-muted-2 uppercase">
            {{ $t('auth.or') }}
          </span>
          <span aria-hidden="true" class="h-1 flex-1 bg-border" />
        </div>

        <NuxtLink
          :to="localePath('/connexion')"
          class="flex w-full items-center justify-center gap-8 rounded-xl border border-primary bg-transparent p-17 text-xl leading-20 font-semibold text-primary no-underline"
        >
          <QIcon name="ic-back" :size="20" />
          {{ $t('auth.reset.backToLogin') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Le saviez-vous ? -->
    <div class="w-full">
      <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">
        {{ $t('auth.reset.stepsHeading') }}
      </h2>

      <div class="flex flex-col gap-16 pt-12">
        <div
          v-for="(item, index) in steps"
          :key="item.icon"
          class="mdp-step relative flex items-stretch gap-7"
        >
          <div class="flex shrink-0 items-stretch self-stretch gap-10">
            <div class="mdp-step-icon-rail relative flex w-56 flex-col items-center">
              <span
                :class="[
                  'relative z-1 flex shrink-0 items-center justify-center rounded-full',
                  index === steps.length - 1 ? 'size-50 bg-success-bg' : 'size-40 bg-step-circle-violet',
                ]"
              >
                <span
                  class="relative block shrink-0"
                  :style="{ width: `${item.width}px`, height: `${item.height}px` }"
                >
                  <QIcon
                    :name="item.icon"
                    :size="item.width + 1.5"
                    :height="item.height + 1.5"
                    class="absolute -top-[0.75px] -left-[0.75px] max-w-none"
                  />
                </span>
              </span>
            </div>
            <div class="mdp-step-num-rail relative flex w-21 flex-col items-center">
              <span
                :class="[
                  'relative z-1 flex h-14 w-15 shrink-0 items-center justify-center rounded-full text-xs leading-20 font-semibold text-white',
                  index === steps.length - 1 ? 'bg-step-badge-done' : 'bg-step-badge',
                ]"
                :style="{ marginTop: `${(item.circle - 14) / 2}px` }"
              >{{ index + 1 }}</span>
            </div>
          </div>
          <div
            class="min-w-0 flex-1"
            :style="{ paddingTop: `${(item.circle - 20) / 2}px` }"
          >
            <p class="m-0 text-base leading-20 font-bold text-text">{{ $t(item.titleKey) }}</p>
            <p class="m-0 min-h-32 text-sm leading-normal font-medium text-text">{{ $t(item.descKey) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Besoin d'aide ? — même encart que `/inscription`. -->
    <div class="pt-24">
      <div class="flex min-h-86 items-center justify-between rounded-xl bg-surface-2 px-9 py-21">
        <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
          <QIcon name="ic-headset" :size="24" />
        </span>
        <div class="min-w-0 flex-1 px-11">
          <p class="m-0 text-base leading-20 font-bold text-text">{{ $t('auth.reset.helpTitle') }}</p>
          <p class="m-0 pt-4 text-sm leading-16 font-normal text-text">{{ $t('auth.reset.helpDescription') }}</p>
        </div>
        <SupportLink
          class="inline-flex shrink-0 rounded-xl border border-primary-link px-15 py-9 text-sm leading-normal font-medium whitespace-nowrap text-primary-link no-underline"
        >
          {{ $t('auth.reset.helpCta') }}
        </SupportLink>
      </div>
    </div>
  </div>

  <!-- Desktop -->
  <div class="hidden h-full shell:block">
    <DesktopMotDePasse
      :step="step"
      v-model:email="email"
      v-model:code="code"
      v-model:password="password"
      :submitting="submitting"
      :form-error="formError"
      :notice="notice"
      :field-errors="fieldErrors"
      :score="score"
      :strength-hint="strengthHint"
      :strength-tone="strengthTone"
      @request="onRequest"
      @reset="onReset"
    />
  </div>
</template>

<style scoped>
.mdp-step:not(:last-child) .mdp-step-icon-rail::after,
.mdp-step:not(:last-child) .mdp-step-num-rail::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 0;
}

.mdp-step:not(:last-child) .mdp-step-icon-rail::after {
  top: 40px;
  height: calc(100% - 40px + 16px);
  background-image: linear-gradient(
    to bottom,
    #dbd9ee 0,
    #dbd9ee 2px,
    transparent 2px,
    transparent 4px
  );
  background-repeat: repeat-y;
  background-size: 1px 4px;
}

.mdp-step:not(:last-child) .mdp-step-num-rail::after {
  top: 27px;
  height: calc(100% - 27px + 16px);
  background: #dbd9ee;
}
</style>

