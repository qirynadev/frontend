<script setup lang="ts">
import type { IconName } from './icons'

/**
 * Champ de saisie — portage littéral de `.input-group` / `.input-field`.
 *
 * | Élément | Maquette (`app.css`) |
 * |---|---|
 * | libellé | 12px / 16px, `font-weight: 500`, `letter-spacing: .3px`, `--q-navy`, 6px d'écart |
 * | cadre | bord 1px `--q-border`, rayon 10, `padding: 15px 17px`, `gap: 12px` |
 * | saisie | 14px / 20px, `font-weight: 500`, hauteur 20px, `--q-text` |
 * | indication | `--q-muted` |
 * | œil | absolu `right: 10px`, `top: 10px`, `padding: 4px`, icône 20×20 — le cadre réserve `padding-right: 52px` |
 * | invalide / valide | bord `--q-danger` / `--q-success` (`.is-invalid`, `.is-valid`) |
 *
 * **Le pictogramme n'est pas carré.** La maquette dimensionne chacun selon son
 * dessin : enveloppe 16,25 × 12,5 ; cadenas 12,5 × 16,25 ; silhouette 14 × 18.
 * D'où `iconWidth` / `iconHeight` plutôt qu'une taille unique — sans quoi
 * l'enveloppe serait rendue en 20 × 20 et pousserait la saisie de 4px.
 *
 * **L'œil est positionné en absolu**, pas placé dans le flux. Un bouton en fin
 * de rangée se serait arrêté à 17px du bord (le `padding` du cadre) ; la
 * maquette le veut à 10px.
 */
type State = 'default' | 'valid' | 'invalid'

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'number'
    icon?: IconName | (string & {})
    /** Dimensions du pictogramme, relevées dans la maquette. */
    iconWidth?: number
    iconHeight?: number
    /**
     * Débordement du dessin hors de sa boîte, en px par côté.
     *
     * La maquette agrandit chaque pictogramme de champ de **0,6px sur les
     * quatre côtés** (`inset: -4.8% -3.69%` sur 16,25 × 12,5, `-3.33% -4.29%`
     * sur 14 × 18 : le même 0,6px, exprimé en pourcentage de boîtes
     * différentes), pour compenser la marge interne des fichiers SVG. La boîte
     * de mise en page ne bouge pas ; seul le dessin est 8% plus grand.
     */
    iconBleed?: number
    state?: State
    /** Aide affichée sous le champ. Remplacée par `error` si celle-ci est fournie. */
    hint?: string
    /** Message d'erreur : force l'état `invalid` et `aria-invalid`. */
    error?: string
    /** Ajoute le bouton œil de la maquette (mots de passe). */
    revealable?: boolean
    disabled?: boolean
    required?: boolean
    autocomplete?: string
    name?: string
    inputmode?: 'text' | 'numeric' | 'email' | 'tel'
    maxlength?: number
  }>(),
  {
    label: undefined,
    placeholder: undefined,
    type: 'text',
    icon: undefined,
    iconWidth: 20,
    iconHeight: undefined,
    iconBleed: 0,
    state: 'default',
    hint: undefined,
    error: undefined,
    revealable: false,
    disabled: false,
    required: false,
    autocomplete: undefined,
    name: undefined,
    inputmode: undefined,
    maxlength: undefined,
  },
)

const model = defineModel<string>({ default: '' })

const id = useId()
const describedById = computed(() => (props.error || props.hint ? `${id}-desc` : undefined))

const revealed = ref(false)
const effectiveState = computed<State>(() => (props.error ? 'invalid' : props.state))
const inputType = computed(() =>
  props.revealable && revealed.value && props.type === 'password' ? 'text' : props.type,
)

const borderClass: Record<State, string> = {
  default: 'border-border',
  valid: 'border-success',
  invalid: 'border-danger',
}

/** Boîte de mise en page du pictogramme — inchangée quel que soit le débordement. */
const iconBox = computed(() => ({
  width: `${props.iconWidth}px`,
  height: `${props.iconHeight ?? props.iconWidth}px`,
}))
</script>

<template>
  <div class="flex w-full flex-col">
    <label
      v-if="label"
      :for="id"
      class="mb-6 text-base leading-16 font-medium tracking-wide text-navy"
    >
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-danger">*</span>
    </label>

    <div
      :class="[
        'relative flex items-center gap-12 rounded-xl border bg-surface-card px-17 py-15 transition-colors duration-150',
        borderClass[effectiveState],
        revealable ? 'pr-52' : '',
        disabled ? 'opacity-50' : '',
        'focus-within:border-primary',
      ]"
    >
      <!-- Boîte à la taille de la maquette ; le dessin la déborde de
           `iconBleed` sur les quatre côtés. `max-w-none` est indispensable :
           sans lui, le `max-width: 100%` de la base ramènerait le dessin à la
           largeur de sa boîte et annulerait le débordement. -->
      <span v-if="icon" class="relative flex shrink-0 items-center justify-center" :style="iconBox">
        <QIcon
          :name="icon"
          :size="iconWidth + iconBleed * 2"
          :height="(iconHeight ?? iconWidth) + iconBleed * 2"
          class="absolute max-w-none text-primary"
          :style="{ left: `${-iconBleed}px`, top: `${-iconBleed}px` }"
        />
      </span>

      <!-- `px-2 py-1` restitue le retrait interne par défaut des navigateurs
           (`padding: 1px 2px` sur `input`), que le preflight Tailwind supprime
           et sur lequel la maquette s'appuie sans le déclarer. Sans lui, le
           texte saisi commence 2px trop à gauche. -->
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :aria-invalid="effectiveState === 'invalid' || undefined"
        :aria-describedby="describedById"
        class="h-20 min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-xl leading-20 font-medium text-text outline-none placeholder:text-muted"
      >

      <button
        v-if="revealable"
        type="button"
        :aria-label="revealed ? $t('ds.input.hidePassword') : $t('ds.input.showPassword')"
        :aria-pressed="revealed"
        class="absolute top-10 right-10 flex cursor-pointer items-center justify-center rounded-lg p-4 text-muted"
        @click="revealed = !revealed"
      >
        <QIcon :name="revealed ? 'eye-off' : 'ic-eye'" :size="20" />
      </button>

      <QIcon
        v-else-if="effectiveState === 'valid'"
        name="check-circle"
        :size="20"
        class="text-success"
      />
    </div>

    <p
      v-if="error || hint"
      :id="describedById"
      :class="['mt-6 mb-0 text-xs leading-16', error ? 'text-danger' : 'text-muted-2']"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
