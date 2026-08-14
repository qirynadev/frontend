<script setup lang="ts">
import type { TrustItem } from './types'

/**
 * Bandeau de réassurance — portage littéral de `.q-trust`.
 *
 * Un seul composant pour les six déclinaisons de la maquette (`q-trust`,
 * `formule-trust-item`, `dom-trust-item`, `dest-trust-item`,
 * `objectifs-trust-item`, `langue-trust-item`) : 41 classes absorbées.
 *
 * | Élément | Maquette |
 * |---|---|
 * | conteneur | `gap: 10px`, `padding: 11px 1px`, bord `#f1f5f9`, fond `#f9f8fe`, rayon 10 |
 * | items | largeurs fixes 104 / 121 / 97 px, ramenées à `flex: 1` sous 380px |
 * | icône | 40×40, ou 24×24 dans une pastille ronde `#def5e3` |
 * | libellé | 11px / 13,125px, `font-weight: 600`, sur **deux lignes** |
 * | séparateur | 1×52px, `#e6e5f5` |
 */
withDefaults(
  defineProps<{
    items: TrustItem[]
    ariaLabel?: string
  }>(),
  { ariaLabel: undefined },
)

/** Largeurs relevées item par item dans `app.css`. */
const widthClass = ['w-104 pr-4', 'w-121 px-4', 'w-97 pl-4']
</script>

<template>
  <aside
    :aria-label="ariaLabel"
    class="flex w-full items-center justify-center gap-10 rounded-xl border border-border-soft bg-surface-3 px-1 py-11"
  >
    <template v-for="(item, index) in items" :key="item.label">
      <span
        v-if="index > 0"
        aria-hidden="true"
        class="h-52 w-1 shrink-0 self-center bg-border-2"
      />

      <div
        :class="[
          'flex shrink-0 flex-col items-center',
          widthClass[index] ?? 'w-104',
          // Sous 380px, la maquette libère les largeurs fixes.
          'max-2xs:w-auto max-2xs:flex-1 max-2xs:px-0',
        ]"
      >
        <!-- La deuxième garantie est la seule à recevoir une pastille ronde. -->
        <span
          v-if="item.circled"
          class="flex size-40 items-center justify-center rounded-full bg-success-soft"
        >
          <QIcon :name="item.icon" :size="24" />
        </span>
        <QIcon v-else :name="item.icon" :size="40" />

        <p class="m-0 pt-6 text-center text-md leading-[13.125px] font-semibold text-navy">
          {{ item.label }}<br>{{ item.label2 }}
        </p>
      </div>
    </template>
  </aside>
</template>
