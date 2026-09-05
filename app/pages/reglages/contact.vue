<script setup lang="ts">
/**
 * Réglages — Envoyer un message ← Figma `1572:3457`.
 * Confirmation de demande ← Figma `1572:3044`.
 *
 * Entrée hub : `/reglages/centre-aide`.
 *
 * Accessible sans connexion (2026-08-30, sur demande explicite) : cet écran
 * sert aussi de simple page de contact public. Deux chemins selon la
 * session :
 *
 * - **connecté** — `POST /user/messages` (authentifié, vérifié en direct
 *   2026-08-27) : même mécanisme que la rubrique « Messagerie » du
 *   back-office (`Messaging::create`, visible immédiatement dans son écran
 *   admin `Messages/Index`), en plus de l'e-mail de notification. Un seul
 *   champ (`text`) et ignore tout nom/e-mail transmis — le message part **au
 *   nom du compte connecté**, avec son profil réel. C'est pourquoi les champs
 *   Nom/E-mail sont **préremplis et désactivés** dans ce cas : les modifier
 *   n'aurait aucun effet côté back-office, le laisser croire le contraire
 *   serait trompeur.
 * - **non connecté** — `POST /send-email` (public, `messages/public.post.ts`)
 *   : aucun compte pour fournir nom/e-mail à sa place, ces champs restent
 *   donc éditables. N'enregistre rien en base (`TODO #56` dans le code
 *   source réel de cette route) — e-mail de notification seulement, voir
 *   `docs/directives-backend.md`.
 *
 * Sujet/nom/e-mail saisis dans le formulaire n'ont pas de champ dédié côté
 * `/user/messages` : regroupés dans `text` plutôt que perdus (chemin
 * connecté uniquement). Écran succès inchangé (données du formulaire + repli
 * `contact-success-mock.ts`). Doc : `docs/reglages-contact-mocks.md`.
 *
 * Espacement **22px** entre blocs majeurs.
 */
import { contactSuccessMock } from '~/config/contact-success-mock'
import { ApiError } from '~/core/http/errors'
import { contactRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()
const isAuthenticated = computed(() => session.isAuthenticated)

const MESSAGE_MAX = 1000
const FORM_ICON = '/img/icons/contact-form'
const SUCCESS_ICON = '/img/icons/contact-success'

const subjects = [
  { id: 'general', labelKey: 'settingsContact.subjectGeneral' },
  { id: 'account', labelKey: 'settingsContact.subjectAccount' },
  { id: 'billing', labelKey: 'settingsContact.subjectBilling' },
  { id: 'accompaniment', labelKey: 'settingsContact.subjectAccompaniment' },
  { id: 'technical', labelKey: 'settingsContact.subjectTechnical' },
  { id: 'other', labelKey: 'settingsContact.subjectOther' },
] as const

const subject = ref('')
const name = ref('')
const email = ref('')
const message = ref('')
const consent = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref(false)

const errors = reactive({
  subject: '',
  name: '',
  email: '',
  message: '',
  consent: '',
})

onMounted(() => {
  const user = session.user
  if (!user) return
  if (!name.value && user.name) name.value = user.name
  if (!email.value && user.email) email.value = user.email
})

function validate(): boolean {
  errors.subject = subject.value ? '' : t('settingsContact.errorSubject')
  errors.name = name.value.trim().length > 1 ? '' : t('settingsContact.errorName')
  errors.email = /.+@.+\..+/.test(email.value.trim()) ? '' : t('settingsContact.errorEmail')
  errors.message = message.value.trim().length > 0 ? '' : t('settingsContact.errorMessage')
  if (message.value.length > MESSAGE_MAX) errors.message = t('settingsContact.errorMessageMax')
  errors.consent = consent.value ? '' : t('settingsContact.errorConsent')
  return !errors.subject && !errors.name && !errors.email && !errors.message && !errors.consent
}

/**
 * `POST /user/messages` n'a qu'un champ `text` — sujet/nom/e-mail saisis
 * dans le formulaire sont regroupés ici plutôt que perdus (le message part
 * de toute façon au nom du compte connecté, dont l'identité réelle prime).
 */
function buildMessageText(): string {
  return [
    t('settingsContact.messageLineSubject', { value: subjectLabel.value }),
    t('settingsContact.messageLineName', { value: name.value.trim() }),
    t('settingsContact.messageLineEmail', { value: email.value.trim() }),
    '',
    message.value.trim(),
  ].join('\n')
}

/**
 * `POST /send-email` exige `first_name`/`last_name` séparés — le formulaire
 * n'a qu'un champ Nom unique. Coupé sur le premier espace ; un nom sans
 * espace sert pour les deux plutôt que d'envoyer un `last_name` vide (rejeté
 * par la validation du back-office).
 */
function splitName(): { firstName: string, lastName: string } {
  const parts = name.value.trim().split(/\s+/)
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') || parts[0] || '' }
}

async function onSubmit(): Promise<void> {
  if (!validate()) return

  submitting.value = true
  submitError.value = false
  try {
    if (isAuthenticated.value) {
      await contactRepo.send({ text: buildMessageText() }, locale.value)
    }
    else {
      const { firstName, lastName } = splitName()
      await contactRepo.sendPublic(
        { firstName, lastName, email: email.value.trim(), subject: subjectLabel.value, message: message.value.trim() },
        locale.value,
      )
    }
    submitted.value = true
  }
  catch (error) {
    if (error instanceof ApiError && error.kind === 'validation') {
      errors.message = t('settingsContact.errorMessage')
    }
    submitError.value = true
  }
  finally {
    submitting.value = false
  }
}

const subjectLabel = computed(() => {
  const entry = subjects.find((item) => item.id === subject.value)
  if (entry) return t(entry.labelKey)
  return contactSuccessMock.subjectLabel
})

const summaryName = computed(() => name.value.trim() || contactSuccessMock.name)
const summaryEmail = computed(() => email.value.trim() || contactSuccessMock.email)

const summaryRows = computed(() => [
  {
    id: 'subject',
    icon: `${SUCCESS_ICON}/row-subject.svg`,
    labelKey: 'settingsContact.successSubjectLabel',
    value: subjectLabel.value,
  },
  {
    id: 'name',
    icon: `${SUCCESS_ICON}/row-user.svg`,
    labelKey: 'settingsContact.successNameLabel',
    value: summaryName.value,
  },
  {
    id: 'email',
    icon: `${SUCCESS_ICON}/row-email.svg`,
    labelKey: 'settingsContact.successEmailLabel',
    value: summaryEmail.value,
  },
])

usePageSeo(() => ({
  title: submitted.value ? t('settingsContact.successSeoTitle') : t('settingsContact.seoTitle'),
  description: t('settingsContact.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-contact flex flex-1 flex-col">
    <div class="flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages/centre-aide" :gap="0" />

      <!-- ── Confirmation de demande (Figma 1572:3044) ── -->
      <template v-if="submitted">
        <section class="flex w-full flex-col items-center text-center" role="status">
          <img
            :src="`${SUCCESS_ICON}/hero.png`"
            alt=""
            width="160"
            height="106"
            class="block h-106 w-160 object-contain"
          >
          <h1 class="m-0 mt-0 text-5xl leading-[31.25px] font-semibold tracking-[-0.625px] text-text">
            {{ $t('settingsContact.successTitle') }}
          </h1>
          <p class="m-0 text-xl leading-normal font-normal text-text">
            {{ $t('settingsContact.successSubtitle') }}
          </p>
        </section>

        <aside class="box-border flex w-full items-start rounded-[10px] border border-cf-success-border bg-cf-success-bg p-16">
          <span class="mr-12 mt-2 flex size-28 shrink-0 items-center justify-center rounded-full bg-cf-success-dot">
            <img :src="`${SUCCESS_ICON}/check-banner.svg`" alt="" width="16" height="16" class="block size-16">
          </span>
          <div class="min-w-0 flex-1 pt-2">
            <p class="m-0 text-lg leading-[19.25px] font-semibold text-black">
              {{ $t('settingsContact.successBannerTitle') }}
            </p>
            <p class="m-0 mt-2 text-base leading-[17.875px] font-normal text-black">
              {{ $t('settingsContact.successBannerDesc') }}
            </p>
          </div>
        </aside>

        <section
          class="box-border flex w-full flex-col rounded-[10px] border border-cf-summary-border bg-cf-summary-bg p-20 shadow-2xs"
          :aria-label="$t('settingsContact.successSummaryLabel')"
        >
          <template v-for="(row, index) in summaryRows" :key="row.id">
            <div class="flex w-full items-center">
              <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-full bg-cf-summary-icon">
                <img :src="row.icon" alt="" width="24" height="24" class="block size-24">
              </span>
              <div class="min-w-0 flex-1">
                <p class="m-0 text-lg leading-[18.75px] font-normal text-cf-summary-label">{{ $t(row.labelKey) }}</p>
                <p class="m-0 mt-2 text-xl leading-[22.5px] font-bold text-cf-summary-value">{{ row.value }}</p>
              </div>
            </div>
            <div
              v-if="index < summaryRows.length - 1"
              class="my-16 ml-64 h-px w-[calc(100%-64px)] bg-cf-summary-divider"
              aria-hidden="true"
            />
          </template>
        </section>

        <NuxtLink
          :to="localePath('/')"
          class="box-border flex w-full items-center justify-center gap-10 rounded-[10px] bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white no-underline"
        >
          <img :src="`${SUCCESS_ICON}/home.svg`" alt="" width="15" height="15" class="block size-15 shrink-0">
          <span>{{ $t('settingsContact.successHomeCta') }}</span>
        </NuxtLink>
      </template>

      <!-- ── Envoyer un message (Figma 1572:3457) ── -->
      <template v-else>
        <section class="w-full">
          <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
            {{ $t('settingsContact.title') }}
          </h1>
          <p class="m-0 text-xl leading-21 font-normal text-ca-muted">
            {{ $t('settingsContact.subtitle') }}
          </p>
        </section>

        <QAlert
          v-if="submitError"
          tone="danger"
          :title="$t('settingsContact.submitErrorTitle')"
          :message="$t('settingsContact.submitErrorDesc')"
        />

        <form class="flex w-full flex-col gap-12" @submit.prevent="onSubmit">
          <div class="flex w-full flex-col">
            <label for="contact-subject" class="text-xl leading-21 font-medium text-cf-label">
              {{ $t('settingsContact.subjectLabel') }}
            </label>
            <div class="relative mt-4">
              <select
                id="contact-subject"
                v-model="subject"
                :aria-invalid="!!errors.subject || undefined"
                :class="[
                  'box-border w-full appearance-none rounded-[12px] border bg-white px-12 py-12 text-lg leading-20 font-normal outline-none',
                  subject ? 'text-text' : 'text-cf-placeholder',
                  errors.subject ? 'border-danger' : 'border-cf-input',
                ]"
              >
                <option value="" disabled>{{ $t('settingsContact.subjectPlaceholder') }}</option>
                <option v-for="item in subjects" :key="item.id" :value="item.id">
                  {{ $t(item.labelKey) }}
                </option>
              </select>
              <img
                :src="`${FORM_ICON}/ic-cf-chevron.svg`"
                alt=""
                width="20"
                height="20"
                class="pointer-events-none absolute top-1/2 right-12 size-20 -translate-y-1/2"
                aria-hidden="true"
              >
            </div>
            <p v-if="errors.subject" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.subject }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-name" class="text-xl leading-21 font-medium text-cf-label">
              {{ $t('settingsContact.nameLabel') }}
            </label>
            <input
              id="contact-name"
              v-model="name"
              type="text"
              autocomplete="name"
              :disabled="isAuthenticated"
              :placeholder="$t('settingsContact.namePlaceholder')"
              :aria-invalid="!!errors.name || undefined"
              :class="[
                'mt-4 box-border w-full rounded-[12px] border bg-white px-12 py-12 text-lg leading-20 font-normal text-text outline-none placeholder:text-cf-placeholder disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted-2',
                errors.name ? 'border-danger' : 'border-cf-input',
              ]"
            >
            <p v-if="errors.name" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.name }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-email" class="text-xl leading-21 font-medium text-cf-label">
              {{ $t('settingsContact.emailLabel') }}
            </label>
            <input
              id="contact-email"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              :disabled="isAuthenticated"
              :placeholder="$t('settingsContact.emailPlaceholder')"
              :aria-invalid="!!errors.email || undefined"
              :class="[
                'mt-4 box-border w-full rounded-[12px] border bg-white px-12 py-12 text-lg leading-20 font-normal text-text outline-none placeholder:text-cf-placeholder disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted-2',
                errors.email ? 'border-danger' : 'border-cf-input',
              ]"
            >
            <p v-if="errors.email" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.email }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-message" class="text-xl leading-21 font-medium text-cf-label">
              {{ $t('settingsContact.messageLabel') }}
            </label>
            <div
              :class="[
                'relative mt-4 box-border w-full rounded-[12px] border bg-white',
                errors.message ? 'border-danger' : 'border-cf-input',
              ]"
            >
              <textarea
                id="contact-message"
                v-model="message"
                :maxlength="MESSAGE_MAX"
                :placeholder="$t('settingsContact.messagePlaceholder')"
                :aria-invalid="!!errors.message || undefined"
                class="box-border h-157 w-full resize-none rounded-[12px] border-0 bg-transparent px-12 pt-12 pb-36 text-lg leading-20 font-normal text-text outline-none placeholder:text-cf-placeholder"
              />
              <span class="pointer-events-none absolute right-12 bottom-12 text-base leading-18 font-medium text-ca-muted" aria-live="polite">
                {{ message.length }}/{{ MESSAGE_MAX }}
              </span>
            </div>
            <p v-if="errors.message" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.message }}</p>
          </div>

          <div class="mt-8 box-border flex w-full items-start gap-10 rounded-[16px] bg-cf-consent p-16">
            <input
              id="contact-consent"
              v-model="consent"
              type="checkbox"
              name="consent"
              :aria-invalid="!!errors.consent || undefined"
              :class="[
                'mt-2 size-14 shrink-0 cursor-pointer appearance-none rounded-[4px] border-[1.2px] bg-white',
                'checked:border-cf-consent-check checked:bg-cf-consent-check',
                errors.consent ? 'border-danger' : 'border-cf-consent-check',
              ]"
            >
            <label for="contact-consent" class="min-w-0 flex-1 cursor-pointer text-exact-13-5 leading-[18.563px] font-normal text-cf-consent-text">
              {{ $t('settingsContact.consentBefore') }}
              <NuxtLink
                :to="localePath('/reglages/mentions')"
                class="font-medium text-cf-consent-link no-underline"
                @click.stop
              >
                {{ $t('settingsContact.privacyLink') }}
              </NuxtLink>
              {{ $t('settingsContact.consentAfter') }}
            </label>
          </div>
          <p v-if="errors.consent" class="m-0 text-xs leading-16 text-danger">{{ errors.consent }}</p>

          <div class="mt-8 flex w-full flex-col">
            <button
              type="submit"
              :disabled="submitting"
              :class="[
                'flex w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-cf-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white',
                submitting ? 'cursor-not-allowed opacity-70' : '',
              ]"
            >
              <QSpinner v-if="submitting" size="sm" />
              <span v-else>{{ $t('settingsContact.submit') }}</span>
            </button>

            <p class="m-0 mt-0 flex h-47 items-center justify-center gap-6 text-exact-12-5 leading-[18.75px] text-ca-muted">
              <img :src="`${FORM_ICON}/ic-cf-lock.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" aria-hidden="true">
              <span>{{ $t('settingsContact.secureNote') }}</span>
            </p>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>
