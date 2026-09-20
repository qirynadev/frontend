<script setup lang="ts">
/**
 * Destination desktop générique — pour tout pays sans artboard Figma dédié
 * (Allemagne, Espagne…). Créé le 2026-09-20.
 *
 * Cinq pays ont un écran 1728 sur mesure (France, Chine, Canada, Angleterre,
 * USA) : tout y est éditorial, chaque texte et chaque image vivant dans
 * `desktop-destination-country.ts`. Les autres pays retombaient donc sur la
 * mise en page mobile affichée dans le cadre desktop — ce que le responsable a
 * vu sur l'Allemagne.
 *
 * Cet écran-ci ne connaît aucun pays : tout vient de l'API — nom, accroche,
 * image, statistiques, domaines (avec leurs icônes back-office), présentation
 * HTML et logos d'écoles. Seuls les libellés de structure (badge, intitulés de
 * sections, appels à l'action) sont traduits, et ils sont identiques d'un pays
 * à l'autre : ce sont les 22 clés que les cinq écrans dédiés répètent déjà mot
 * pour mot.
 *
 * Ce que l'API ne fournit pas encore, et qui manque donc ici par rapport aux
 * écrans dédiés — voir `docs/directives-backend.md` : les quatre arguments
 * illustrés (« Enseignement d'excellence »…) et le bandeau de réassurance.
 */
import type { AreaOfStudySummary } from '~/core/contracts/area'
import type { Destination } from '~/core/contracts'

const props = defineProps<{
  destination: Destination
  areas: AreaOfStudySummary[]
}>()

const localePath = useLocalePath()

const listeEcoles = computed(() => localePath(`/destinations/${props.destination.slug}/ecoles`))

function lienDomaine(slug: string) {
  return localePath(`/destinations/${props.destination.slug}/ecoles?domaine=${slug}`)
}

/**
 * Le back-office laisse saisir jusqu'à quatre statistiques, valeur et libellé
 * séparés, et n'impose ni l'un ni l'autre : l'Allemagne en a deux incomplètes.
 * On n'affiche que les paires complètes plutôt qu'un chiffre sans légende.
 */
const statistiques = computed(() =>
  props.destination.stats.filter((stat) => stat.value.trim() !== '' && stat.label.trim() !== ''),
)

/** Les écoles ayant un logo exploitable, pour la bande de logos. */
const logosEcoles = computed(() =>
  props.destination.schools.filter((ecole) => ecole.logo).slice(0, 12),
)
</script>

<template>
  <div class="w-full bg-white pb-40 text-[#1a1a1a]">
    <section class="relative h-480 w-full overflow-hidden">
      <img
        v-if="destination.image"
        :src="destination.image"
        alt=""
        width="1728"
        height="480"
        class="absolute inset-0 block size-full object-cover object-center"
        loading="lazy"
        decoding="async"
      >
      <div class="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30" aria-hidden="true" />

      <div class="desktop-boxed relative flex h-full flex-col justify-center">
        <span class="flex items-center gap-8 text-[12px] leading-16 font-semibold tracking-[1px] text-[#ff1b40] uppercase">
          <img
            v-if="destination.country.flag"
            :src="destination.country.flag"
            alt=""
            width="20"
            height="14"
            class="block h-14 w-20 object-contain"
            loading="lazy"
            decoding="async"
          >
          {{ $t('desktop.destinationPays.badge') }}
        </span>

        <h1 class="m-0 mt-12 max-w-[760px] text-[44px] leading-[52px] font-bold tracking-[-1px]">
          {{ destination.title }}
        </h1>

        <p v-if="destination.tagline" class="m-0 mt-16 max-w-[620px] text-[18px] leading-28 text-[#4b5563]">
          {{ destination.tagline }}
        </p>

        <div class="mt-28 flex items-center gap-20">
          <NuxtLink
            :to="listeEcoles"
            class="flex h-52 items-center justify-center rounded-[12px] bg-[#ff1b40] px-32 text-[15px] leading-20 font-semibold text-white no-underline"
          >
            {{ $t('desktop.destinationPays.ctaExplore') }}
          </NuxtLink>
          <span class="text-[15px] leading-20 font-medium text-[#4b5563]">
            {{ $t('desktop.destinationPays.schoolCount', { count: destination.schoolCount }) }}
          </span>
        </div>
      </div>
    </section>

    <section v-if="statistiques.length > 0" class="desktop-boxed mt-40">
      <div class="grid gap-20" :style="{ gridTemplateColumns: `repeat(${statistiques.length}, minmax(0, 1fr))` }">
        <div
          v-for="stat in statistiques"
          :key="stat.label"
          class="flex flex-col items-start rounded-[16px] border border-[#f3f4f6] bg-[#fafafe] px-28 py-24"
        >
          <span class="text-[32px] leading-40 font-bold text-[#ff1b40] tabular-nums">{{ stat.value }}</span>
          <span class="mt-4 text-[14px] leading-20 text-[#4b5563]">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section v-if="areas.length > 0" class="desktop-boxed mt-48">
      <h2 class="m-0 text-[28px] leading-36 font-bold tracking-[-0.5px]">
        {{ $t('desktop.destinationPays.domainsTitle') }}
      </h2>
      <div class="mt-24 grid grid-cols-3 gap-20">
        <NuxtLink
          v-for="area in areas"
          :key="area.id"
          :to="lienDomaine(area.slug)"
          class="flex items-center gap-16 rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-inherit no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <span class="flex size-56 shrink-0 items-center justify-center rounded-[14px] bg-[#f8f8fc]">
            <img
              v-if="area.icon"
              :src="area.icon"
              alt=""
              width="28"
              height="28"
              class="block size-28 object-contain"
              loading="lazy"
              decoding="async"
            >
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-[16px] leading-24 font-semibold">{{ area.title }}</span>
            <span class="mt-2 text-[13px] leading-18 text-[#6b7280]">
              {{ $t('desktop.destinationPays.domainSchools', { count: area.schoolCount }) }}
            </span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <section v-if="destination.description" class="desktop-boxed mt-48">
      <h2 class="m-0 text-[28px] leading-36 font-bold tracking-[-0.5px]">
        {{ $t('desktop.destinationPays.presentationTitle', { pays: destination.title }) }}
      </h2>
      <RichText :content="destination.description" class="mt-20 block max-w-[980px]" />
    </section>

    <section v-if="logosEcoles.length > 0" class="desktop-boxed mt-48">
      <h2 class="m-0 text-[28px] leading-36 font-bold tracking-[-0.5px]">
        {{ $t('desktop.destinationPays.schoolsTitle', { pays: destination.title }) }}
      </h2>
      <div class="mt-24 grid grid-cols-6 gap-16">
        <span
          v-for="ecole in logosEcoles"
          :key="ecole.id"
          class="flex h-88 items-center justify-center rounded-[14px] border border-[#f3f4f6] bg-white p-12"
          :title="ecole.title"
        >
          <img
            :src="ecole.logo!"
            :alt="ecole.title"
            class="max-h-56 max-w-full object-contain"
            loading="lazy"
            decoding="async"
          >
        </span>
      </div>
      <NuxtLink
        :to="listeEcoles"
        class="mt-24 inline-flex h-48 items-center justify-center rounded-[12px] border border-[#ff1b40] bg-white px-28 text-[15px] leading-20 font-semibold text-[#ff1b40] no-underline"
      >
        {{ $t('desktop.destinationPays.ctaAllSchools') }}
      </NuxtLink>
    </section>
  </div>
</template>
