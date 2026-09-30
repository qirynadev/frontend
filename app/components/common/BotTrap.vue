<script setup lang="ts">
/**
 * Champ piège anti-robots, à poser **dans** chaque `<form>` protégé.
 *
 * Invisible et hors de la navigation au clavier pour un humain, ignoré des
 * lecteurs d'écran et de l'autocomplétion ; un robot qui remplit tous les
 * champs le remplit aussi. Relié au `useBotGuard()` de la page par injection.
 * Un nom anodin (`website`) : un robot évite les champs nommés « piège ».
 */
import { BOT_GUARD_KEY } from '~/composables/useBotGuard'

const guard = inject(BOT_GUARD_KEY, null)
</script>

<template>
  <div v-if="guard" aria-hidden="true" class="bot-trap">
    <label>
      Website
      <input
        v-model="guard.trap.value"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
      >
    </label>
  </div>
</template>

<style scoped>
/* Hors écran plutôt que `display: none`, que certains robots savent repérer. */
.bot-trap {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
