<script setup lang="ts">
/**
 * Rail défilant. Absorbe `formule-slider-*`, `home-news-scroll` et `le-chips`.
 *
 * Le défilement s'appuie sur `scroll-snap` natif : pas de librairie, pas de JS
 * de positionnement, et le geste tactile reste celui du système.
 */

const props = withDefaults(
  defineProps<{
    /** Nombre d'éléments — nécessaire pour les pastilles. */
    count?: number
    /** Flèches précédent/suivant (masquées au tactile). */
    arrows?: boolean
    dots?: boolean
    /** Largeur d'un élément : `full` (une carte par écran) ou `auto`. */
    itemWidth?: 'full' | 'auto'
    ariaLabel?: string
  }>(),
  { count: 0, arrows: false, dots: false, itemWidth: 'auto', ariaLabel: undefined },
)

const viewport = ref<HTMLElement | null>(null)
const index = ref(0)

function scrollToIndex(next: number) {
  const element = viewport.value
  if (!element || props.count === 0) return
  const target = Math.min(Math.max(next, 0), props.count - 1)
  index.value = target
  element.scrollTo({ left: (element.scrollWidth / props.count) * target, behavior: 'smooth' })
}

/** `QPager` compte à partir de 1, le rail à partir de 0. */
const dotPage = computed({
  get: () => index.value + 1,
  set: (value: number) => scrollToIndex(value - 1),
})

function onScroll() {
  const element = viewport.value
  if (!element || props.count === 0) return
  index.value = Math.round(element.scrollLeft / (element.scrollWidth / props.count))
}
</script>

<template>
  <div class="flex w-full flex-col gap-12">
    <div class="relative flex items-center gap-8">
      <QIconButton
        v-if="arrows"
        icon="chevron-left"
        variant="surface"
        size="sm"
        :label="$t('ds.carousel.previous')"
        :disabled="index <= 0"
        class="hidden shell:inline-flex"
        @click="scrollToIndex(index - 1)"
      />

      <ul
        ref="viewport"
        :aria-label="ariaLabel"
        class="m-0 flex w-full snap-x snap-mandatory list-none gap-12 overflow-x-auto scroll-smooth p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onScroll"
      >
        <li
          v-for="(_, slotIndex) in count || 1"
          :key="slotIndex"
          :class="['snap-start', itemWidth === 'full' ? 'w-full shrink-0' : 'shrink-0']"
        >
          <slot :index="slotIndex" />
        </li>
      </ul>

      <QIconButton
        v-if="arrows"
        icon="chevron-right"
        variant="surface"
        size="sm"
        :label="$t('ds.carousel.next')"
        :disabled="index >= count - 1"
        class="hidden shell:inline-flex"
        @click="scrollToIndex(index + 1)"
      />
    </div>

    <QPager
      v-if="dots && count > 1"
      v-model:page="dotPage"
      variant="dots"
      :total="count"
      class="justify-center"
    />
  </div>
</template>
