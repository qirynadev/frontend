<script setup lang="ts">
/**
 * Sprite des icônes de chrome (barre du haut + navigation basse) — présentes
 * sur quasiment tout l'écran, quelle que soit la page.
 *
 * Rendues en `<symbol>` inline plutôt qu'en `<img src="*.svg">` (voir
 * `QIcon`) : elles font partie du HTML déjà envoyé par le SSR, donc **zéro
 * requête réseau supplémentaire** pour ces ~10 icônes qui, elles, se
 * répétaient sur chaque navigation. Les icônes propres à une seule page
 * restent en `<img>` — les mettre toutes en sprite gonflerait le HTML de
 * chaque page pour des icônes vues une fois.
 *
 * `fill="none"` sur **chaque** `<symbol>` (pas seulement le `<svg>` racine du
 * sprite) : les fichiers SVG d'origine le portaient sur leur balise racine,
 * mais un `<use>` n'hérite pas des attributs de l'ANCÊTRE d'origine du
 * `<symbol>` référencé — seulement de ceux posés directement dessus. Sans
 * ce rappel explicite, les tracés se remplissaient en noir plein (défaut
 * SVG), régression corrigée le 2026-09-04.
 *
 * Un seul exemplaire suffit pour toute l'app : monté une fois dans `app.vue`.
 */
</script>

<template>
  <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden">
    <symbol id="icon-ic-menu" viewBox="0 0 30.5 30.5" fill="none">
      <path d="M5.08333 6.35417H25.4167" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.08333 15.25H25.4167" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.08333 24.1458H25.4167" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-ic-lang-back" viewBox="0 0 24 24" fill="none">
      <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-ic-bell" viewBox="0 0 25 25" fill="none">
      <path d="M10.6958 21.875C10.8787 22.1917 11.1417 22.4547 11.4584 22.6375C11.7751 22.8203 12.1343 22.9166 12.5 22.9166C12.8657 22.9166 13.2249 22.8203 13.5416 22.6375C13.8583 22.4547 14.1213 22.1917 14.3042 21.875" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M1.86729 14.9441C1.73121 15.0933 1.64141 15.2788 1.60881 15.478C1.5762 15.6773 1.60221 15.8817 1.68365 16.0664C1.7651 16.2512 1.89847 16.4083 2.06756 16.5186C2.23664 16.6289 2.43414 16.6877 2.63604 16.6879H19.3027C19.5046 16.688 19.7021 16.6294 19.8713 16.5192C20.0405 16.4091 20.1741 16.2522 20.2557 16.0676C20.3374 15.883 20.3636 15.6786 20.3313 15.4793C20.2989 15.2801 20.2094 15.0945 20.0735 14.9452C18.6881 13.517 17.2194 11.9993 17.2194 7.31288C17.2194 5.65528 16.5609 4.06557 15.3888 2.89347C14.2167 1.72136 12.627 1.06288 10.9694 1.06288C9.31177 1.06288 7.72206 1.72136 6.54996 2.89347C5.37785 4.06557 4.71937 5.65528 4.71937 7.31288C4.71937 11.9993 3.24958 13.517 1.86729 14.9441Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-home" viewBox="0 0 24 24" fill="none">
      <path d="M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M3 10C2.99993 9.70907 3.06333 9.42162 3.18579 9.15772C3.30824 8.89381 3.4868 8.6598 3.709 8.472L10.709 2.472C11.07 2.16691 11.5274 1.99952 12 1.99952C12.4726 1.99952 12.93 2.16691 13.291 2.472L20.291 8.472C20.5132 8.6598 20.6918 8.89381 20.8142 9.15772C20.9367 9.42162 21.0001 9.70907 21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V10Z" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-home-active" viewBox="0 0 24 24" fill="none">
      <path d="M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M3 10C2.99993 9.70907 3.06333 9.42162 3.18579 9.15772C3.30824 8.89381 3.4868 8.6598 3.709 8.472L10.709 2.472C11.07 2.16691 11.5274 1.99952 12 1.99952C12.4726 1.99952 12.93 2.16691 13.291 2.472L20.291 8.472C20.5132 8.6598 20.6918 8.89381 20.8142 9.15772C20.9367 9.42162 21.0001 9.70907 21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V10Z" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-messages" viewBox="0 0 24 24" fill="none">
      <path d="M3.086 17.509C3.17178 17.1193 3.13904 16.7129 2.992 16.342C1.96877 14.219 1.72826 11.8027 2.31289 9.51964C2.89753 7.23654 4.26975 5.23329 6.18744 3.86334C8.10513 2.49338 10.4451 1.84475 12.7944 2.0319C15.1437 2.21904 17.3514 3.22992 19.0281 4.88619C20.7047 6.54247 21.7425 8.73769 21.9583 11.0845C22.1741 13.4314 21.5541 15.7791 20.2077 17.7134C18.8613 19.6477 16.8749 21.0442 14.5992 21.6567C12.3234 22.2692 9.90439 22.0582 7.769 21.061C7.41853 20.9279 7.03772 20.8961 6.67 20.969L3.257 21.967C3.09236 22.0107 2.91929 22.0116 2.7542 21.9697C2.58911 21.9277 2.43747 21.8443 2.31367 21.7273C2.18986 21.6103 2.09799 21.4636 2.04678 21.3011C1.99556 21.1387 1.98668 20.9658 2.021 20.799L3.086 17.509Z" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-messages-active" viewBox="0 0 24 24" fill="none">
      <path d="M3.086 17.509C3.17178 17.1193 3.13904 16.7129 2.992 16.342C1.96877 14.219 1.72826 11.8027 2.31289 9.51964C2.89753 7.23654 4.26975 5.23329 6.18744 3.86334C8.10513 2.49338 10.4451 1.84475 12.7944 2.0319C15.1437 2.21904 17.3514 3.22992 19.0281 4.88619C20.7047 6.54247 21.7425 8.73769 21.9583 11.0845C22.1741 13.4314 21.5541 15.7791 20.2077 17.7134C18.8613 19.6477 16.8749 21.0442 14.5992 21.6567C12.3234 22.2692 9.90439 22.0582 7.769 21.061C7.41853 20.9279 7.03772 20.8961 6.67 20.969L3.257 21.967C3.09236 22.0107 2.91929 22.0116 2.7542 21.9697C2.58911 21.9277 2.43747 21.8443 2.31367 21.7273C2.18986 21.6103 2.09799 21.4636 2.04678 21.3011C1.99556 21.1387 1.98668 20.9658 2.021 20.799L3.086 17.509Z" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-projet" viewBox="0 0 24 24" fill="none">
      <path d="M12 12H12.01" stroke="#0D1B3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 13C19.0328 14.959 15.5555 16.0033 12 16.0033C8.44445 16.0033 4.96721 14.959 2 13" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20 6H4C2.89543 6 2 6.89543 2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6Z" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-projet-active" viewBox="0 0 24 24" fill="none">
      <path d="M12 12H12.01" stroke="#5825FD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 13C19.0328 14.959 15.5555 16.0033 12 16.0033C8.44445 16.0033 4.96721 14.959 2 13" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20 6H4C2.89543 6 2 6.89543 2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6Z" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-compte" viewBox="0 0 24 24" fill="none">
      <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#0D1B3E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>

    <symbol id="icon-nav-compte-active" viewBox="0 0 24 24" fill="none">
      <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#5825FD" stroke="#5825FD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </symbol>
  </svg>
</template>
