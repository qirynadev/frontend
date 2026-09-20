<script setup lang="ts">
/**
 * Informations personnelles desktop — même logique que le mobile, cadre 1728.
 *
 * Câblé aux vraies données le 2026-09-20 : l'écran livré remplissait ses
 * champs depuis `reglages-profil-mock` et n'enregistrait rien. Il partage
 * désormais `useReglagesProfil()` avec le mobile — mêmes valeurs, même
 * enregistrement (`POST /user/update-profile`), mêmes sélecteurs de pays et
 * d'indicatif avec recherche.
 *
 * Photo de profil et ville retirées comme sur mobile (2026-09-16).
 */
import { drapeauEmoji } from '~/utils/country-search'

const ICON = '/img/icons/reglages-profil'

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

/** Les champs texte simples, dans l'ordre de la maquette. */
const champs = computed(() => [
  { id: 'firstName', labelKey: 'settingsPersonal.firstName', model: firstName, icon: 'person', autocomplete: 'given-name', type: 'text', pleineLargeur: false },
  { id: 'lastName', labelKey: 'settingsPersonal.lastName', model: lastName, icon: 'person', autocomplete: 'family-name', type: 'text', pleineLargeur: false },
  { id: 'birthDate', labelKey: 'settingsPersonal.birthDate', model: birthDate, icon: 'calendar', autocomplete: undefined, type: 'date', pleineLargeur: false },
])
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsPersonal.title')" :intro="$t('settingsPersonal.intro')">
    <section class="flex w-full flex-col gap-20 rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
      <h2 class="m-0 text-[16px] leading-24 font-semibold text-[#151515]">
        {{ $t('settingsPersonal.infoTitle') }}
      </h2>

      <div class="grid grid-cols-2 gap-x-20 gap-y-16">
        <label
          v-for="champ in champs"
          :key="champ.id"
          class="flex items-end gap-12"
          :for="`desk-rp-${champ.id}`"
        >
          <span
            v-if="champ.icon === 'person'"
            class="flex size-46 shrink-0 items-center justify-center rounded-[12px] bg-[#f8f8fc]"
            aria-hidden="true"
          >
            <img :src="`${ICON}/ic-rp-person.svg`" alt="" width="20" height="19" class="block" loading="lazy" decoding="async">
          </span>
          <img
            v-else
            :src="`${ICON}/ic-rp-${champ.icon}-tile.svg`"
            alt=""
            width="46"
            height="46"
            class="block size-46 shrink-0"
            loading="lazy"
            decoding="async"
          >
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="text-[11px] leading-[16.5px] font-medium text-[#6b7280]">{{ $t(champ.labelKey) }}</span>
            <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white px-12">
              <input
                :id="`desk-rp-${champ.id}`"
                v-model="champ.model.value"
                :type="champ.type"
                :autocomplete="champ.autocomplete"
                class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-20 font-medium text-[#151515] outline-0"
              >
            </span>
          </span>
        </label>

        <!-- E-mail : lecture seule, l'API ne prend pas en charge son changement ici -->
        <label class="col-span-2 flex items-end gap-12" for="desk-rp-email">
          <img :src="`${ICON}/ic-rp-email-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0" loading="lazy" decoding="async">
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="text-[11px] leading-[16.5px] font-medium text-[#6b7280]">{{ $t('settingsPersonal.email') }}</span>
            <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-[#f8f8fc] px-12">
              <input
                id="desk-rp-email"
                :value="email"
                type="email"
                disabled
                class="min-w-0 flex-1 cursor-not-allowed border-0 bg-transparent p-0 text-[13px] leading-20 font-medium text-[#6b7280] outline-0"
              >
            </span>
          </span>
        </label>

        <!-- Pays : identifiant réel (lc_country_id), choisi par recherche -->
        <label class="flex items-end gap-12" for="desk-rp-country">
          <img :src="`${ICON}/ic-rp-pin-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0" loading="lazy" decoding="async">
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="text-[11px] leading-[16.5px] font-medium text-[#6b7280]">{{ $t('settingsPersonal.country') }}</span>
            <button
              id="desk-rp-country"
              type="button"
              aria-haspopup="dialog"
              class="mt-4 box-border flex h-46 w-full cursor-pointer items-center gap-8 overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white px-12 text-left"
              @click="selecteurPaysOuvert = true"
            >
              <span v-if="paysChoisi" class="shrink-0 text-[15px] leading-none" aria-hidden="true">{{ drapeauEmoji(paysChoisi.code) }}</span>
              <span :class="['min-w-0 flex-1 truncate text-[13px] leading-20 font-medium', paysChoisi ? 'text-[#151515]' : 'text-[#6b7280]']">
                {{ paysChoisi?.name ?? $t('settingsPersonal.countryPlaceholder') }}
              </span>
              <QIcon name="chevron-down" :size="16" class="shrink-0 text-[#6b7280]" />
            </button>
          </span>
        </label>

        <!-- Téléphone : indicatif choisi par recherche, recomposé à l'envoi -->
        <label class="flex items-end gap-12" for="desk-rp-phone">
          <img :src="`${ICON}/ic-rp-phone-tile.svg`" alt="" width="46" height="46" class="block size-46 shrink-0" loading="lazy" decoding="async">
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="text-[11px] leading-[16.5px] font-medium text-[#6b7280]">{{ $t('settingsPersonal.phone') }}</span>
            <span class="mt-4 box-border flex h-46 w-full items-center gap-8 overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white px-12">
              <button
                type="button"
                aria-haspopup="dialog"
                :aria-label="libelleIndicatif"
                class="flex shrink-0 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-[13px] leading-20 font-medium tabular-nums text-[#151515]"
                @click="selecteurIndicatifOuvert = true"
              >
                <span v-if="paysIndicatif" class="text-[15px] leading-none" aria-hidden="true">{{ drapeauEmoji(paysIndicatif.code) }}</span>
                <span>{{ phoneCode ? `+${phoneCode}` : '—' }}</span>
                <QIcon name="chevron-down" :size="14" class="text-[#6b7280]" />
              </button>
              <span class="h-20 w-px shrink-0 bg-[#e5e7eb]" aria-hidden="true" />
              <input
                id="desk-rp-phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-20 font-medium text-[#151515] outline-0"
              >
            </span>
          </span>
        </label>
      </div>

      <QAlert v-if="errorMessage" tone="danger" :message="errorMessage" />

      <button
        type="button"
        :disabled="saving"
        class="flex h-46 w-fit cursor-pointer items-center justify-center rounded-[12px] border-0 bg-rl-cta px-32 text-[14px] leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        @click="save"
      >
        {{ saving ? $t('settingsPersonal.saving') : $t('settingsPersonal.save') }}
      </button>
    </section>

    <button
      type="button"
      class="flex w-full cursor-pointer items-center rounded-[16px] border border-[#f9fafb] bg-white p-24 text-left shadow-[0_0_3px_rgba(0,0,0,0.12)]"
    >
      <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px] bg-[#fef2f2]">
        <img :src="`${ICON}/ic-rp-trash.svg`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-[14px] leading-20 font-semibold text-[#151515]">
          {{ $t('settingsPersonal.deleteTitle') }}
        </span>
        <span class="mt-4 block text-[12px] leading-16 text-[#6b7280]">
          {{ $t('settingsPersonal.deleteDesc') }}
        </span>
      </span>
      <img :src="`${ICON}/ic-rp-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0" loading="lazy" decoding="async">
    </button>

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
  </AppDesktopReglagesShell>
</template>
