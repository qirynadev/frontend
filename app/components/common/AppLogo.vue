<script setup lang="ts">
/**
 * Logotype Qiryna, repris de la maquette.
 *
 * `maquette/pwa/assets/images/logo.png` pèse **1,93 Mo** — inutilisable tel
 * quel. Le fichier a été détouré et ré-encodé en WebP ×3 :
 * `public/img/logo.webp`, **13,2 Ko** pour un rendu identique.
 *
 * La maquette affiche le logo dans un cadre de 145×45 (accueil) ou 150×47
 * (authentification) et **recadre l'image en absolu** pour retirer les marges
 * du PNG. Le détourage rendant ce recadrage inutile, on affiche simplement
 * l'image à la bonne taille — le résultat visuel est le même.
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
    class="block shrink-0 object-contain"
  >
</template>
