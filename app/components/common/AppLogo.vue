<script setup lang="ts">
/**
 * Logotype Qiryna, repris de la maquette.
 *
 * `maquette/pwa/assets/images/logo.png` pèse **1,93 Mo** — inutilisable tel
 * quel. Le fichier a été détouré et ré-encodé en WebP ×3 :
 * `public/img/logo.webp` (450×141, ratio 3,191), **13,2 Ko**.
 *
 * La maquette affiche le logo dans un cadre de 145×45 (accueil) ou 150×47
 * (authentification) et **recadre l'image en absolu** (cover resserré) pour
 * retirer les marges du PNG source. `object-contain` (réduction, avec
 * letterboxing potentiel) mesurait faux au pixel sur l'accueil : l'image
 * source ayant déjà été détourée au ratio 150×47 = 3,191 — identique au
 * cadre d'authentification, quasi identique à celui de l'accueil (3,222) —
 * `object-cover` reproduit le même cadrage resserré sans reprendre le
 * pourcentage de recadrage de la maquette, propre au PNG d'origine et
 * inapplicable à cet asset détouré différemment.
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
  <img
    src="/img/logo.webp"
    alt="Qiryna"
    :width="width"
    :height="height"
    :style="{ width: `${width}px`, height: `${height}px` }"
    class="block shrink-0 object-cover"
  >
</template>
