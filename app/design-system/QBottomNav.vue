<script setup lang="ts">
/**
 * Barre de navigation basse — portage littéral de `.bottom-nav` / `.nav-item`.
 *
 * | Propriété | Maquette |
 * |---|---|
 * | position | `fixed`, `bottom: max(12px, safe-area)`, centrée |
 * | largeur | `100% − 2×15px`, plafonnée à `768px − 2×15px` |
 * | fond | blanc, rayon 10px, ombre `0 0 3.5px rgb(0 0 0 / .1)` |
 * | espacements | `gap: 8px`, `padding: 10px 8px` |
 * | onglet | `gap: 1px`, libellé 10px/20px, `font-weight: 500` |
 * | cadre d'icône | 36×34, icône 24×24 (36×34 pour « Orientation ») |
 * | couleur | `--color-navy`, actif `--color-nav-active` (libellé + icône `-active`) |
 *
 * Orientation : logo Qiryna inchangé à l'actif — seul le libellé se colore.
 *
 * Primitive muette : elle reçoit des entrées **déjà traduites** et
 * l'identifiant de l'onglet actif. Elle ne connaît ni les routes du produit,
 * ni i18n, ni la route courante — c'est `AppBottomNav` qui s'en charge.
 */
import type { NavItem } from './types'

withDefaults(
  defineProps<{
    items: NavItem[]
    /** `id` de l'entrée active. */
    active?: string
    ariaLabel?: string
    /** Rendu dans le flux plutôt qu'en position fixe (galerie, aperçus). */
    inline?: boolean
  }>(),
  { active: undefined, ariaLabel: undefined, inline: false },
)
</script>

<template>
  <nav
    :aria-label="ariaLabel ?? $t('ds.nav.main')"
    :class="[
      'flex items-center justify-center gap-8 rounded-xl bg-white px-8 py-10 shadow-card',
      inline
        ? 'w-full'
        : 'fixed bottom-nav-bottom left-1/2 z-50 w-[calc(100%-var(--spacing-nav-inset)*2)] max-w-[calc(var(--container-shell)-var(--spacing-nav-inset)*2)] -translate-x-1/2',
    ]"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.id"
      :to="item.to"
      :aria-current="item.id === active ? 'page' : undefined"
      class="flex min-w-0 flex-1 flex-col items-center justify-start gap-1 text-center text-sm leading-20 font-medium no-underline"
    >
      <span class="flex h-34 w-36 shrink-0 items-center justify-center">
        <!-- Icône active (violet) sauf Orientation : pas d'`iconActive`, logo conservé. -->
        <QIcon
          :name="item.id === active && item.iconActive ? item.iconActive : item.icon"
          :size="item.iconWidth"
          :height="item.iconHeight"
        />
      </span>
      <span
        :class="[
          'w-full truncate',
          item.id === active ? 'text-nav-active' : 'text-navy',
        ]"
      >{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>
