<script setup lang="ts">
import type { CourseSummary } from '~/core/contracts'
import { flagNameFor, presentationFor, type LanguageBadgeTone } from '~/config/language-badges'

/**
 * Carte de la grille de langues — portage littéral de `.langue-card`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | carte | `padding: 11px`, `gap: 10px`, bord `#f1f5f9`, rayon 10, ombre `0 2px 4px rgb(241 245 249 / .5)` |
 * | sélection | bordure `#4b0ffb`, ombre retirée |
 * | drapeau | 32×32, rayon 2, `object-fit: cover` — **rond**, dessiné par la maquette |
 * | nom | 14px / 24px, `font-weight: 500`, `white-space: nowrap` |
 * | étiquette | `padding: 3px 11px`, rayon 4, 10px / 15px — sept tonalités |
 * | coche | 16×16 ronde `#4b0ffb`, `top: -5px`, `right: 0`, icône 14×14 |
 *
 * ### Deux corrections de fidélité
 *
 * **Le drapeau vient de la maquette, pas de l'API.** Le back-office sert des
 * drapeaux `blade-flags` **rectangulaires** ; la maquette en dessine des
 * **ronds**. C'est le même pays, dessiné autrement — donc un choix de
 * présentation, qui revient au front. L'URL de l'API reste le repli pour toute
 * langue que la maquette ne dessine pas.
 *
 * **L'étiquette est colorée par tonalité.** La maquette en compte sept ; le
 * champ `badge` de l'API vaut `null` sur les quatre langues du catalogue. Le
 * libellé vient donc de `config/language-badges.ts` — et **`badge` l'emporte
 * dès qu'il est renseigné**, sans changer une ligne ici.
 */
const props = defineProps<{ course: CourseSummary; selected: boolean }>()
defineEmits<{ select: [slug: string] }>()

const presentation = computed(() => presentationFor(props.course.slug))

/** Drapeau de la maquette quand elle le dessine ; celui de l'API sinon. */
const flagName = computed(() => flagNameFor(props.course.slug, props.course.flag))

/** `badge` administré > libellé éditorial de la maquette > rien. */
const badgeLabel = computed(() => {
  if (props.course.badge) return props.course.badge
  return presentation.value ? undefined : null
})

const toneClass: Record<LanguageBadgeTone, string> = {
  'demandee': 'bg-lang-demandee-bg text-lang-demandee',
  'populaire': 'bg-lang-populaire-bg text-lang-populaire',
  'populaire-soft': 'bg-lang-populaire-soft-bg text-lang-populaire',
  'croissance': 'bg-lang-croissance-bg text-info',
  'croissance-soft': 'bg-lang-croissance-soft-bg text-info',
  'tres': 'bg-lang-tendance-bg text-lang-tendance',
  'tendance': 'bg-lang-tendance-bg text-lang-tendance',
}

/** Une langue hors maquette et sans `badge` administré garde la teinte neutre. */
const badgeClass = computed(() =>
  presentation.value ? toneClass[presentation.value.tone] : 'bg-primary-bg text-primary-link',
)
</script>

<template>
  <button
    type="button"
    role="option"
    :aria-selected="selected"
    :class="[
      'flex w-full cursor-pointer items-center gap-10 rounded-xl border bg-white p-11 text-left',
      selected ? 'border-primary-select shadow-none' : 'border-border-soft shadow-soft',
    ]"
    @click="$emit('select', course.slug)"
  >
    <!-- Drapeau rond de la maquette. `QIcon` le sert depuis `public/icons/flags/`. -->
    <QIcon v-if="flagName" :name="flagName" :size="32" class="rounded-xs object-cover" />
    <img
      v-else-if="course.flag"
      :src="course.flag"
      alt=""
      width="32"
      height="32"
      loading="lazy"
      class="block size-32 shrink-0 rounded-xs object-cover"
    >
    <span v-else class="block size-32 shrink-0 rounded-xs bg-surface-2" />

    <span class="relative flex min-w-0 flex-1 flex-col items-start">
      <span class="text-xl leading-24 font-medium whitespace-nowrap text-navy">{{ course.name }}</span>

      <span
        v-if="badgeLabel !== null"
        :class="[
          'inline-flex items-center justify-center rounded-sm px-11 py-3 text-sm leading-15 font-medium whitespace-nowrap',
          badgeClass,
        ]"
      >
        <!-- Espace insécable finale de la maquette : l'étiquette étant ajustée
             à son contenu, elle vaut 3px de largeur. Elle vit ici plutôt que
             dans la traduction, où elle serait invisible et retirée. -->
        {{ badgeLabel ?? $t(presentation!.labelKey) }}&nbsp;
      </span>

      <span
        v-if="selected"
        aria-hidden="true"
        class="absolute -top-5 right-0 flex size-16 items-center justify-center rounded-full bg-primary-select"
      >
        <QIcon name="ic-lang-check" :size="14" />
      </span>
    </span>
  </button>
</template>
