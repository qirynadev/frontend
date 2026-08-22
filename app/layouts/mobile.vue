<script setup lang="ts">
/**
 * Shell mobile — portage littéral de `.screen-shell` / `.screen` /
 * `.X-header` / `.X-main` de la maquette.
 *
 * La structure des quinze pages est identique :
 *
 * ```
 * .screen-shell            min-height: 100dvh, fond #eef0f5, centré
 *   .screen                max-width: 768px, fond blanc, overflow: hidden
 *     .X-header            padding: 0 gutter 24px, flex column
 *       .X-main            flex: 1, overflow-y: auto
 *                          padding-top: 16px
 *                          padding-bottom: 75 + 24 + safe-area
 *         <topbar>         premier enfant de la page
 *         …contenu…
 *     <bottom-nav>         position: fixed
 * ```
 *
 * La barre supérieure est le **premier élément de la page**, pas du layout :
 * c'est ainsi que la maquette la place, à l'intérieur de la zone qui défile.
 *
 * Une page qui veut se passer de la barre basse le déclare :
 * `definePageMeta({ bottomNav: false })`.
 */

const route = useRoute()

/** Barre basse affichée par défaut ; une page peut la retirer. */
const showBottomNav = computed(() => route.meta.bottomNav !== false)

/**
 * Fond du shell.
 *
 * Blanc partout, sauf sur les deux écrans que la maquette teinte en entier
 * (`.page-lpp`, `.page-mon-projet`). La décision appartient à la page, mais
 * l'application au shell : un bloc teinté à l'intérieur laisserait apparaître
 * du blanc sous le contenu court.
 */
const shellClass = computed(() => (route.meta.shellBackground === 'tint' ? 'bg-shell-tint' : 'bg-white'))
</script>

<template>
  <div class="flex min-h-dvh justify-center bg-backdrop shell:items-center shell:px-gutter shell:py-24">
    <!-- `id` : cible du portail du menu latéral, que la maquette confine au
         shell (`position: absolute`) plutôt qu'à la fenêtre. -->
    <div
      id="q-shell"
      :class="[
        'relative flex min-h-dvh w-full max-w-shell flex-col overflow-hidden shell:min-h-[calc(100dvh-48px)]',
        shellClass,
      ]"
    >
      <div class="flex min-h-0 flex-1 flex-col px-gutter pb-24">
        <main
          :class="[
            /* Pas de `scrollbar-gutter: stable` : réserve une bande vide à droite
               et décale le contenu. Le saut d’onglets (école / messages) reste
               acceptable vs un layout asymétrique permanent. */
            'min-h-0 flex-1 overflow-y-auto pt-16',
            showBottomNav ? 'pb-content-bottom' : 'pb-safe-bottom',
          ]"
        >
          <slot />
        </main>
      </div>

      <slot name="nav">
        <AppBottomNav v-if="showBottomNav" />
      </slot>
    </div>
  </div>
</template>
