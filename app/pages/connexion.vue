<script setup lang="ts">
/**
 * Connexion ← `maquette/pwa/pages/connexion.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | logo | cadre 150×47 centré, `padding-bottom: 20px` |
 * | accroche | `.connexion-hero` `padding: 30px 0 7px`, `gap: 10px` · texte `flex: 1 1 0`, `min-height: 84.75px` |
 * | titre | 20px / 31,25px, `-0.625px`, insécable — sauf sous 360px |
 * | illustration | cadre 185×178, image 250×204 décalée de −41 / −26 · au-delà de 520px, cadre et image en pourcentage |
 * | bascule | `.auth-toggle` bord 1px, rayon 10, `padding: 7px`, `padding-top: 24px` |
 * | carte | `padding: 25px 20px`, rayon 10, ombre `0 0 3.5px` · champs `gap: 22px` |
 * | oubli | rangée de 32px, alignée à droite, lien 12px souligné |
 * | envoi | `padding-top: 5px`, bouton `padding: 16px` |
 * | séparateur | `padding: 14px 0`, libellé `padding: 0 10px`, `letter-spacing: 0.8px` |
 * | réseaux | `gap: 5px`, boutons `flex: 1 1 0` |
 * | arguments | `margin-top: 24px`, hauteur 200px, `padding: 21px 17px`, `gap: 15px` |
 *
 * ### Les quatre états
 *
 * Cet écran ne charge aucune donnée : son état de **chargement** est celui de
 * l'envoi (bouton occupé, champs verrouillés), son état **vide** n'existe pas,
 * et son état d'**erreur** est un encart au-dessus des champs — placé là parce
 * qu'une erreur affichée sous le bouton, hors du champ de vision après le
 * clic, passe inaperçue.
 *
 * ### Ce que la maquette ne dit pas
 *
 * Elle dessine Google / Apple / Facebook ; le back-office n'expose ni Apple ni
 * quoi que ce soit d'autre que `google`, `facebook`, `linkedin`. Voir
 * `AuthSocialRow.vue`.
 */
import { ApiError } from '~/core/http/errors'
import { paymentRepo } from '~/core/repositories'
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
} = useSocialAuth('login')

const email = ref('')
const password = ref('')
const submitting = ref(false)
/** Clé i18n ou message déjà traduit — jamais le message brut de l'API. */
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

/**
 * Un utilisateur déjà connecté n'a rien à faire ici — sauf s'il a un paiement
 * en attente, auquel cas l'écran devient l'étape de reprise.
 *
 * Fait au `setup`, donc dès le rendu serveur : la page n'est jamais peinte
 * avant d'être redirigée.
 */
await redirectIfAuthenticated()

/** Rappel de la commande à reprendre. Chargé seulement quand il y en a une. */
const pendingIntent = ref<PaymentIntent | null>(null)

watchEffect(async () => {
  if (!session.pendingPayment || !import.meta.client) return
  pendingIntent.value = await paymentRepo.pendingIntent().catch(() => null)
})

onMounted(async () => {
  // Retour de la redirection LinkedIn : `?code=…&state=…` sur cette même URL.
  const result = await handleLinkedinReturn()
  if (result?.outcome) await finish(() => resume(result.outcome))
})

/** Facteur commun des trois chemins d'authentification (mot de passe, tiers, reprise). */
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

  if (email.value.trim() === '') fieldErrors.value.email = [t('auth.error.emailRequired')]
  // Contrôle volontairement large : le seul juge de la validité d'une adresse
  // est le serveur de messagerie. Ce test n'écarte que les fautes de frappe.
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) fieldErrors.value.email = [t('auth.error.emailInvalid')]

  if (password.value === '') fieldErrors.value.password = [t('auth.error.passwordRequired')]

  return Object.keys(fieldErrors.value).length === 0
}

async function onSubmit(): Promise<void> {
  formError.value = null
  if (!validate() || submitting.value) return

  submitting.value = true
  try {
    const outcome = await session.login({ email: email.value.trim(), password: password.value }, locale.value)
    await finish(() => resume(outcome))
  }
  catch (error) {
    if (error instanceof ApiError) {
      fieldErrors.value = mapFieldErrors(error)
      // `error.message` distingue « identifiants refusés » de « compte pas
      // encore confirmé »/« compte désactivé » (back-office : trois échecs
      // distincts, tous en 400 sur `POST /auth/login`) — l'écraser par un
      // générique masquait ces deux derniers cas derrière « mot de passe
      // incorrect », un message trompeur pour qui a le bon mot de passe mais
      // n'a jamais entré son code de confirmation.
      formError.value = error.kind === 'validation'
        ? (error.message || t('auth.error.credentials'))
        : error.kind === 'network' || error.kind === 'timeout'
          ? t('auth.error.network')
          : t('auth.error.generic')
    }
    else {
      formError.value = t('auth.error.generic')
    }
  }
  finally {
    submitting.value = false
  }
}

/** L'API indexe ses erreurs sous les noms Laravel ; l'écran connaît les siens. */
function mapFieldErrors(error: ApiError): Record<string, string[]> {
  const mapped: Record<string, string[]> = {}
  if (error.fieldErrors.email) mapped.email = error.fieldErrors.email
  if (error.fieldErrors.password) mapped.password = error.fieldErrors.password
  return mapped
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

async function onResume(): Promise<void> {
  formError.value = null
  submitting.value = true
  await finish(() => resume({ user: session.user!, pendingPayment: true }))
  submitting.value = false
}

const visibleError = computed(() => formError.value ?? (socialErrorKey.value ? t(socialErrorKey.value) : null))

usePageSeo(() => ({
  title: t('auth.login.seoTitle'),
  description: t('auth.login.seoDescription'),
  // Un écran d'authentification n'a rien à faire dans un index.
  noindex: true,
}))
</script>

<template>
  <div>
    <!-- Logo — cadre 150×47, centré, 20px sous lui. -->
    <div class="pb-20">
      <NuxtLink :to="localePath('/')" class="mx-auto block w-fit no-underline" :aria-label="$t('nav.home')">
        <AppLogo :width="150" :height="47" />
      </NuxtLink>
    </div>

    <!-- Accroche + illustration -->
    <div class="flex items-start gap-10 pt-30 pb-7">
      <div class="min-h-[84.75px] min-w-0 flex-1">
        <h1
          class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] whitespace-nowrap text-text max-3xs:whitespace-normal"
        >
          {{ $t('auth.login.title') }}
        </h1>
        <div class="pt-8 text-xl leading-normal font-normal text-text">
          <p class="m-0">{{ $t('auth.login.introLine1') }}</p>
          <p class="m-0">{{ $t('auth.login.introLine2') }}</p>
        </div>
      </div>

      <div
        class="relative h-178 w-185 shrink-0 grow-0 basis-185 min-[520px]:h-[clamp(178px,23%,212px)] min-[520px]:w-[clamp(185px,24%,220px)] min-[520px]:basis-[clamp(185px,24%,220px)]"
      >
        <img
          src="/img/hero-connexion.webp"
          alt=""
          width="250"
          height="204"
          class="absolute -top-26 -left-41 h-204 w-250 max-w-none object-cover min-[520px]:top-[-14.61%] min-[520px]:left-[-22.16%] min-[520px]:h-[114.61%] min-[520px]:w-[135.14%]"
        >
      </div>
    </div>

    <!-- Se connecter / S'inscrire -->
    <div class="pt-24">
      <AuthToggle active="signIn" />
    </div>

    <!-- Formulaire -->
    <div class="pt-15">
      <div class="rounded-xl bg-surface-card px-20 py-25 shadow-card">
        <!-- Reprise d'un paiement interrompu : proposée, jamais déclenchée seule. -->
        <QAlert
          v-if="session.pendingPayment"
          tone="info"
          :title="$t('auth.resume.title')"
          :message="$t('auth.resume.description', { label: pendingIntent?.label ?? '' })"
          class="mb-22"
        />

        <QAlert
          v-if="visibleError"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="visibleError"
          class="mb-22"
        />

        <!-- Le fournisseur demande de rattacher son compte à un compte existant. -->
        <QAlert
          v-if="linkRequest"
          tone="warning"
          :title="$t('auth.social.link.title')"
          :message="$t('auth.social.link.description', {
            email: linkRequest.email,
            provider: linkRequest.provider,
          })"
          class="mb-22"
        >
          <template #actions>
            <QButton size="sm" @click="onConfirmLink">{{ $t('auth.social.link.confirm') }}</QButton>
            <QButton size="sm" variant="ghost" @click="cancelLink">{{ $t('auth.social.link.cancel') }}</QButton>
          </template>
        </QAlert>

        <form novalidate @submit.prevent="onSubmit">
          <div class="flex flex-col gap-22">
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

            <QInput
              v-model="password"
              type="password"
              icon="ic-lock"
              :icon-width="12.5"
              :icon-height="16.25"
              :icon-bleed="0.6"
              :label="$t('auth.passwordLabel')"
              :placeholder="$t('auth.passwordPlaceholder')"
              :error="fieldErrors.password?.[0]"
              :disabled="submitting"
              autocomplete="current-password"
              name="password"
              revealable
            />

            <!-- Rangée de 32px, lien aligné en haut à droite. -->
            <div class="flex h-32 items-start justify-end">
              <NuxtLink
                :to="localePath('/mot-de-passe')"
                class="text-base leading-16 font-medium text-link-forgot underline decoration-skip-ink-none [text-underline-position:from-font]"
              >
                <!-- L'espace insécable finale vient de la maquette : sur un lien
                     ajusté à son contenu, elle allonge le soulignement de 3,6px.
                     Elle vit ici plutôt que dans la traduction, où elle serait
                     invisible et retirée à la première relecture. -->
                {{ $t('auth.forgotPassword') }}&nbsp;
              </NuxtLink>
            </div>
          </div>

          <div class="pt-5">
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary p-16 text-xl leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QSpinner v-if="submitting" size="sm" class="text-white" />
              <span v-else>{{ $t('auth.signIn') }}</span>
            </button>
          </div>

          <!-- Séparateur « ou continuer avec » -->
          <div class="flex items-center py-14">
            <span aria-hidden="true" class="h-1 flex-1 bg-border" />
            <span class="px-10 text-base leading-16 font-medium tracking-widest whitespace-nowrap text-muted-2 uppercase">
              {{ $t('auth.orContinueWith') }}
            </span>
            <span aria-hidden="true" class="h-1 flex-1 bg-border" />
          </div>

          <AuthSocialRow :configured="socialConfigured" :pending="socialPending" @select="onSocial" />
        </form>
      </div>
    </div>

    <!-- Trois arguments. La maquette fixe la hauteur à 200px alors que son
         contenu en occupe 217 : les rangées débordent de 17px sous le fond
         teinté. Le comportement est reproduit tel quel — c'est le dernier bloc
         de la page, et rien n'est masqué. -->
    <div class="mt-24 flex h-200 flex-col gap-15 rounded-xl border border-surface-border bg-surface px-17 py-21">
      <div class="flex items-center gap-5">
        <QIcon name="ic-shield" :size="40" />
        <div class="min-w-0">
          <p class="m-0 text-base leading-20 font-semibold text-navy">{{ $t('auth.login.infoSecureTitle') }}</p>
          <p class="m-0 min-h-22 text-md leading-[19.5px] font-normal text-navy">{{ $t('auth.login.infoSecureDesc') }}</p>
        </div>
      </div>

      <div class="flex h-42 items-center gap-5">
        <QIcon name="ic-person" :size="40" />
        <div class="min-w-0">
          <p class="m-0 text-base leading-20 font-semibold text-navy">{{ $t('auth.login.infoPersonalTitle') }}</p>
          <p class="m-0 min-h-22 text-md leading-[19.5px] font-normal text-navy">{{ $t('auth.login.infoPersonalDesc') }}</p>
        </div>
      </div>

      <div class="flex items-start gap-5">
        <QIcon name="ic-clock" :size="40" />
        <div class="min-w-0">
          <p class="m-0 text-base leading-20 font-semibold text-navy">{{ $t('auth.login.infoTimeTitle') }}</p>
          <p class="m-0 min-h-22 text-md leading-[19.5px] font-normal text-navy">{{ $t('auth.login.infoTimeDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Bouton de reprise, hors formulaire : il n'appartient pas à la connexion. -->
    <div v-if="session.pendingPayment && session.isAuthenticated" class="pt-24">
      <QButton block :loading="submitting" @click="onResume">{{ $t('auth.resume.cta') }}</QButton>
    </div>
  </div>
</template>
