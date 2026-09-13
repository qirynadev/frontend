<script setup lang="ts">
/**
 * `/compte` n'a pas d'écran propre : `reglages.html` en tient lieu. Plus aucun
 * lien du produit n'y mène (barre du bas, menu latéral, barre desktop vont
 * directement sur `/reglages` depuis le 2026-09-13) — la page ne reste que
 * comme alias, pour un ancien lien ou un favori.
 *
 * **Plus de garde d'authentification ici**, volontairement. Elle faisait
 * transiter chaque clic sur « Mon compte » par `middleware/auth.ts` puis, en
 * cas de session pas encore résolue, par `/connexion?redirect=/compte`, qui
 * renvoyait aussitôt l'utilisateur connecté vers `/compte` : une boucle
 * connexion → redirection → déconnexion constatée sur mobile. `/reglages` est
 * un sommaire public ; les écrans qui exigent un compte (informations
 * personnelles, mot de passe…) portent leur propre garde.
 */

const localePath = useLocalePath()

await navigateTo(localePath('/reglages'), { replace: true })
</script>

<template>
  <div />
</template>
