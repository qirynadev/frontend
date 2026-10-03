<script setup lang="ts">
/**
 * Destination desktop — un seul écran pour tous les pays.
 *
 * Design de référence : `/destinations/france` (Figma `Etudier France` 694:2,
 * hero 503 + rail 476). Avant le 2026-09-20, cinq pays avaient chacun leur
 * écran, textes et images écrits en dur ; les autres, dont l'Allemagne,
 * retombaient sur la mise en page mobile dans le cadre desktop.
 *
 * Tout vient de l'API : nom, accroche, image, statistiques (avec leurs vraies
 * valeurs — celles codées en dur pour la France étaient périmées : « 3 500+ »
 * contre « 97+ » servi), domaines réels, arguments éditoriaux
 * (`SchoolFile.highlights`), présentation, logos d'écoles. Ne restent locales
 * que les illustrations, absentes de l'API : icônes de statistiques,
 * d'arguments et de domaines (`~/config/desktop-destination`).
 *
 * Chaque section disparaît si sa donnée manque : aucune case vide.
 */
import type { AreaOfStudySummary, Destination } from '~/core/contracts'
import {
  DESTINATION_ASSET,
  ICONES_ARGUMENT,
  ICONES_STAT,
  VISUELS_DOMAINE,
} from '~/config/desktop-destination'

const props = defineProps<{
  destination: Destination
  areas: AreaOfStudySummary[]
}>()

const localePath = useLocalePath()

/** Domaine présenté à part, dans le menu « MBA » (écoles par zone). */
const MBA_SLUG = 'mba'

const lienEcoles = computed(() => localePath(`/destinations/${props.destination.slug}/ecoles`))

function lienDomaine(slug: string) {
  return localePath(`/destinations/${props.destination.slug}/ecoles?domaine=${slug}`)
}

/**
 * Domaines réels de la destination, illustrés par la maquette quand le slug est
 * connu. Sans MBA sur desktop (2026-10-03) : il a son menu dédié, par zone.
 */
const domaines = computed(() =>
  props.areas.filter(area => area.slug !== MBA_SLUG).map((area) => {
    const visuel = VISUELS_DOMAINE[area.slug]
    return {
      id: area.id,
      slug: area.slug,
      titre: area.title,
      icone: visuel?.icon ?? area.icon,
      /** Sans visuel de maquette, l'icône administrée est posée telle quelle. */
      pastille: visuel?.kind === 'circle' ? (visuel.bg ?? 'bg-[#f3f5fe]') : null,
    }
  }),
)

/**
 * Bouton « voir les écoles » : ouvre directement le premier domaine réel de la
 * destination (choix de Kader, 2026-10-02), la liste complète à défaut.
 */
const lienEcolesCta = computed(() =>
  domaines.value[0] ? lienDomaine(domaines.value[0].slug) : lienEcoles.value,
)

/** Bandeau de réassurance (Kader, 2026-10-02) : trois engagements, icônes du sprite. */
const reassurance = [
  { icon: 'ic-trust-shield', labelKey: 'trust.payment', circled: false },
  { icon: 'ic-trust-laurel', labelKey: 'trust.support', circled: true },
  { icon: 'ic-trust-smile', labelKey: 'trust.satisfaction', circled: false },
] as const

/**
 * Le back-office accepte quatre paires valeur + libellé sans imposer ni l'une
 * ni l'autre : on n'affiche que les paires complètes, plutôt qu'un chiffre
 * sans légende (l'Allemagne en a deux vides — §29.1).
 */
const statistiques = computed(() =>
  props.destination.stats
    .filter((stat) => stat.value.trim() !== '' && stat.label.trim() !== '')
    .slice(0, 4)
    .map((stat, index) => ({ ...stat, icone: ICONES_STAT[index] ?? ICONES_STAT[0] })),
)

/**
 * Arguments « Pourquoi » : `SchoolFile.highlights`, saisis par pays dans le
 * back-office et servis par l'API pour les six destinations. Le front les
 * ignorait et affichait quatre textes écrits en dur, pays par pays — d'où
 * l'impasse sur l'Allemagne. Seules les icônes restent locales, l'API n'en
 * fournissant pas.
 */
const argumentsPays = computed(() =>
  props.destination.highlights.slice(0, 4).map((argument, index) => ({
    icone: ICONES_ARGUMENT[index] ?? ICONES_ARGUMENT[0],
    titre: argument.title,
    description: argument.text,
  })),
)

/** Huit logos réels, comme la maquette en aligne huit. */
const logosEcoles = computed(() =>
  props.destination.schools.filter((ecole) => ecole.logo).slice(0, 8),
)
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white pb-30 text-[#1a1d2b]">
    <!-- Hero 503 · chevauche le bloc suivant de 36 px -->
    <section class="relative mb-[-36px] min-h-[503px] w-full overflow-hidden bg-white">
      <img
        v-if="destination.image"
        :src="destination.image"
        alt=""
        width="1728"
        height="503"
        class="pointer-events-none absolute inset-0 block size-full object-cover object-center"
        loading="lazy"
        decoding="async"
      >

      <div class="desktop-boxed desktop-split relative h-full items-center justify-between">
        <div class="flex min-w-0 flex-1 max-w-672 flex-col items-start justify-center pr-64">
          <div class="flex w-full max-w-504 flex-col gap-12">
            <h1 class="m-0 text-[49px] leading-[54.6px] font-semibold tracking-[-1.4px]">
              <span class="text-[#1a1a1a]">{{ $t('desktop.destinationPays.titleBefore') }}</span>
              {{ ' ' }}
              <span class="text-[#ff1b40]">{{ destination.title }}</span>
            </h1>

            <div class="flex w-full flex-col items-start gap-19">
              <p v-if="destination.tagline" class="m-0 w-full max-w-504 text-[18px] leading-26 font-medium tracking-[-0.32px] text-black">
                {{ destination.tagline }}
              </p>
              <NuxtLink
                :to="lienEcolesCta"
                class="inline-flex items-center gap-12 rounded-[12px] bg-[#ff1b40] px-28 py-16 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
              >
                {{ $t('desktop.destinationPays.ctaExplore') }}
                <span class="size-20 shrink-0 overflow-clip">
                  <img :src="`${DESTINATION_ASSET}/arrow-right.svg`" alt="" width="20" height="20" class="block size-full" loading="lazy" decoding="async">
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Panneau domaines : titres et liens réels -->
        <aside v-if="domaines.length > 0" class="flex desktop-rail flex-col items-center gap-8 rounded-[9px] border border-[#d1d5db] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 w-full text-center text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t('desktop.destinationPays.domainsTitle') }}
          </h2>
          <p class="m-0 w-full text-center text-[14px] leading-21 font-medium tracking-[-0.154px] text-black">
            {{ $t('desktop.destinationPays.domainsDesc') }}
          </p>

          <div class="mt-8 grid w-full grid-cols-2 gap-8">
            <NuxtLink
              v-for="domaine in domaines"
              :key="domaine.id"
              :to="lienDomaine(domaine.slug)"
              class="flex items-center gap-8 rounded-[10px] border border-[#d1d5db] bg-white px-10 py-12 text-inherit no-underline"
            >
              <span
                v-if="domaine.pastille"
                :class="['flex size-32 shrink-0 items-center justify-center rounded-full', domaine.pastille]"
              >
                <img v-if="domaine.icone" :src="domaine.icone" alt="" width="18" height="18" class="block size-18 object-contain" loading="lazy" decoding="async">
              </span>
              <span v-else class="size-32 shrink-0 overflow-clip">
                <img v-if="domaine.icone" :src="domaine.icone" alt="" width="32" height="32" class="block size-full object-contain" loading="lazy" decoding="async">
              </span>

              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-[13px] leading-[17.5px] font-semibold text-[#040c3d]">{{ domaine.titre }}</span>
                <span class="text-[11px] leading-14 font-normal text-[#6b7280]">
                  {{ $t('desktop.destinationPays.domainSchools', { count: areas.find(a => a.slug === domaine.slug)?.schoolCount ?? 0 }) }}
                </span>
              </span>

              <span class="flex h-16 w-20 shrink-0 items-center justify-center pr-4">
                <span class="relative size-16 overflow-clip">
                  <img :src="`${DESTINATION_ASSET}/domain/chevron.svg`" alt="" width="6" height="10" class="absolute top-1/4 left-[37.5%] h-1/2 w-1/4 max-w-none" loading="lazy" decoding="async">
                </span>
              </span>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <!-- Stats + pourquoi + réassurance | écoles + CTA -->
    <div class="desktop-boxed desktop-split relative z-10 w-full items-stretch">
      <div class="flex min-w-0 flex-1 flex-col gap-25">
        <div v-if="statistiques.length > 0" class="flex w-full items-center justify-center gap-15 rounded-[9px] border border-[#d1d5db] bg-white px-21 py-18 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <template v-for="(stat, index) in statistiques" :key="stat.label">
            <div v-if="index > 0" class="h-64 w-px shrink-0 bg-[#d1d5db]" aria-hidden="true" />
            <div class="flex min-w-0 flex-1 items-start justify-center gap-10">
              <span class="size-45 shrink-0 overflow-clip">
                <img :src="stat.icone" alt="" width="45" height="45" class="block size-full" loading="lazy" decoding="async">
              </span>
              <div class="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <p class="m-0 text-[16px] leading-26 font-semibold tracking-[0.208px] text-[#040c3d]">{{ stat.value }}</p>
                <p class="m-0 text-[14px] leading-15 font-normal text-black">{{ stat.label }}</p>
              </div>
            </div>
          </template>
        </div>

        <div class="flex w-full flex-col gap-20">
          <h2 class="m-0 text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t('desktop.destinationPays.whyTitle', { pays: destination.title }) }}
          </h2>

          <!-- Quatre arguments rédigés, ou la présentation réelle à défaut -->
          <div v-if="argumentsPays.length > 0" class="grid grid-cols-4 gap-16">
            <article
              v-for="argument in argumentsPays"
              :key="argument.titre"
              class="flex flex-col gap-8 rounded-[16px] border border-[#d1d5db] bg-white p-16 first:rounded-[9px]"
            >
              <div class="flex items-center gap-6">
                <span class="size-36 shrink-0 overflow-clip">
                  <img :src="argument.icone" alt="" width="36" height="36" class="block size-full" loading="lazy" decoding="async">
                </span>
                <h3 class="m-0 min-w-0 text-[13px] leading-16 font-bold tracking-[-0.5px] whitespace-nowrap text-[#040c3d]">
                  {{ argument.titre }}
                </h3>
              </div>
              <p class="m-0 text-[14px] leading-[19.5px] font-normal text-black">{{ argument.description }}</p>
            </article>
          </div>
          <div v-else-if="destination.description" class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
            <RichText :content="destination.description" size="sm" class="block" />
          </div>
        </div>

        <div
          class="flex min-h-108 min-w-0 w-full items-center rounded-[9px] border border-[#d1d5db] bg-white px-21 py-18"
          :aria-label="$t('trust.label')"
        >
          <div class="flex min-w-0 w-full items-center">
            <template v-for="(item, index) in reassurance" :key="item.labelKey">
              <div
                v-if="index > 0"
                class="h-49 w-px shrink-0 bg-[#d1d5db]"
                aria-hidden="true"
              />
              <div class="flex min-w-0 flex-1 items-center justify-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center"
                  :class="item.circled ? 'rounded-full bg-[#def5e3]' : ''"
                >
                  <QIcon :name="item.icon" :size="item.circled ? 24 : 40" />
                </span>
                <p class="m-0 text-[14px] leading-[18px] font-semibold text-[#040c3d]">
                  {{ $t(item.labelKey) }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="flex desktop-rail flex-col justify-between gap-25">
        <aside v-if="logosEcoles.length > 0" class="flex flex-1 flex-col gap-32 rounded-[9px] border border-[#d1d5db] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 text-center text-[20px] leading-[25.5px] font-semibold tracking-[-0.442px] text-[#040c3d]">
            {{ $t('desktop.destinationPays.schoolsTitle', { pays: destination.title }) }}
          </h2>
          <div class="grid grid-cols-4 gap-12">
            <div
              v-for="ecole in logosEcoles"
              :key="ecole.id"
              class="flex h-95 items-center justify-center rounded-[12px] border border-[#d1d5db] bg-white p-5"
              :title="ecole.title"
            >
              <img :src="ecole.logo!" :alt="ecole.title" class="max-h-56 max-w-full object-contain" loading="lazy" decoding="async">
            </div>
          </div>
        </aside>

        <div class="relative flex min-h-108 items-center justify-between overflow-hidden rounded-[9px] bg-[#192339] px-16 py-18 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <div class="pointer-events-none absolute top-0 right-0 size-160 rounded-full bg-white/5 blur-[20px]" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 items-center gap-10">
            <span class="size-40 shrink-0 overflow-clip">
              <img :src="`${DESTINATION_ASSET}/cta-icon.png`" alt="" width="40" height="40" class="block size-full" loading="lazy" decoding="async">
            </span>
            <div class="flex min-w-0 flex-col gap-4">
              <p class="m-0 text-[14px] leading-18 font-normal tracking-[-0.24px] text-white">
                {{ $t('desktop.destinationPays.ctaTitle') }}
              </p>
              <p class="m-0 text-[13px] leading-16 font-normal tracking-[-0.078px] text-[#9ca3af]">
                {{ $t('desktop.destinationPays.ctaDesc') }}
              </p>
            </div>
          </div>
          <NuxtLink
            :to="lienEcolesCta"
            class="inline-flex shrink-0 items-center gap-8 rounded-[12px] bg-[#ff1b40] px-16 py-10 text-[14px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
          >
            {{ $t('desktop.destinationPays.ctaButton') }}
            <span class="size-16 shrink-0 overflow-clip">
              <img :src="`${DESTINATION_ASSET}/cta-pin.svg`" alt="" width="16" height="16" class="block size-full" loading="lazy" decoding="async">
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
