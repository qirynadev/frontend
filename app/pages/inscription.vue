<script setup lang="ts">
/**
 * Inscription ← `maquette/pwa/pages/inscription.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | accroche | `.inscription-hero` `padding: 30px 0 97px`, `position: relative` · texte `min-height: 84.75px`, intro `max-width: 160px` |
 * | illustration | **absolue** `left: 165px`, `top: 28px`, 205×197 · image 225×178 décalée de −20 / 0 |
 * | bascule | `padding-top: 0`, `z-index: 1` — elle passe **au-dessus** de l'illustration, qui déborde du bloc d'accroche |
 * | carte | `padding: 25px 20px` · champs empilés, chacun `padding-bottom: 20px` (pas de `gap`) |
 * | mot de passe | `padding-bottom: 10px` sous le champ, puis l'indicateur (`gap: 5px`) |
 * | confirmation | bloc `gap: 22px`, `padding-bottom: 20px` |
 * | conditions | `gap: 7px`, case 13×13, texte 10px / 16px |
 * | séparateur et réseaux | **hors de la carte**, dans `.inscription-form-wrap` (`padding: 15px 0 20px`) |
 * | encart d'aide | `min-height: 86px`, `padding: 21px 9px`, pastille 44×44 |
 *
 * ### Deux écrans en un
 *
 * `POST /auth/register` **n'ouvre pas de session** : le back-office envoie un
 * code par e-mail et attend `POST /auth/confirm`. La maquette ne montre pas
 * cette seconde étape — elle n'existe nulle part dans les quinze pages. Elle
 * est donc rendue **à la place du formulaire**, dans la même carte et avec les
 * mêmes primitives : c'est la solution qui invente le moins.
 *
 * ### La règle de robustesse vient de la maquette
 *
 * `inscription.html` embarque son propre script de validation ; il fait partie
 * de la spécification. Il est porté tel quel dans `usePasswordStrength`.
 */
import { ApiError } from '~/core/http/errors'
import { authRepo, paymentRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'
import type { PaymentIntent, SocialProvider } from '~/core/contracts'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()
const { resume, redirectIfAuthenticated } = useAuthFlow()

const {
  configured: socialConfigured,
  pending: socialPending,
  errorKey: socialErrorKey,
  linkRequest,
  start: startSocial,
  confirmLink,
  cancelLink,
  handleLinkedinReturn,
} = useSocialAuth('register')

await redirectIfAuthenticated()

/** `form` : le formulaire · `code` : la saisie du code reçu par e-mail. */
const step = ref<'form' | 'code'>('form')

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const acceptedTerms = ref(false)
const code = ref('')

const submitting = ref(false)
const formError = ref<string | null>(null)
const notice = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const { score, valid: passwordValid, missing } = usePasswordStrength(password)

const pendingIntent = ref<PaymentIntent | null>(null)

watchEffect(async () => {
  if (!session.pendingPayment || !import.meta.client) return
  pendingIntent.value = await paymentRepo.pendingIntent().catch(() => null)
})

onMounted(async () => {
  const result = await handleLinkedinReturn()
  if (result?.outcome) await finish(() => resume(result.outcome))
})

/** Message sous les barres — repris mot pour mot du script de la maquette. */
const strengthHint = computed(() => {
  if (password.value === '') return t('auth.register.strengthHint')
  if (missing.value.length === 0) return t('auth.register.strengthOk')
  if (missing.value.length === 4) return t('auth.register.strengthHint')

  const labels: Record<string, string> = {
    length: t('auth.register.missingLength'),
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

/** Indication sous la confirmation — trois cas, comme dans la maquette. */
const matchHint = computed<{ text: string; tone: 'ok' | 'error' } | null>(() => {
  if (passwordConfirm.value === '') return null
  if (passwordConfirm.value !== password.value) return { text: t('auth.register.matchKo'), tone: 'error' }
  if (!passwordValid.value) return { text: t('auth.register.matchWeak'), tone: 'error' }
  return { text: t('auth.register.matchOk'), tone: 'ok' }
})

const passwordState = computed(() => (password.value === '' ? 'default' : passwordValid.value ? 'valid' : 'invalid'))
const confirmState = computed(() => {
  if (passwordConfirm.value === '') return 'default'
  return matchHint.value?.tone === 'ok' ? 'valid' : 'invalid'
})

async function finish(action: () => Promise<void>): Promise<void> {
  try {
    await action()
  }
  catch (error) {
    formError.value = error instanceof ApiError && error.kind === 'network'
      ? t('auth.error.network')
      : t('auth.error.paymentFailed')
  }
}

function validate(): boolean {
  fieldErrors.value = {}

  if (firstName.value.trim() === '') fieldErrors.value.firstName = [t('auth.error.emailRequired')]
  if (lastName.value.trim() === '') fieldErrors.value.lastName = [t('auth.error.emailRequired')]

  if (email.value.trim() === '') fieldErrors.value.email = [t('auth.error.emailRequired')]
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) fieldErrors.value.email = [t('auth.error.emailInvalid')]

  if (!passwordValid.value) fieldErrors.value.password = [t('auth.register.strengthHint')]
  if (passwordConfirm.value !== password.value) fieldErrors.value.passwordConfirmation = [t('auth.register.matchKo')]
  if (!acceptedTerms.value) fieldErrors.value.terms = [t('auth.register.cguError')]

  return Object.keys(fieldErrors.value).length === 0
}

async function onSubmit(): Promise<void> {
  formError.value = null
  notice.value = null
  if (!validate() || submitting.value) return

  submitting.value = true
  try {
    await authRepo.register(
      {
        email: email.value.trim(),
        password: password.value,
        passwordConfirmation: passwordConfirm.value,
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
      },
      locale.value,
    )
    step.value = 'code'
    notice.value = t('auth.register.codeSent', { email: email.value.trim() })
  }
  catch (error) {
    applyError(error)
  }
  finally {
    submitting.value = false
  }
}

async function onConfirm(): Promise<void> {
  formError.value = null
  if (code.value.trim() === '' || submitting.value) return

  submitting.value = true
  try {
    const outcome = await authRepo.confirm({ email: email.value.trim(), code: code.value.trim() }, locale.value)
    session.apply(outcome)
    await finish(() => resume(outcome))
  }
  catch (error) {
    applyError(error)
  }
  finally {
    submitting.value = false
  }
}

async function onResend(): Promise<void> {
  formError.value = null
  try {
    await authRepo.resendCode(email.value.trim(), locale.value)
    notice.value = t('auth.register.resent')
  }
  catch (error) {
    applyError(error)
  }
}

/** Traduit une `ApiError` en messages d'écran — jamais le texte brut de l'API. */
function applyError(error: unknown): void {
  if (!(error instanceof ApiError)) {
    formError.value = t('auth.error.generic')
    return
  }

  // Les erreurs Laravel sont indexées en `snake_case` ; l'écran, en `camelCase`.
  const mapping: Record<string, string> = {
    email: 'email',
    password: 'password',
    first_name: 'firstName',
    last_name: 'lastName',
    code: 'code',
  }
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

async function onSocial(provider: SocialProvider): Promise<void> {
  formError.value = null
  const result = await startSocial(provider)
  if (result?.outcome) await finish(() => resume(result.outcome))
}

async function onConfirmLink(): Promise<void> {
  const result = await confirmLink()
  if (result?.outcome) await finish(() => resume(result.outcome))
}

const visibleError = computed(() => formError.value ?? (socialErrorKey.value ? t(socialErrorKey.value) : null))

usePageSeo(() => ({
  title: t('auth.register.seoTitle'),
  description: t('auth.register.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div>
    <!-- Logo -->
    <div class="pb-20">
      <AppLogo :width="150" :height="47" class="mx-auto" />
    </div>

    <!-- Accroche. L'illustration est hors flux et déborde de 28px sur la
         bascule : c'est ce que fait la maquette, d'où le `z-index` plus bas. -->
    <div class="relative flex items-start gap-10 pt-30 pb-97">
      <div class="relative z-1 min-h-[84.75px] min-w-0 flex-1">
        <h1 class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] text-text">
          {{ $t('auth.register.title') }}
        </h1>
        <div class="max-w-160 pt-8 text-xl leading-normal font-normal text-text">
          <p class="m-0">{{ $t('auth.register.intro') }}</p>
        </div>
      </div>

      <div class="pointer-events-none absolute top-28 left-165 z-0 h-197 w-205">
        <img
          src="/img/hero-inscription.webp"
          alt=""
          width="225"
          height="178"
          class="absolute top-0 -left-20 h-178 w-225 max-w-none object-cover"
        >
      </div>
    </div>

    <!-- Se connecter / S'inscrire -->
    <div class="relative z-1">
      <AuthToggle active="signUp" />
    </div>

    <!-- Formulaire : carte, puis séparateur et réseaux hors de la carte. -->
    <div class="pt-15 pb-20">
      <div class="rounded-xl bg-white px-20 py-25 shadow-card">
        <QAlert
          v-if="session.pendingPayment"
          tone="info"
          :title="$t('auth.resume.title')"
          :message="$t('auth.resume.description', { label: pendingIntent?.label ?? '' })"
          class="mb-20"
        />

        <QAlert
          v-if="visibleError"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="visibleError"
          class="mb-20"
        />

        <QAlert v-if="notice" tone="success" :message="notice" class="mb-20" />

        <QAlert
          v-if="linkRequest"
          tone="warning"
          :title="$t('auth.social.link.title')"
          :message="$t('auth.social.link.description', { email: linkRequest.email, provider: linkRequest.provider })"
          class="mb-20"
        >
          <template #actions>
            <QButton size="sm" @click="onConfirmLink">{{ $t('auth.social.link.confirm') }}</QButton>
            <QButton size="sm" variant="ghost" @click="cancelLink">{{ $t('auth.social.link.cancel') }}</QButton>
          </template>
        </QAlert>

        <!-- Étape 1 — le formulaire de la maquette. -->
        <form v-if="step === 'form'" novalidate @submit.prevent="onSubmit">
          <div class="flex flex-col">
            <div class="pb-20">
              <QInput
                v-model="firstName"
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
              />
            </div>

            <div class="pb-20">
              <QInput
                v-model="lastName"
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
              />
            </div>

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

            <!-- Mot de passe : 10px sous le champ, puis l'indicateur. -->
            <div class="pb-20">
              <div class="pb-10">
                <QInput
                  v-model="password"
                  type="password"
                  icon="ic-lock"
                  :icon-width="12.5"
                  :icon-height="16.25"
                  :icon-bleed="0.6"
                  :label="$t('auth.passwordLabel')"
                  :placeholder="$t('auth.passwordPlaceholder')"
                  :state="passwordState"
                  :disabled="submitting"
                  autocomplete="new-password"
                  name="password"
                  revealable
                />
              </div>
              <QPasswordStrength :score="score" :hint="strengthHint" :hint-tone="strengthTone" />
            </div>

            <!-- Confirmation + conditions -->
            <div class="flex flex-col gap-22 pb-20">
              <div>
                <QInput
                  v-model="passwordConfirm"
                  type="password"
                  icon="ic-lock"
                  :icon-width="12.5"
                  :icon-height="16.25"
                  :icon-bleed="0.6"
                  :label="$t('auth.register.confirmLabel')"
                  :placeholder="$t('auth.passwordPlaceholder')"
                  :state="confirmState"
                  :disabled="submitting"
                  autocomplete="new-password"
                  name="password_confirmation"
                  revealable
                />
                <p
                  v-if="matchHint"
                  :class="['mt-6 mb-0 text-xs leading-16', matchHint.tone === 'ok' ? 'text-success' : 'text-danger']"
                >
                  {{ matchHint.text }}
                </p>
              </div>

              <QCheckbox v-model="acceptedTerms" :invalid="Boolean(fieldErrors.terms)" :error="fieldErrors.terms?.[0]">
                {{ $t('auth.register.cguPrefix') }}
                <NuxtLink
                  :to="localePath('/pages/cgu')"
                  class="text-link-cgu underline decoration-skip-ink-none [text-underline-position:from-font]"
                >{{ $t('auth.register.cguTerms') }}</NuxtLink>
                {{ $t('auth.register.cguSeparator') }}
                <!-- Le slug administré est `privacy`, pas `politique-de-confidentialite`. -->
                <NuxtLink
                  :to="localePath('/pages/privacy')"
                  class="text-link-cgu underline decoration-skip-ink-none [text-underline-position:from-font]"
                >{{ $t('auth.register.cguPrivacy') }}</NuxtLink>
              </QCheckbox>
            </div>
          </div>

          <div class="pt-5">
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary p-16 text-xl leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.register.submit') }}</span>
            </button>
          </div>
        </form>

        <!-- Étape 2 — le code reçu par e-mail. Absente de la maquette : rendue
             avec les mêmes primitives, dans la même carte. -->
        <form v-else novalidate @submit.prevent="onConfirm">
          <QInput
            v-model="code"
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
          />

          <div class="pt-20">
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary p-16 text-xl leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.register.codeSubmit') }}</span>
            </button>
          </div>

          <div class="flex justify-center pt-14">
            <QButton variant="link" size="sm" @click="onResend">{{ $t('auth.register.resend') }}</QButton>
          </div>
        </form>
      </div>

      <!-- Hors de la carte, comme dans la maquette. -->
      <template v-if="step === 'form'">
        <div class="flex items-center py-14">
          <span aria-hidden="true" class="h-1 flex-1 bg-border" />
          <span class="px-10 text-base leading-16 font-medium tracking-widest whitespace-nowrap text-muted-2 uppercase">
            {{ $t('auth.orContinueWith') }}
          </span>
          <span aria-hidden="true" class="h-1 flex-1 bg-border" />
        </div>

        <AuthSocialRow :configured="socialConfigured" :pending="socialPending" @select="onSocial" />
      </template>
    </div>

    <!-- Besoin d'aide ? -->
    <div class="flex min-h-86 items-center justify-between rounded-xl bg-surface-2 px-9 py-21">
      <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary-soft">
        <QIcon name="ic-headset" :size="24" />
      </span>
      <div class="min-w-0 flex-1 px-11">
        <p class="m-0 text-base leading-20 font-bold text-text">{{ $t('auth.register.helpTitle') }}</p>
        <p class="m-0 pt-4 text-sm leading-16 font-normal text-text">{{ $t('auth.register.helpDescription') }}</p>
      </div>
      <SupportLink
        class="inline-flex shrink-0 rounded-xl border border-primary-link px-15 py-9 text-sm leading-normal font-medium whitespace-nowrap text-primary-link no-underline"
      >
        {{ $t('auth.register.helpCta') }}
      </SupportLink>
    </div>
  </div>
</template>
