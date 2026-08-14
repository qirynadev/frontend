<script setup lang="ts">
import type { OfferTier } from '~/core/contracts'

/**
 * Carte tarifaire — portage littéral de `.formule-card`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | carte | `padding: 22px 20px 24px`, bord `#e5e7eb`, rayon 12, `gap: 14px` |
 * | icône | 36×36 (44×44 pour le dernier palier, dans une pastille `#fef2f2`) |
 * | nom | 20px / 28px, `font-weight: 600`, coloré par l'accent |
 * | accroche | 13px / 18px, centrée, `max-width: 260px` |
 * | filet | `margin-top: 14px`, `#f1f5f9` |
 * | liste | `gap: 8px`, 13px / 18px, coche 12×12 |
 * | prix | 28px, `line-height: 1.1`, coloré par l'accent |
 * | période | 12px, `#7f7979` |
 * | bouton | `padding: 14px 16px`, rayon 8 — contour, plein pour le dernier |
 * | sous 380px | `padding: 18px 14px 20px`, nom 18px, prix 24px |
 *
 * **L'accent est déduit du rang, pas du nom.** L'adapter trie les paliers par
 * prix croissant ; le moins cher est vert, le suivant violet, le plus cher
 * rouge — comme dans la maquette (200 € / 300 € / 400 €). Renommer une formule
 * côté back-office ne casse donc rien.
 */
const props = withDefaults(
  defineProps<{
    tier: OfferTier
    /** Rang du palier, du moins cher au plus cher. */
    index?: number
    /** Nombre total de paliers : le dernier reçoit le traitement « Everest ». */
    total?: number
    /** Achat en cours pour ce palier. */
    loading?: boolean
    /** Un autre palier est en cours d'achat : celui-ci ne doit pas partir aussi. */
    disabled?: boolean
  }>(),
  { index: 0, total: 1, loading: false, disabled: false },
)

const emit = defineEmits<{ choose: [tier: OfferTier] }>()

const { n, t } = useI18n()

/**
 * Accroche du palier.
 *
 * `courses[].formulas[].description` est **vide** pour les douze formules du
 * catalogue. En attendant que le back-office soit alimenté, on reprend les
 * accroches de la maquette, indexées sur le rang.
 */
const tagline = computed(() => props.tier.tagline || t(`offer.tagline${Math.min(props.index + 1, 3)}`))

/** Dernier palier d'un jeu d'au moins deux : accent rouge et bouton plein. */
const isTop = computed(() => props.total > 1 && props.index === props.total - 1)

const accent = computed(() => {
  if (isTop.value) {
    return {
      card: 'border-tier-3-border',
      name: 'text-tier-3',
      price: 'text-tier-3',
      button: 'border border-tier-3 bg-tier-3 text-white',
      icon: 'ic-formule-everest',
      check: 'ic-formule-check-red',
    }
  }
  if (props.index === 0) {
    return {
      card: 'border-tier-border',
      name: 'text-tier-1',
      price: 'text-tier-1-price',
      button: 'border border-tier-1-line bg-white text-tier-1-line',
      icon: 'ic-formule-kili',
      check: 'ic-formule-check-green',
    }
  }
  return {
    card: 'border-tier-border',
    name: 'text-tier-2',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    icon: 'ic-formule-acon',
    check: 'ic-formule-check-purple',
  }
})
</script>

<template>
  <article
    :class="[
      'flex w-full min-w-0 shrink-0 basis-full flex-col gap-14 rounded-2xl border bg-white px-20 pt-22 pb-24 max-2xs:px-14 max-2xs:pt-18 max-2xs:pb-20',
      accent.card,
    ]"
  >
    <header class="flex w-full flex-col items-center">
      <!-- Le dernier palier porte son icône dans une pastille. -->
      <span
        v-if="isTop"
        class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
      >
        <QIcon :name="accent.icon" :size="44" />
      </span>
      <QIcon v-else :name="accent.icon" :size="36" />

      <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', accent.name]">
        {{ tier.name }}
      </h2>

      <p v-if="tagline" class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
        {{ tagline }}
      </p>

      <hr class="mt-14 w-full border-0 border-t border-border-soft">
    </header>

    <ul v-if="tier.features.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
      <li v-for="feature in tier.features" :key="feature" class="flex items-center gap-10 text-lg leading-18 text-text">
        <QIcon :name="accent.check" :size="12" />
        <span class="min-w-0">{{ feature }}</span>
      </li>
    </ul>

    <footer class="mt-auto flex w-full flex-col items-center gap-14 pt-8">
      <div class="flex flex-col items-center gap-2">
        <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', accent.price]">
          {{ n(tier.price.amount, 'currency') }}
        </p>
        <p class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period">
          {{ tier.periodLabel === 'month' ? $t('offer.perMonth') : $t('offer.oneOff') }}
        </p>
      </div>

      <button
        type="button"
        :disabled="loading || disabled"
        :class="[
          'flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap',
          accent.button,
          loading || disabled ? 'cursor-not-allowed opacity-60' : '',
        ]"
        @click="emit('choose', tier)"
      >
        <QSpinner v-if="loading" size="sm" />
        <span v-else>{{ $t('offer.choose') }}</span>
      </button>
    </footer>
  </article>
</template>
