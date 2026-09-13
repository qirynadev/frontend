<script setup lang="ts">
import type { NavItem } from '~/design-system/types'
import { bottomNavEntries, resolveActiveNavId } from '~/config/navigation'
import { useSessionStore } from '~/core/stores'

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
 *
 * **Compte connecté** (2026-09-13) : pastille verte sur l'icône quand une
 * session est ouverte — sans elle, rien ne distinguait un client connecté d'un
 * visiteur. La session est résolue au rendu serveur (`plugins/session.ts`) :
 * la pastille est là dès le premier affichage, sans clignotement.
 */

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const session = useSessionStore()

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
    indicator: entry.id === 'account' && session.isAuthenticated,
    indicatorLabel: entry.id === 'account' && session.isAuthenticated ? t('nav.signedIn') : undefined,
  })),
)

const active = computed(() => resolveActiveNavId(unlocalizedPath.value))
</script>

<template>
  <QBottomNav :items="items" :active="active" :aria-label="$t('nav.mainLabel')" />
</template>
