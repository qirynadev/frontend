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
 */
withDefaults(
  defineProps<{
    /** Largeur du cadre, en px. La maquette utilise 145 et 150. */
    width?: number
    height?: number
  }>(),
  { width: 145, height: 45 },
)
</script>

<template>
  <span class="relative block shrink-0 overflow-hidden" :style="{ width: `${width}px`, height: `${height}px` }">
    <img
      src="/img/logo.webp"
      alt="Qiryna"
      width="450"
      height="141"
      class="absolute block max-w-none"
      style="width: 93.1%; height: 94%; left: 3.41%; top: 4.29%;"
    >
  </span>
</template>
