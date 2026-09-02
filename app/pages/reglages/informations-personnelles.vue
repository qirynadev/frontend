<script setup lang="ts">
/**
 * Réglages — Informations personnelles ← Figma `1553:1020` (Working_Files_Qiryrna).
 *
 * | Bloc | Spéc |
 * |---|---|
 * | sections | `gap-22` (norme produit ; Figma 24px) entre topbar / intro / cartes |
 * | cartes | rayon 16, filet `rp-card-border`, ombre `shadow-rp-card`, fond blanc |
 * | photo | avatar 72 · pastille caméra 27 · CTA outline `rp-photo-cta` |
 * | champs | tuile 46×46 + label 11px `rp-label` + input h-46 rayon 12 |
 * | danger | pastille 48 `rp-delete-bg` · chevron rouge |
 *
 * Pas d’API de mise à jour profil : préremplissage session + repli mock.
 * Doc : `docs/reglages-profil-mocks.md`.
 */
import { reglagesProfilMock } from '~/config/reglages-profil-mock'
import { useSessionStore } from '~/core/stores'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const session = useSessionStore()

const ICON = '/img/icons/reglages-profil'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const birthDate = ref('')
const country = ref('')
const city = ref('')

const photoUrl = computed(() => session.user?.profile.photo ?? session.user?.avatar ?? null)

onMounted(() => {
  const user = session.user
  const profile = user?.profile
  firstName.value = profile?.firstName || reglagesProfilMock.firstName
  lastName.value = profile?.lastName || reglagesProfilMock.lastName
  email.value = user?.email || reglagesProfilMock.email
  phone.value = profile?.phone || reglagesProfilMock.phone
  birthDate.value = reglagesProfilMock.birthDate
  country.value = reglagesProfilMock.country
  city.value = profile?.city || reglagesProfilMock.city
})

type FieldIcon = 'person' | 'email' | 'phone' | 'calendar' | 'pin' | 'city'

interface Field {
  id: string
  labelKey: string
  model: Ref<string>
  icon: FieldIcon
  /** Affiche le drapeau FR dans l’input (téléphone). */
  flag?: boolean
  autocomplete?: string
  inputType?: string
}

const fields = computed<Field[]>(() => [
  { id: 'firstName', labelKey: 'settingsPersonal.firstName', model: firstName, icon: 'person', autocomplete: 'given-name' },
  { id: 'lastName', labelKey: 'settingsPersonal.lastName', model: lastName, icon: 'person', autocomplete: 'family-name' },
  { id: 'email', labelKey: 'settingsPersonal.email', model: email, icon: 'email', autocomplete: 'email', inputType: 'email' },
  { id: 'phone', labelKey: 'settingsPersonal.phone', model: phone, icon: 'phone', flag: true, autocomplete: 'tel', inputType: 'tel' },
  { id: 'birthDate', labelKey: 'settingsPersonal.birthDate', model: birthDate, icon: 'calendar' },
  { id: 'country', labelKey: 'settingsPersonal.country', model: country, icon: 'pin', autocomplete: 'country-name' },
  { id: 'city', labelKey: 'settingsPersonal.city', model: city, icon: 'city', autocomplete: 'address-level2' },
])

usePageSeo(() => ({
  title: t('settingsPersonal.seoTitle'),
  description: t('settingsPersonal.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rp flex flex-1 flex-col">
    <div class="rp-main flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" :gap="0" />

      <section class="rp-intro w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsPersonal.title') }}
        </h1>
        <p class="m-0 text-xl leading-[22.75px] font-normal text-text">
          {{ $t('settingsPersonal.intro') }}
        </p>
      </section>

      <!-- Photo de profil -->
      <section class="rp-card box-border flex w-full flex-col rounded-[16px] border border-rp-card-border bg-white px-20 py-16 shadow-rp-card">
        <h2 class="m-0 text-exact-16 leading-24 font-semibold text-rp-input">
          {{ $t('settingsPersonal.photoTitle') }}
        </h2>

        <div class="mt-16 flex h-88 w-full items-center">
          <div class="relative flex size-72 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rp-avatar-bg">
            <img
              v-if="photoUrl"
              :src="photoUrl"
              alt=""
              class="absolute inset-0 size-full object-cover"
              width="72"
              height="72"
            >
            <img
              v-else
              :src="`${ICON}/ic-rp-avatar-user.svg`"
              alt=""
              width="32"
              height="32"
              class="relative z-0 block size-32"
            >
            <span
              class="absolute top-[52px] left-[45px] z-1 flex size-27 items-center justify-center overflow-hidden rounded-full border border-rp-camera-border bg-rp-avatar-bg"
              aria-hidden="true"
            >
              <img :src="`${ICON}/ic-rp-camera.svg`" alt="" width="32" height="32" class="block size-32 max-w-none">
            </span>
          </div>

          <div class="flex min-w-0 flex-1 flex-col items-start pl-16">
            <p class="m-0 text-base leading-15 font-normal text-rp-photo-hint">
              {{ $t('settingsPersonal.photoHint') }}
            </p>
            <button
              type="button"
              class="mt-8 box-border flex h-34 w-[140.766px] cursor-pointer items-center justify-center rounded-lg border border-rp-photo-cta-border bg-transparent px-0 text-xl leading-20 font-medium text-rp-photo-cta"
            >
              {{ $t('settingsPersonal.photoCta') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Informations -->
      <section class="rp-card box-border flex w-full flex-col gap-20 rounded-[16px] border border-rp-card-border bg-white p-20 shadow-rp-card">
        <h2 class="m-0 text-exact-16 leading-24 font-semibold text-text">
          {{ $t('settingsPersonal.infoTitle') }}
        </h2>

        <div class="flex w-full flex-col gap-16">
          <label
            v-for="field in fields"
            :key="field.id"
            class="flex w-full items-end gap-11"
            :for="`rp-${field.id}`"
          >
            <!-- Prénom / nom : tuile CSS + glyphe ; autres : tuile SVG Figma -->
            <span
              v-if="field.icon === 'person'"
              class="flex size-46 shrink-0 items-center justify-center rounded-[12px] bg-rp-tile-bg"
              aria-hidden="true"
            >
              <img :src="`${ICON}/ic-rp-person.svg`" alt="" width="20" height="19" class="block">
            </span>
            <img
              v-else
              :src="`${ICON}/ic-rp-${field.icon}-tile.svg`"
              alt=""
              width="46"
              height="46"
              class="block size-46 shrink-0"
            >

            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">
                {{ $t(field.labelKey) }}
              </span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <img
                  v-if="field.flag"
                  :src="`${ICON}/ic-rp-flag.svg`"
                  alt=""
                  width="20"
                  height="14"
                  class="mr-8 block h-14 w-20 shrink-0"
                >
                <input
                  :id="`rp-${field.id}`"
                  v-model="field.model.value"
                  :type="field.inputType || 'text'"
                  :autocomplete="field.autocomplete"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>
        </div>
      </section>

      <!-- Supprimer mon compte -->
      <button
        type="button"
        class="rp-card box-border flex w-full cursor-pointer items-center rounded-[16px] border border-rp-card-border bg-white p-20 text-left shadow-rp-card"
      >
        <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px] bg-rp-delete-bg" aria-hidden="true">
          <img :src="`${ICON}/ic-rp-trash.svg`" alt="" width="24" height="24" class="block size-24">
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-lg leading-20 font-semibold text-rp-input">
            {{ $t('settingsPersonal.deleteTitle') }}
          </span>
          <span class="mt-2 block text-md leading-[13.75px] font-normal text-black">
            {{ $t('settingsPersonal.deleteDesc') }}
          </span>
        </span>
        <img :src="`${ICON}/ic-rp-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
      </button>
    </div>
  </div>
</template>
