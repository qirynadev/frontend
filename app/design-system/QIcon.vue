<script setup lang="ts">
import { icons, type IconDefinition, type IconName } from './icons'

/**
 * Pictogramme, avec **deux sources**.
 *
 * 1. **Les icônes de la maquette** — tout nom commençant par `ic-`, `nav-` ou
 *    `flag-` désigne un fichier de `public/img/icons/`, repris tel quel du dossier
 *    `maquette/pwa/assets/icons` (206 SVG, 175 Ko au total). Elles portent
 *    leurs propres couleurs : c'est ce qui garantit la fidélité au pixel.
 *    Elles sont rendues en `<img>`, donc mises en cache par le navigateur et
 *    absentes du bundle JavaScript.
 *
 * 2. **Le registre interne** — pour les états que la maquette ne dessine
 *    nulle part (recherche, vide, erreur). Rendues en SVG inline, elles
 *    suivent `currentColor`.
 *
 * Une icône de la maquette existe presque toujours : la préférer.
 */
const props = withDefaults(
  defineProps<{
    /** Nom de fichier maquette (`ic-bell`) ou clé du registre interne (`search`). */
    name: IconName | (string & {})
    /** Largeur. La hauteur suit, sauf si `height` est fourni. */
    size?: number
    height?: number
    strokeWidth?: number
    /** Renseigné → l'icône est annoncée. Sinon décorative. */
    label?: string
  }>(),
  { size: 20, height: undefined, strokeWidth: 1.5, label: undefined },
)

/**
 * Icônes de chrome (barre du haut + navigation basse) : présentes sur
 * quasiment tout écran, donc extraites en sprite (`QIconSprite`, monté une
 * fois dans `app.vue`) plutôt qu'en `<img>` répété à chaque navigation — voir
 * son commentaire. Toutes les autres icônes de la maquette restent en
 * `<img>` : les mettre aussi en sprite gonflerait le HTML de chaque page pour
 * des icônes qui n'y apparaissent qu'une fois.
 */
const SPRITE_ICONS = new Set([
  'ic-menu',
  'ic-lang-back',
  'ic-bell',
  'nav-home',
  'nav-home-active',
  'nav-messages',
  'nav-messages-active',
  'nav-projet',
  'nav-projet-active',
  'nav-compte',
  'nav-compte-active',
])
const isSprite = computed(() => SPRITE_ICONS.has(props.name))

/** Les fichiers de la maquette se reconnaissent à leur préfixe. */
const isAsset = computed(() => !isSprite.value && /^(ic-|nav-|flag-|status-)/.test(props.name))

const assetSrc = computed(() => {
  // ⚠️ Servi sous `/img/icons/`, **jamais `/icons/`**. Sur un serveur Apache
  // (le cas de Plesk), `/icons/` est un **alias système réservé** —
  // `Alias /icons/ "/usr/share/apache2/icons/"`, présent par défaut : toute
  // requête `/icons/*` est détournée vers le dossier d'icônes d'Apache, jamais
  // vers les fichiers du site. D'où des 404 en production alors que les fichiers
  // existent. Source unique : `public/img/icons/`, 378 fichiers.
  // `flag-es` est le seul drapeau que la maquette fournit en raster.
  if (props.name === 'flag-es') return '/img/icons/flags/flag-es.webp'
  if (props.name === 'ic-orientation-logo') return '/img/icons/ic-orientation-logo.webp'
  if (props.name.startsWith('flag-')) return `/img/icons/flags/${props.name}.svg`
  return `/img/icons/${props.name}.svg`
})

const icon = computed<IconDefinition | null>(() => icons[props.name as IconName] ?? null)
const isFilled = computed(() => icon.value?.style === 'fill')
</script>

<template>
  <svg
    v-if="isSprite"
    :width="size"
    :height="height ?? size"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
    class="block shrink-0"
  ><use :href="`#icon-${name}`" /></svg>

  <img
    v-else-if="isAsset"
    :src="assetSrc"
    :alt="label ?? ''"
    :width="size"
    :height="height ?? size"
    :aria-hidden="label ? undefined : 'true'"
    class="block shrink-0"
    :style="{ width: `${size}px`, height: `${height ?? size}px` }"
  >

  <svg
    v-else-if="icon"
    :width="size"
    :height="height ?? size"
    viewBox="0 0 24 24"
    :fill="isFilled ? 'currentColor' : 'none'"
    :stroke="isFilled ? 'none' : 'currentColor'"
    :stroke-width="isFilled ? undefined : strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
    class="shrink-0"
    v-html="icon.body"
  />
</template>
