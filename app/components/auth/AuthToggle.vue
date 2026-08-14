<script setup lang="ts">
/**
 * Bascule « Se connecter / S'inscrire » — `.auth-toggle` de `app.css`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | conteneur | bord 1px `--q-border`, rayon 10, `padding: 7px`, `margin: 0` |
 * | onglet | `flex: 1`, `padding: 12px`, 14px / 20px, `font-weight: 600` |
 * | onglet actif | fond `--q-primary-dark`, blanc, rayon 10, ombre `0 1px 1px rgba(0,0,0,.05)` |
 * | onglet inactif | rayon 12, `--q-text` |
 *
 * Le rayon diffère de 2px entre l'onglet actif (10) et l'inactif (12) — sans
 * effet visible, l'inactif n'ayant pas de fond, mais c'est ce que dit
 * `app.css` et il n'y a pas de raison de trancher à sa place.
 *
 * L'onglet actif est un `<button disabled>` et non un lien : la maquette
 * l'écrit ainsi, et cliquer sur l'écran où l'on se trouve ne doit rien faire.
 */
defineProps<{ active: 'signIn' | 'signUp' }>()

const localePath = useLocalePath()
const route = useRoute()
</script>

<template>
  <div class="flex rounded-xl border border-border p-7">
    <button
      v-if="active === 'signIn'"
      type="button"
      disabled
      aria-current="page"
      class="flex-1 cursor-pointer border-0 p-12 text-center text-xl leading-20 font-semibold no-underline rounded-xl bg-primary-dark text-white shadow-2xs"
    >
      {{ $t('auth.signIn') }}
    </button>
    <NuxtLink
      v-else
      :to="{ path: localePath('/connexion'), query: route.query }"
      class="flex-1 cursor-pointer border-0 p-12 text-center text-xl leading-20 font-semibold no-underline rounded-2xl bg-transparent text-text"
    >
      {{ $t('auth.signIn') }}
    </NuxtLink>

    <button
      v-if="active === 'signUp'"
      type="button"
      disabled
      aria-current="page"
      class="flex-1 cursor-pointer border-0 p-12 text-center text-xl leading-20 font-semibold no-underline rounded-xl bg-primary-dark text-white shadow-2xs"
    >
      {{ $t('auth.signUp') }}
    </button>
    <NuxtLink
      v-else
      :to="{ path: localePath('/inscription'), query: route.query }"
      class="flex-1 cursor-pointer border-0 p-12 text-center text-xl leading-20 font-semibold no-underline rounded-2xl bg-transparent text-text"
    >
      {{ $t('auth.signUp') }}
    </NuxtLink>
  </div>
</template>
