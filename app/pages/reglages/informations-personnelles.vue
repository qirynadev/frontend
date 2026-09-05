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
 * `POST /user/update-profile` (`authRepo.updateProfile`) : enregistre
 * réellement en base. L'e-mail reste en lecture seule (champ non pris en
 * charge par cet endpoint, jamais transmis) ; le pays est un identifiant
 * réel (`lc_country_id`, `countryRepo`), plus un texte libre.
 */
import { ApiError } from '~/core/http/errors'
import { authRepo, countryRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()

const ICON = '/img/icons/reglages-profil'

const profile = session.user?.profile
const firstName = ref(profile?.firstName ?? '')
const lastName = ref(profile?.lastName ?? '')
const phone = ref(profile?.phone ?? '')
const birthDate = ref(profile?.birthday ?? '')
const countryId = ref(profile?.country?.id ?? '')
const city = ref(profile?.city ?? '')

const { data: countries } = await useAsyncData('countries', () => countryRepo.list(locale.value), { watch: [locale] })

const photoUrl = computed(() => session.user?.profile.photo ?? session.user?.avatar ?? null)

/** Aperçu local après sélection ; le fichier réel part avec l'enregistrement. */
const localPhoto = ref<string | null>(null)
const selectedPhoto = ref<File | null>(null)
const displayPhoto = computed(() => localPhoto.value ?? photoUrl.value)

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function openPhotoPicker() {
  fileInput.value?.click()
}

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  if (localPhoto.value) URL.revokeObjectURL(localPhoto.value)
  localPhoto.value = URL.createObjectURL(file)
  selectedPhoto.value = file
  input.value = ''
}

onBeforeUnmount(() => {
  if (localPhoto.value) URL.revokeObjectURL(localPhoto.value)
})

const saving = ref(false)
const errorMessage = ref<string | null>(null)

async function save() {
  if (saving.value) return
  errorMessage.value = null
  saving.value = true
  try {
    const updated = await authRepo.updateProfile({
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
      countryId: countryId.value,
      city: city.value || undefined,
      birthday: birthDate.value || null,
      photo: selectedPhoto.value,
    }, locale.value)
    session.apply({ user: updated, pendingPayment: session.pendingPayment })
    await navigateTo(localePath('/'))
  }
  catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : t('settingsPersonal.saveError')
  }
  finally {
    saving.value = false
  }
}

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
          <!-- Cercle avatar (overflow) + pastille caméra hors cercle, cliquable -->
          <div class="relative size-72 shrink-0">
            <div class="flex size-72 items-center justify-center overflow-hidden rounded-full bg-rp-avatar-bg">
              <img
                v-if="displayPhoto"
                :src="displayPhoto"
                alt=""
                class="size-full object-cover"
                width="72"
                height="72"
              >
              <img
                v-else
                :src="`${ICON}/ic-rp-avatar-user.svg`"
                alt=""
                width="32"
                height="32"
                class="block size-32"
              >
            </div>

            <button
              type="button"
              class="absolute top-[52px] left-[45px] z-1 flex size-27 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-rp-camera-border bg-rp-avatar-bg p-0"
              :aria-label="$t('settingsPersonal.photoCta')"
              @click="openPhotoPicker"
            >
              <img :src="`${ICON}/ic-rp-camera.svg`" alt="" width="16" height="16" class="block size-16">
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="sr-only"
              tabindex="-1"
              @change="onPhotoSelected"
            >
          </div>

          <div class="flex min-w-0 flex-1 flex-col items-start pl-16">
            <p class="m-0 text-base leading-15 font-normal text-rp-photo-hint">
              {{ $t('settingsPersonal.photoHint') }}
            </p>
            <button
              type="button"
              class="mt-8 box-border flex h-34 w-[140.766px] cursor-pointer items-center justify-center rounded-lg border border-rp-photo-cta-border bg-transparent px-0 text-xl leading-20 font-medium text-rp-photo-cta"
              @click="openPhotoPicker"
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
          <!-- Prénom -->
          <label class="flex w-full items-end gap-11" for="rp-firstName">
            <span class="flex size-46 shrink-0 items-center justify-center rounded-[12px] bg-rp-tile-bg" aria-hidden="true">
              <img :src="`${ICON}/ic-rp-person.svg`" alt="" width="20" height="19" class="block">
            </span>
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.firstName') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <input
                  id="rp-firstName"
                  v-model="firstName"
                  type="text"
                  autocomplete="given-name"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>

          <!-- Nom -->
          <label class="flex w-full items-end gap-11" for="rp-lastName">
            <span class="flex size-46 shrink-0 items-center justify-center rounded-[12px] bg-rp-tile-bg" aria-hidden="true">
              <img :src="`${ICON}/ic-rp-person.svg`" alt="" width="20" height="19" class="block">
            </span>
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.lastName') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <input
                  id="rp-lastName"
                  v-model="lastName"
                  type="text"
                  autocomplete="family-name"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>

          <!-- E-mail : lecture seule, l'API ne prend pas en charge son changement ici -->
          <label class="flex w-full items-end gap-11" for="rp-email">
            <img :src="`${ICON}/ic-rp-email-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.email') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-surface-2 py-12 pr-40 pl-12">
                <input
                  id="rp-email"
                  :value="session.user?.email"
                  type="email"
                  disabled
                  class="min-w-0 flex-1 cursor-not-allowed border-0 bg-transparent p-0 text-lg leading-20 font-medium text-muted-2 outline-0"
                >
              </span>
            </span>
          </label>

          <!-- Téléphone -->
          <label class="flex w-full items-end gap-11" for="rp-phone">
            <img :src="`${ICON}/ic-rp-phone-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.phone') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <img :src="`${ICON}/ic-rp-flag.svg`" alt="" width="20" height="14" class="mr-8 block h-14 w-20 shrink-0">
                <input
                  id="rp-phone"
                  v-model="phone"
                  type="tel"
                  autocomplete="tel"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>

          <!-- Date de naissance -->
          <label class="flex w-full items-end gap-11" for="rp-birthDate">
            <img :src="`${ICON}/ic-rp-calendar-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.birthDate') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <input
                  id="rp-birthDate"
                  v-model="birthDate"
                  type="date"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>

          <!-- Pays : identifiant réel (lc_country_id), pas un texte libre -->
          <label class="flex w-full items-end gap-11" for="rp-country">
            <img :src="`${ICON}/ic-rp-pin-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.country') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <select
                  id="rp-country"
                  v-model="countryId"
                  autocomplete="country-name"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
                  <option value="" disabled>{{ $t('settingsPersonal.countryPlaceholder') }}</option>
                  <option v-for="c in countries" :key="c.id ?? ''" :value="c.id">{{ c.name }}</option>
                </select>
              </span>
            </span>
          </label>

          <!-- Ville -->
          <label class="flex w-full items-end gap-11" for="rp-city">
            <img :src="`${ICON}/ic-rp-city-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.city') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <input
                  id="rp-city"
                  v-model="city"
                  type="text"
                  autocomplete="address-level2"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>
        </div>
      </section>

      <QAlert v-if="errorMessage" tone="danger" :message="errorMessage" />

      <button
        type="button"
        :disabled="saving"
        class="flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-rl-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        @click="save"
      >
        {{ saving ? $t('settingsPersonal.saving') : $t('settingsPersonal.save') }}
      </button>

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
