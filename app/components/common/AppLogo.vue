<script setup lang="ts">
/**
 * Logotype Qiryna, repris de la maquette.
 *
 * `maquette/pwa/assets/images/logo.png` pèse **1,93 Mo** — inutilisable tel
 * quel. Le fichier a été détouré et ré-encodé en WebP ×3 :
 * `public/img/logo.webp` (450×141, ratio 3,191), **13,2 Ko**.
 *
 * La maquette affiche le logo dans un cadre de 145×45 (accueil) ou 150×47
 * (authentification) et recadre l'image en absolu (`position:absolute` +
 * `width`/`height`/`left`/`top` en %) pour retirer les marges généreuses de
 * son PNG source (1536×1024) : le contenu réel (icône + wordmark) n'occupe
 * que ~93 % de la largeur et ~79 % de la hauteur du cadre — vérifié en
 * mesurant le contenu non-transparent du PNG sur `qiryna.vercel.app`.
 *
 * `object-cover` (essayé initialement) donne un résultat visiblement plus
 * grand que la maquette : notre WebP a été détouré *sans* marge propre (son
 * contenu touche déjà les bords gauche/droit), donc `object-cover` le fait
 * remplir le cadre quasiment bord à bord au lieu de laisser la marge que la
 * maquette conserve. Les pourcentages ci-dessous sont recalculés pour notre
 * asset (bbox de contenu mesurée : 450×119 sur les 450×141 du WebP) pour
 * reproduire le même remplissage de cadre que la maquette, en suivant son
 * propre principe (position absolue + %, réutilisable pour tout cadre de
 * ratio proche — la maquette elle-même réutilise ses pourcentages tels
 * quels entre le cadre 145×45 et le 150×47).
 *
 * Le fichier vectoriel d'origine reste à demander à l'équipe design : il
 * remplacera ce WebP sans toucher au reste du code.
 *
 * **Logo administré (directives-backend §25, depuis le 2026-09-11)** : si un
 * logo clair est téléversé dans les réglages du back-office, il remplace ce
 * fichier. Il est posé dans la même boîte, en `object-contain` : pour notre
 * WebP, dont le ratio est celui de la boîte, le rendu est identique au pixel
 * près — et c'est le fichier actuellement téléversé en recette, octet pour
 * octet. Un autre logo, de ratio différent, reste proportionné et centré au
 * lieu d'être déformé. S'il ne se charge pas, retour au fichier local.
 * Le logo sombre attend le thème sombre de Kader.
 */
import type { Branding } from '~/core/contracts'

withDefaults(
  defineProps<{
    /** Largeur du cadre, en px. La maquette utilise 145 et 150. */
    width?: number
    height?: number
  }>(),
  { width: 145, height: 45 },
)

const LOCAL_LOGO = '/img/logo.webp'

const { data: branding } = useNuxtData<Branding>('branding')
const failed = ref(false)
const src = computed(() => (failed.value ? null : branding.value?.logoLight) || LOCAL_LOGO)
</script>

<template>
  <span class="relative block shrink-0 overflow-hidden" :style="{ width: `${width}px`, height: `${height}px` }">
    <img
      :src="src"
      alt="Qiryna"
      width="450"
      height="141"
      class="absolute block max-w-none object-contain"
      style="width: 93.1%; height: 94%; left: 3.41%; top: 4.29%;"
      @error="failed = true"
    >
  </span>
</template>
