<script setup lang="ts">
/**
 * Réglages — Informations personnelles ← Figma `1553:1020` (Working_Files_Qiryrna).
 *
 * | Bloc | Spéc |
 * |---|---|
 * | sections | `gap-22` (norme produit ; Figma 24px) entre topbar / intro / cartes |
 * | cartes | rayon 16, filet `rp-card-border`, ombre `shadow-rp-card`, fond blanc |
 * | champs | tuile 46×46 + label 11px `rp-label` + input h-46 rayon 12 |
 * | danger | pastille 48 `rp-delete-bg` · chevron rouge |
 *
 * `POST /user/update-profile` (`authRepo.updateProfile`) : enregistre
 * réellement en base. L'e-mail reste en lecture seule (champ non pris en
 * charge par cet endpoint, jamais transmis) ; le pays est un identifiant
 * réel (`lc_country_id`, `countryRepo`), plus un texte libre.
 *
 * 2026-09-16 : la photo de profil et la ville sont retirées de cet écran —
 * la photo n'apportait rien au dossier, la ville n'était exploitée nulle part.
 * Le téléphone passe après le pays, pour que l’indicatif se lise dans la
 * foulée du pays choisi.
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
const birthDate = ref(profile?.birthday ?? '')
const countryId = ref(profile?.country?.id ?? '')

const { data: countries } = await useAsyncData('countries', () => countryRepo.list(locale.value), { watch: [locale] })

/**
 * Indicatif et numéro vivent séparément à l'écran, mais l'API ne connaît
 * qu'un seul champ `phone` (texte libre). On les recompose à l'envoi et on les
 * redécoupe à la relecture — sans quoi un numéro déjà préfixé repartirait avec
 * deux indicatifs.
 *
 * La longueur d'un indicatif ne se devine pas : `+33612345678` se découpe en
 * `33` + `612345678`, pas en `3361` + `2345678`. On la reconnaît donc dans la
 * liste réelle des pays, le plus long candidat l'emportant (`1242` avant `1`).
 * D'où le découpage ici, après le chargement des pays, et non plus avant.
 */
function decouper(brut: string, codes: string[]): { code: string, numero: string } {
  const valeur = brut.trim()
  if (!valeur.startsWith('+')) return { code: '', numero: valeur }

  const chiffres = valeur.slice(1)
  const trouve = [...codes]
    .sort((a, b) => b.length - a.length)
    .find((c) => chiffres.startsWith(c))

  if (!trouve) return { code: '', numero: valeur }
  return { code: trouve, numero: chiffres.slice(trouve.length).replace(/^[\s.-]+/, '') }
}

const decoupe = decouper(
  profile?.phone ?? '',
  (countries.value ?? []).map((c) => c.phoneCode).filter((c): c is string => !!c),
)
const phone = ref(decoupe.numero)
const phoneCode = ref(decoupe.code)

/** Les pays dont l'API donne l'indicatif (`international_phone`), par nom. */
const indicatifs = computed(() =>
  (countries.value ?? [])
    .filter((c) => c.phoneCode)
    .sort((a, b) => a.name.localeCompare(b.name)),
)

/**
 * Changer de pays réaligne l'indicatif : c'est tout l'intérêt d'avoir mis le
 * téléphone après le pays. Le numéro saisi, lui, n'est jamais touché.
 */
watch(countryId, (id) => {
  const pays = (countries.value ?? []).find((c) => c.id === id)
  if (pays?.phoneCode) phoneCode.value = pays.phoneCode
})

/** À la première ouverture, un numéro sans indicatif hérite de celui du pays. */
onMounted(() => {
  if (phoneCode.value) return
  const pays = (countries.value ?? []).find((c) => c.id === countryId.value)
  if (pays?.phoneCode) phoneCode.value = pays.phoneCode
})

/** Ce qui part réellement à l'API : indicatif + numéro, jamais l'un sans l'autre. */
const numeroComplet = computed(() => {
  const numero = phone.value.trim()
  if (!numero) return ''
  if (numero.startsWith('+')) return numero
  return phoneCode.value ? `+${phoneCode.value} ${numero}` : numero
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
      phone: numeroComplet.value,
      countryId: countryId.value,
      birthday: birthDate.value || null,
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

          <!-- Téléphone -->
          <label class="flex w-full items-end gap-11" for="rp-phone">
            <img :src="`${ICON}/ic-rp-phone-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.phone') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center gap-8 overflow-hidden rounded-[12px] border border-rp-card-border bg-white py-12 pr-40 pl-12">
                <select
                  v-model="phoneCode"
                  :aria-label="$t('settingsPersonal.phoneCodeLabel')"
                  class="w-84 shrink-0 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
                  <option value="">—</option>
                  <option v-for="c in indicatifs" :key="c.id ?? c.name" :value="c.phoneCode">
                    +{{ c.phoneCode }} {{ c.code }}
                  </option>
                </select>
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
