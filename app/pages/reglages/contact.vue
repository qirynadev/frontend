<script setup lang="ts">
/**
 * Centre d’aide — Envoyer un message ← capture produit (WhatsApp 2026-08-23).
 * Succès « Demande envoyée ! » ← capture (WhatsApp 2026-08-23, 20:16).
 *
 * Câblé sur `POST /user/messages` (réel côté API, authentifié — vérifié en
 * direct 2026-08-27) : c'est le même mécanisme que la rubrique « Messagerie »
 * du back-office (`Messaging::create`, visible immédiatement dans son écran
 * admin `Messages/Index`, en plus d'envoyer l'e-mail de notification comme
 * `/send-email` — voir `MessageController::sendMessage` côté back-office).
 * Préféré à `/send-email` (essayé d'abord, gardé en repli documentaire) :
 * celui-ci n'enregistre rien en base (`TODO #56` dans le code source réel),
 * donc rien de visible pour l'équipe support en dehors d'une boîte mail.
 *
 * `POST /user/messages` n'a qu'un seul champ (`text`) et ignore tout nom/
 * e-mail transmis — le message part **au nom du compte connecté**, avec son
 * profil réel. Sujet/nom/e-mail saisis dans le formulaire sont donc regroupés
 * dans ce texte plutôt que perdus. Écran succès inchangé (données du
 * formulaire + repli `contact-success-mock.ts`). Doc :
 * `docs/reglages-contact-mocks.md`.
 *
 * Espacement vertical **22px** entre blocs majeurs (topbar → sections).
 */
import { contactSuccessMock } from '~/config/contact-success-mock'
import { contactRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'
import { ApiError } from '~/core/http/errors'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()

const MESSAGE_MAX = 1000

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

async function onSubmit(): Promise<void> {
  if (!validate()) return

  submitting.value = true
  submitError.value = false
  try {
    await contactRepo.send({ text: buildMessageText() }, locale.value)
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
    icon: '/img/icons/contact-success/row-subject.svg',
    labelKey: 'settingsContact.successSubjectLabel',
    value: subjectLabel.value,
  },
  {
    id: 'name',
    icon: '/img/icons/contact-success/row-user.svg',
    labelKey: 'settingsContact.successNameLabel',
    value: summaryName.value,
  },
  {
    id: 'email',
    icon: '/img/icons/contact-success/row-email.svg',
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
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" :gap="0" />

      <!-- ── Succès « Demande envoyée ! » ── -->
      <template v-if="submitted">
        <section class="flex w-full flex-col items-center text-center" role="status">
          <img
            src="/img/icons/contact-success/hero.svg"
            alt=""
            width="168"
            height="168"
            class="block size-168"
          >
          <h1 class="m-0 pt-16 text-4xl leading-normal font-semibold tracking-[-0.65px] text-navy">
            {{ $t('settingsContact.successTitle') }}
          </h1>
          <p class="m-0 mt-6 text-xl leading-[22.75px] font-normal text-muted-2">
            {{ $t('settingsContact.successSubtitle') }}
          </p>
        </section>

        <aside class="box-border flex w-full items-start gap-12 rounded-xl bg-success-bg px-14 py-14">
          <img
            src="/img/icons/contact-success/check.svg"
            alt=""
            width="24"
            height="24"
            class="mt-2 block size-24 shrink-0"
          >
          <div class="min-w-0 flex-1">
            <p class="m-0 text-base leading-18 font-bold text-navy">
              {{ $t('settingsContact.successBannerTitle') }}
            </p>
            <p class="m-0 mt-4 text-sm leading-16 font-normal text-navy">
              {{ $t('settingsContact.successBannerDesc') }}
            </p>
          </div>
        </aside>

        <section
          class="box-border flex w-full flex-col rounded-[16px] bg-surface px-4 py-4"
          :aria-label="$t('settingsContact.successSummaryLabel')"
        >
          <template v-for="(row, index) in summaryRows" :key="row.id">
            <div class="flex w-full items-center gap-12 px-12 py-14">
              <span class="flex size-40 shrink-0 items-center justify-center rounded-full bg-primary-bg">
                <img :src="row.icon" alt="" width="18" height="18" class="block size-18">
              </span>
              <div class="min-w-0 flex-1">
                <p class="m-0 text-sm leading-15 font-normal text-muted-2">{{ $t(row.labelKey) }}</p>
                <p class="m-0 mt-2 text-xl leading-20 font-semibold text-navy">{{ row.value }}</p>
              </div>
            </div>
            <!-- Séparateur inset : fine ligne grise, pas pleine largeur -->
            <div
              v-if="index < summaryRows.length - 1"
              class="mx-20 h-0 border-t border-[#E8E8F0]"
              aria-hidden="true"
            />
          </template>
        </section>

        <NuxtLink
          :to="localePath('/')"
          class="box-border flex w-full items-center justify-center gap-10 rounded-xl bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white no-underline"
        >
          <img src="/img/icons/contact-success/home.svg" alt="" width="20" height="20" class="block size-20 shrink-0">
          <span>{{ $t('settingsContact.successHomeCta') }}</span>
        </NuxtLink>
      </template>

      <!-- ── Formulaire ── -->
      <template v-else>
        <section class="w-full">
          <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-navy">
            {{ $t('settingsContact.title') }}
          </h1>
          <p class="m-0 mt-2 text-lg leading-[22.75px] font-normal text-muted-2">
            {{ $t('settingsContact.subtitle') }}
          </p>
        </section>

        <QAlert
          v-if="submitError"
          tone="danger"
          :title="$t('settingsContact.submitErrorTitle')"
          :message="$t('settingsContact.submitErrorDesc')"
        />

        <form class="flex w-full flex-col gap-22" @submit.prevent="onSubmit">
          <div class="flex w-full flex-col">
            <label for="contact-subject" class="mb-8 text-xl leading-20 font-semibold text-navy">
              {{ $t('settingsContact.subjectLabel') }}
            </label>
            <div class="relative">
              <select
                id="contact-subject"
                v-model="subject"
                :aria-invalid="!!errors.subject || undefined"
                :class="[
                  'box-border w-full appearance-none rounded-xl border bg-white py-15 pr-44 pl-16 text-xl leading-20 font-medium outline-none',
                  subject ? 'text-text' : 'text-muted',
                  errors.subject ? 'border-danger' : 'border-border focus:border-primary',
                ]"
              >
                <option value="" disabled>{{ $t('settingsContact.subjectPlaceholder') }}</option>
                <option v-for="item in subjects" :key="item.id" :value="item.id">
                  {{ $t(item.labelKey) }}
                </option>
              </select>
              <img
                src="/img/icons/ic-contact-chevron.svg"
                alt=""
                width="12"
                height="8"
                class="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2"
                aria-hidden="true"
              >
            </div>
            <p v-if="errors.subject" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.subject }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-name" class="mb-8 text-xl leading-20 font-semibold text-navy">
              {{ $t('settingsContact.nameLabel') }}
            </label>
            <input
              id="contact-name"
              v-model="name"
              type="text"
              autocomplete="name"
              :placeholder="$t('settingsContact.namePlaceholder')"
              :aria-invalid="!!errors.name || undefined"
              :class="[
                'box-border w-full rounded-xl border bg-white px-16 py-15 text-xl leading-20 font-medium text-text outline-none placeholder:text-muted',
                errors.name ? 'border-danger' : 'border-border focus:border-primary',
              ]"
            >
            <p v-if="errors.name" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.name }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-email" class="mb-8 text-xl leading-20 font-semibold text-navy">
              {{ $t('settingsContact.emailLabel') }}
            </label>
            <input
              id="contact-email"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              :placeholder="$t('settingsContact.emailPlaceholder')"
              :aria-invalid="!!errors.email || undefined"
              :class="[
                'box-border w-full rounded-xl border bg-white px-16 py-15 text-xl leading-20 font-medium text-text outline-none placeholder:text-muted',
                errors.email ? 'border-danger' : 'border-border focus:border-primary',
              ]"
            >
            <p v-if="errors.email" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.email }}</p>
          </div>

          <div class="flex w-full flex-col">
            <label for="contact-message" class="mb-8 text-xl leading-20 font-semibold text-navy">
              {{ $t('settingsContact.messageLabel') }}
            </label>
            <div
              :class="[
                'relative box-border w-full rounded-xl border bg-white',
                errors.message ? 'border-danger' : 'border-border focus-within:border-primary',
              ]"
            >
              <textarea
                id="contact-message"
                v-model="message"
                rows="5"
                :maxlength="MESSAGE_MAX"
                :placeholder="$t('settingsContact.messagePlaceholder')"
                :aria-invalid="!!errors.message || undefined"
                class="box-border min-h-120 w-full resize-none rounded-xl border-0 bg-transparent px-16 pt-15 pb-32 text-xl leading-20 font-medium text-text outline-none placeholder:text-muted"
              />
              <span class="pointer-events-none absolute right-14 bottom-12 text-sm leading-15 text-muted" aria-live="polite">
                {{ message.length }}/{{ MESSAGE_MAX }}
              </span>
            </div>
            <p v-if="errors.message" class="mt-6 mb-0 text-xs leading-16 text-danger">{{ errors.message }}</p>
          </div>

          <div class="box-border flex w-full items-start gap-12 rounded-xl bg-surface-2 px-14 py-14">
            <input
              id="contact-consent"
              v-model="consent"
              type="checkbox"
              name="consent"
              :aria-invalid="!!errors.consent || undefined"
              :class="[
                'mt-2 size-18 shrink-0 cursor-pointer appearance-none rounded-sm border-2 bg-white',
                'checked:border-primary-link checked:bg-primary-link',
                errors.consent ? 'border-danger' : 'border-primary-link',
              ]"
            >
            <label for="contact-consent" class="min-w-0 flex-1 cursor-pointer text-base leading-[18px] font-medium text-navy">
              {{ $t('settingsContact.consentBefore') }}
              <NuxtLink
                :to="localePath('/reglages/mentions')"
                class="font-semibold text-primary-link no-underline"
                @click.stop
              >
                {{ $t('settingsContact.privacyLink') }}
              </NuxtLink>
              {{ $t('settingsContact.consentAfter') }}
            </label>
          </div>
          <p v-if="errors.consent" class="-mt-10 mb-0 text-xs leading-16 text-danger">{{ errors.consent }}</p>

          <div class="flex w-full flex-col gap-12">
            <button
              type="submit"
              :disabled="submitting"
              :class="[
                'flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white',
                submitting ? 'cursor-not-allowed opacity-70' : '',
              ]"
            >
              <QSpinner v-if="submitting" size="sm" />
              <span v-else>{{ $t('settingsContact.submit') }}</span>
            </button>

            <p class="m-0 flex items-center justify-center gap-6 text-sm leading-15 text-muted">
              <img src="/img/icons/ic-contact-lock.svg" alt="" width="12" height="14" class="block shrink-0" aria-hidden="true">
              <span>{{ $t('settingsContact.secureNote') }}</span>
            </p>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>
