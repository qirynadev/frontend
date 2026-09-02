<script setup lang="ts">
import type { NavItem } from '~/design-system/types'
import { bottomNavEntries, resolveActiveNavId } from '~/config/navigation'

/**
 * Navigation principale du produit.
 *
 * Fait le lien entre la configuration (`config/navigation.ts`), i18n et la
 * primitive muette `QBottomNav` :
 * - les libellés sont traduits ici ;
 * - les chemins sont localisés ici (`/messages` → `/en/messages`) ;
 * - l'onglet actif se **déduit de la route courante**, il n'est jamais passé à
 *   la main par une page.
 *
 * Même barre partout (y compris auth) : logo Orientation inclus.
 */

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/**
 * Chemin délocalisé : `/en/mon-projet` → `/mon-projet`.
 *
 * La configuration raisonne en chemins non préfixés ; sans ce retrait, aucun
 * onglet ne s'allumerait en anglais.
 */
const unlocalizedPath = computed(() => {
  const prefix = `/${locale.value}`
  if (route.path === prefix) return '/'
  return route.path.startsWith(`${prefix}/`) ? route.path.slice(prefix.length) : route.path
})

const items = computed<NavItem[]>(() =>
  bottomNavEntries.map((entry) => ({
    id: entry.id,
    to: localePath(entry.to),
    label: t(entry.labelKey),
    icon: entry.icon,
    iconActive: entry.iconActive,
    iconWidth: entry.iconWidth,
    iconHeight: entry.iconHeight,
  })),
)

const active = computed(() => resolveActiveNavId(unlocalizedPath.value))
</script>

<template>
  <QBottomNav :items="items" :active="active" :aria-label="$t('nav.mainLabel')" />
</template>
