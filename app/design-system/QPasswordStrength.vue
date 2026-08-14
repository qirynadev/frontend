<script setup lang="ts">
import type { StrengthScore } from './types'

/**
 * Robustesse d'un mot de passe — `.password-strength` de `app.css`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | bloc | colonne, `gap: 5px` |
 * | barres | `gap: 5px`, `flex: 1 1 0`, `max-width: 87px`, hauteur 4px, rayon plein |
 * | barre vide | `#f1f0fa` |
 * | barre remplie | faible `--q-danger` · moyen `--q-warning` · fort `--q-success` |
 * | indication | 9px / 16px, `--q-text` — rouge si insuffisant, vert si valide |
 *
 * **La tonalité de l'indication ne suit pas le score.** La maquette n'en
 * connaît que trois états — neutre, insuffisant, valide — là où les barres en
 * comptent quatre : un mot de passe « moyen » affiche des barres oranges et un
 * message *rouge*, parce qu'il est refusé. D'où `hintTone`, indépendant.
 */
type HintTone = 'neutral' | 'error' | 'ok'

withDefaults(
  defineProps<{
    /** 0 = vide, 1 = faible, 2 = moyen, 3 = fort. */
    score?: StrengthScore
    /** Message sous les barres (« 8 caractères minimum », « Mot de passe valide »…). */
    hint?: string
    /** Tonalité du message, décidée par l'appelant. */
    hintTone?: HintTone
    /** Nombre de barres affichées. */
    segments?: number
  }>(),
  { score: 0, hint: undefined, hintTone: 'neutral', segments: 3 },
)

const fillClass: Record<Exclude<StrengthScore, 0>, string> = {
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-success',
}

const hintClass: Record<HintTone, string> = {
  neutral: 'text-text',
  error: 'text-danger',
  ok: 'text-success',
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div
      class="flex items-center gap-5"
      role="progressbar"
      :aria-valuenow="score"
      :aria-valuemin="0"
      :aria-valuemax="segments"
      :aria-valuetext="hint"
    >
      <span
        v-for="index in segments"
        :key="index"
        :class="[
          'h-4 max-w-87 flex-1 rounded-full transition-colors duration-200',
          score > 0 && index <= score ? fillClass[score as Exclude<StrengthScore, 0>] : 'bg-strength-track',
        ]"
      />
    </div>

    <p v-if="hint" :class="['m-0 text-xs leading-16', hintClass[hintTone]]">{{ hint }}</p>
  </div>
</template>
