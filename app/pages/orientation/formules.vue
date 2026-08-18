<script setup lang="ts">
/**
 * Formules d'orientation ← `maquette/pwa/pages/orientation-formules.html`
 * (`.formule-*`, `.of-*`). Prolonge `/orientation` (lot B2, écran de
 * découverte) : atteint via son bouton « Commencer mon orientation »,
 * `?path=moi|enfant` conservé pour le bouton retour.
 *
 * Page entièrement statique côté maquette (les trois formules et leur
 * contenu sont écrits en dur dans son script, aucun appel réseau) — pas de
 * `PageState`, `usePageSeo` seul.
 *
 * Resynchronisation maquette du 2026-08-17 (commit `5d60a2d`) : le carrousel
 * (`.formule-slider`, flèches/pastilles/`translateX`) a été retiré, remplacé
 * par une simple pile verticale `.formule-stack` (`gap: 22px`). Les trois
 * cartes s'affichent donc empilées, sans mécanique de défilement.
 *
 * L'accent de chaque carte suit le nom du palier dans la maquette, pas son
 * rang : Jordan (1er, moins cher) porte l'accent violet `--color-tier-2`,
 * Tyson le vert `--color-tier-1`, Pelé le rouge `--color-tier-3` — un ordre
 * non séquentiel, à l'inverse de `formule.html`/`OfferTierCard`. Codé en
 * dur par palier plutôt que déduit du rang.
 *
 * Les trois formules affichent le même prix (300 €/mois) : ainsi dans la
 * maquette, reproduit tel quel.
 *
 * Bloc arguments (3 icônes) + réassurance retiré à la demande du
 * responsable (2026-08-18), qui diverge ici volontairement de la
 * maquette : `orientation-formules.html` le garde sur les deux branches
 * (`main` et `release`), ce n'est donc pas un écart à corriger mais un
 * choix produit propre à cette page.
 */
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const path = computed(() => (route.query.path === 'enfant' ? 'enfant' : 'moi'))

/**
 * Icône par élément de la liste, pas une coche uniforme : la maquette varie
 * l'icône selon la **nature** de l'élément (entretien de cadrage, test,
 * bilan, restitution) — répétée à l'identique entre paliers de même
 * couleur. Tableaux alignés position à position sur `featureN`.
 */
const tiers = [
  {
    id: 'jordan',
    icon: 'ic-of-jordan',
    isTop: false,
    card: 'border-tier-border',
    name: 'text-tier-2',
    badgeBg: 'bg-of-badge-jordan-bg',
    badgeText: 'text-of-badge-jordan',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    featureIcons: ['ic-of-check-purple', 'ic-of-check-purple', 'ic-of-bilan-purple', 'ic-of-visio-purple'],
  },
  {
    id: 'tyson',
    icon: 'ic-of-tyson',
    isTop: false,
    card: 'border-tier-border',
    name: 'text-tier-1',
    badgeBg: 'bg-of-badge-tyson-bg',
    badgeText: 'text-of-badge-tyson',
    price: 'text-tier-1-price',
    button: 'border border-tier-1-line bg-white text-tier-1-line',
    featureIcons: [
      'ic-of-cadrage-green', 'ic-of-check-green', 'ic-of-check-green', 'ic-of-check-green',
      'ic-of-check-green', 'ic-of-bilan-green', 'ic-of-cadrage-green',
    ],
  },
  {
    id: 'pele',
    icon: 'ic-of-pele',
    isTop: true,
    card: 'border-tier-3-border',
    name: 'text-tier-3',
    badgeBg: 'bg-of-badge-pele-bg',
    badgeText: 'text-of-badge-pele',
    price: 'text-tier-3',
    button: 'border border-tier-3 bg-tier-3 text-white',
    featureIcons: [
      'ic-of-cadrage-red', 'ic-of-check-red', 'ic-of-check-red', 'ic-of-check-red-2', 'ic-of-check-red',
      'ic-of-check-red', 'ic-of-check-red', 'ic-of-check-red', 'ic-of-bilan-red', 'ic-of-cadrage-red',
    ],
  },
] as const

usePageSeo(() => ({
  title: t('orientation.formules.title'),
  description: t('orientation.formules.seoDescription'),
}))
</script>

<template>
  <AppTopBar back :back-to="`/orientation?path=${path}`" :notifications="3" :gap="0" />

  <!-- Introduction. `.of-intro` porte `padding-bottom: 8px` dans la
       maquette, mais une règle plus spécifique le ramène à 0 (mesuré, pas
       reproduit tel quel lu). -->
  <div class="flex w-full items-start justify-between gap-8">
    <div class="min-w-0 flex-1">
      <h1 class="m-0 text-exact-16 leading-normal font-semibold tracking-tight text-text">
        {{ $t('orientation.formules.title') }}
      </h1>
      <p class="m-0 text-lg leading-[22.75px] text-text">
        {{ $t('orientation.formules.subtitle') }}
      </p>
    </div>
    <img
      src="/img/orientation-formules-hero.webp"
      alt=""
      width="105"
      height="105"
      class="-mt-19 -mr-8 block h-105 w-105 shrink-0 object-cover max-sm:hidden"
    >
  </div>

  <!-- Pile de formules -->
  <div class="flex w-full flex-col gap-22 pt-22 pb-22">
    <article
      v-for="tier in tiers"
      :key="tier.id"
      :class="['box-border flex w-full flex-col gap-14 rounded-2xl border bg-white px-20 pt-22 pb-24 max-2xs:px-14 max-2xs:pt-18 max-2xs:pb-20', tier.card]"
    >
      <header class="flex w-full flex-col items-center">
        <span
          v-if="tier.isTop"
          class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
        >
          <QIcon :name="tier.icon" :size="44" />
        </span>
        <QIcon v-else :name="tier.icon" :size="36" />

        <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', tier.name]">
          {{ $t(`orientation.formules.${tier.id}.name`) }}
        </h2>
        <span :class="['mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap', tier.badgeBg, tier.badgeText]">
          {{ $t(`orientation.formules.${tier.id}.badge`) }}
        </span>
        <p class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
          {{ $t(`orientation.formules.${tier.id}.tagline`) }}
        </p>

        <hr class="mt-14 w-full border-0 border-t border-border-soft">
      </header>

      <ul class="m-0 flex w-full list-none flex-col gap-8 p-0">
        <li v-for="(icon, i) in tier.featureIcons" :key="i" class="flex items-start gap-10 text-lg leading-18 text-text">
          <QIcon :name="icon" :size="12" />
          <span class="min-w-0">{{ $t(`orientation.formules.${tier.id}.feature${i + 1}`) }}</span>
        </li>
      </ul>

      <footer class="mt-8 flex w-full flex-col items-center gap-14 pt-8">
        <div class="flex flex-col items-center gap-2">
          <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', tier.price]">
            {{ $n(300, 'currency') }}
          </p>
          <p class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period">
            {{ $t('offer.perMonth') }}
          </p>
        </div>

        <NuxtLink
          :to="localePath(`/orientation/paiement-reussi?path=${path}&formule=${tier.id}`)"
          :class="['flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap no-underline', tier.button]"
        >
          {{ $t('orientation.formules.choose') }}
        </NuxtLink>
      </footer>
    </article>
  </div>
</template>
