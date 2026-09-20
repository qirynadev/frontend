<script setup lang="ts">
/**
 * Réglages — Informations personnelles ← Figma `1553:1020` (Working_Files_Qiryrna).
 *
 * | Bloc | Spéc |
 * |---|---|
 * | sections | `gap-22` (norme produit ; Figma 24px) entre topbar / intro / cartes |
 * | cartes | rayon 16, filet `rp-card-border`, ombre `shadow-rp-card`, fond blanc |
 * | champs | tuile 46×46 + label 11px `rp-label` + input h-46 rayon 12, marge interne 12px (était 12/40 : un long numéro était rogné) |
 * | pays, indicatif | déclencheurs vers `CountryPickerSheet` : recherche par nom, code ISO ou indicatif |
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
import DesktopReglagesProfil from '~/desktop-pages/reglages-profil.vue'
import { drapeauEmoji } from '~/utils/country-search'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

const ICON = '/img/icons/reglages-profil'

// Tout l’état vient du composable partagé avec le desktop : un seul câblage
// aux vraies données pour les deux écrans.
const {
  firstName,
  lastName,
  email,
  birthDate,
  countryId,
  phone,
  phoneCode,
  countries,
  indicatifs,
  paysChoisi,
  paysIndicatif,
  libelleIndicatif,
  choisirPays,
  choisirIndicatif,
  saving,
  errorMessage,
  save,
} = await useReglagesProfil()

const selecteurPaysOuvert = ref(false)
const selecteurIndicatifOuvert = ref(false)

usePageSeo(() => ({
  title: t('settingsPersonal.seoTitle'),
  description: t('settingsPersonal.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rp flex flex-1 flex-col shell:hidden">
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
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white px-12">
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
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white px-12">
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
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-surface-2 px-12">
                <input
                  id="rp-email"
                  :value="email"
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
              <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-rp-card-border bg-white px-12">
                <input
                  id="rp-birthDate"
                  v-model="birthDate"
                  type="date"
                  class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-rp-input outline-0"
                >
              </span>
            </span>
          </label>

          <!-- Pays : identifiant réel (lc_country_id), choisi par recherche -->
          <label class="flex w-full items-end gap-11" for="rp-country">
            <img :src="`${ICON}/ic-rp-pin-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.country') }}</span>
              <button
                id="rp-country"
                type="button"
                aria-haspopup="dialog"
                class="mt-4 box-border flex h-46 w-full cursor-pointer items-center gap-8 overflow-hidden rounded-[12px] border border-rp-card-border bg-white px-12 text-left"
                @click="selecteurPaysOuvert = true"
              >
                <span v-if="paysChoisi" class="shrink-0 text-xl leading-none" aria-hidden="true">{{ drapeauEmoji(paysChoisi.code) }}</span>
                <span :class="['min-w-0 flex-1 truncate text-lg leading-20 font-medium', paysChoisi ? 'text-rp-input' : 'text-rp-label']">
                  {{ paysChoisi?.name ?? $t('settingsPersonal.countryPlaceholder') }}
                </span>
                <QIcon name="chevron-down" :size="16" class="shrink-0 text-rp-label" />
              </button>
            </span>
          </label>

          <!-- Téléphone -->
          <label class="flex w-full items-end gap-11" for="rp-phone">
            <img :src="`${ICON}/ic-rp-phone-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0">
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="text-md leading-[16.5px] font-medium text-rp-label">{{ $t('settingsPersonal.phone') }}</span>
              <span class="mt-4 box-border flex h-46 w-full items-center gap-8 overflow-hidden rounded-[12px] border border-rp-card-border bg-white px-12">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  :aria-label="libelleIndicatif"
                  class="flex shrink-0 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-lg leading-20 font-medium tabular-nums text-rp-input"
                  @click="selecteurIndicatifOuvert = true"
                >
                  <span v-if="paysIndicatif" class="text-xl leading-none" aria-hidden="true">{{ drapeauEmoji(paysIndicatif.code) }}</span>
                  <span>{{ phoneCode ? `+${phoneCode}` : '—' }}</span>
                  <QIcon name="chevron-down" :size="14" class="text-rp-label" />
                </button>
                <span class="h-20 w-px shrink-0 bg-rp-card-border" aria-hidden="true" />
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

        <!-- Recherche par saisie plutôt que 245 pays à dérouler (portail : hors de la carte) -->
        <CountryPickerSheet
          v-model:open="selecteurPaysOuvert"
          :countries="countries ?? []"
          :title="$t('settingsPersonal.country')"
          :selected-id="countryId || null"
          @select="choisirPays"
        />
        <CountryPickerSheet
          v-model:open="selecteurIndicatifOuvert"
          :countries="indicatifs"
          :title="$t('settingsPersonal.phoneCodeLabel')"
          :selected-id="paysIndicatif?.id ?? null"
          show-dial-code
          @select="choisirIndicatif"
        />
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

  <div class="hidden shell:block">
    <DesktopReglagesProfil />
  </div>
</template>
