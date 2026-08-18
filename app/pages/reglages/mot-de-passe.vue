<script setup lang="ts">
/**
 * Réglages — Mot de passe ← `maquette/pwa/pages/reglages-mdp.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | encart | `.rm-protect` `min-height: 86px`, `padding: 17px 9px`, icône 44×44 |
 * | carte | `.rm-card` `margin-top: 20px`, `padding: 16px`, ombre `0 0 3.5px` |
 * | champ | `.rm-input` `padding: 7px`, filet `#e2e8f0` · icône 36×36 · saisie 13,5px |
 * | œil | `.rm-eye` positionné à `right: 10px`, icône 20×20 opacité 0,7 |
 * | robustesse | `margin-top: 20px` via `.rm-field + .rm-strength` · 6 barres de 6px en grille, `gap: 6px` · 4 règles en deux colonnes |
 * | conseil | `.rm-tip` `min-height: 61px`, `padding: 8px 9px` |
 *
 * Les quatre règles et la jauge sont évaluées à la saisie, comme dans la
 * maquette. Le formulaire n'appelle aucun endpoint : le changement de mot de
 * passe n'est pas exposé par l'API (LOT-5.md). Le bouton reste donc inerte,
 * à brancher quand la route existera.
 */
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

const current = ref('')
const next = ref('')
const confirm = ref('')
const shown = ref<Record<string, boolean>>({ current: false, next: false, confirm: false })

/** Les quatre règles affichées sous la jauge. */
const rules = computed(() => [
  { id: 'length', labelKey: 'settingsPassword.ruleLength', ok: next.value.length >= 8 },
  { id: 'upper', labelKey: 'settingsPassword.ruleUpper', ok: /[A-Z]/.test(next.value) },
  { id: 'digit', labelKey: 'settingsPassword.ruleDigit', ok: /\d/.test(next.value) },
  { id: 'symbol', labelKey: 'settingsPassword.ruleSymbol', ok: /[^A-Za-z0-9]/.test(next.value) },
])

/** Six barres : une minuscule et la longueur ≥ 12 s'ajoutent aux quatre règles. */
const score = computed(() => {
  if (!next.value) return 0
  const checks = [
    next.value.length >= 8,
    /[A-Z]/.test(next.value),
    /\d/.test(next.value),
    /[^A-Za-z0-9]/.test(next.value),
    /[a-z]/.test(next.value),
    next.value.length >= 12,
  ]
  return checks.filter(Boolean).length
})

const level = computed<'weak' | 'medium' | 'strong'>(() =>
  score.value <= 2 ? 'weak' : score.value <= 4 ? 'medium' : 'strong')

const levelClass = { weak: 'text-rm-weak', medium: 'text-rm-medium', strong: 'text-success' }
const barClass = { weak: 'bg-rm-weak', medium: 'bg-rm-medium', strong: 'bg-success' }
const levelKey = { weak: 'settingsPassword.levelWeak', medium: 'settingsPassword.levelMedium', strong: 'settingsPassword.levelStrong' }

/** `null` tant que la confirmation est vide : la maquette masque la ligne. */
const match = computed<boolean | null>(() => (confirm.value ? confirm.value === next.value : null))

usePageSeo(() => ({
  title: t('settingsPassword.seoTitle'),
  description: t('settingsPassword.seoDescription'),
  noindex: true,
}))

const fields = [
  { id: 'current', model: current, labelKey: 'settingsPassword.currentLabel', placeholderKey: 'settingsPassword.currentPlaceholder', autocomplete: 'current-password' },
  { id: 'next', model: next, labelKey: 'settingsPassword.newLabel', placeholderKey: 'settingsPassword.newPlaceholder', autocomplete: 'new-password' },
]
</script>

<template>
  <div class="page-rm flex flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="rm-main flex w-full max-w-full flex-col box-border">
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" />

      <section class="rm-intro mb-16 w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsPassword.title') }}
        </h1>
        <p class="m-0 mt-4 text-lg leading-[22.75px] font-normal text-text">
          {{ $t('settingsPassword.intro') }}
        </p>
      </section>

      <aside class="rm-protect flex min-h-86 w-full items-start gap-11 rounded-xl bg-surface-2 px-9 py-17 box-border">
        <span class="rm-protect-icon size-44 shrink-0 overflow-hidden">
          <QIcon name="ic-rm-shield" :size="44" />
        </span>
        <div class="rm-protect-copy min-w-0 flex-1">
          <p class="rm-protect-title m-0 text-base leading-20 font-bold text-text">{{ $t('settingsPassword.protectTitle') }}</p>
          <p class="rm-protect-desc m-0 mt-4 text-sm leading-16 font-normal text-text">{{ $t('settingsPassword.protectDesc') }}</p>
        </div>
      </aside>

      <form class="rm-card mt-20 flex w-full flex-col rounded-xl bg-white p-16 shadow-card box-border" @submit.prevent>
        <label
          v-for="(field, index) in fields"
          :key="field.id"
          :class="['rm-field flex w-full flex-col', index > 0 ? 'mt-20' : '']"
        >
          <span class="rm-label text-xl leading-21 font-medium text-navy-2">{{ $t(field.labelKey) }}</span>
          <span class="rm-input relative mt-6 flex w-full items-center rounded-xl border border-border-slate bg-white p-7 box-border">
            <span class="rm-input-icon mr-10 size-36 shrink-0 overflow-hidden">
              <QIcon name="ic-rm-lock" :size="36" />
            </span>
            <input
              v-model="field.model.value"
              :type="shown[field.id] ? 'text' : 'password'"
              :placeholder="$t(field.placeholderKey)"
              :autocomplete="field.autocomplete"
              class="min-w-0 flex-1 border-0 bg-transparent pr-28 text-exact-13-5 leading-20 font-normal text-text outline-0 placeholder:text-rm-placeholder"
            >
            <button
              type="button"
              class="rm-eye absolute top-1/2 right-10 flex size-24 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
              :aria-label="$t('settingsPassword.togglePassword')"
              @click="shown[field.id] = !shown[field.id]"
            >
              <img src="/img/icons/ic-eye.svg" alt="" width="20" height="20" class="block size-20 object-contain opacity-70">
            </button>
          </span>
        </label>

        <div class="rm-strength mt-20 w-full">
          <p class="rm-strength-label m-0 text-base leading-18 font-medium text-slate">
            {{ $t('settingsPassword.strengthLabel') }}
            <strong :class="['font-bold', levelClass[level]]">{{ $t(levelKey[level]) }}</strong>
          </p>
          <div class="rm-strength-bars mt-8 grid w-full grid-cols-6 gap-6" aria-hidden="true">
            <span
              v-for="bar in 6"
              :key="bar"
              :class="['rm-strength-bar h-6 rounded-full', bar <= score ? barClass[level] : 'bg-border-soft']"
            />
          </div>
          <ul class="rm-rules mt-16 mr-0 mb-0 ml-0 grid list-none grid-cols-2 gap-x-8 gap-y-6 p-0">
            <li
              v-for="rule in rules"
              :key="rule.id"
              :class="['flex items-start gap-6 text-exact-11-5 font-medium', rule.ok ? 'is-ok text-success' : 'text-slate']"
            >
              <span
                :class="[
                  'rm-rule-dot mt-[1.5px] size-14 shrink-0 rounded-full border box-border',
                  rule.ok ? 'border-success bg-success' : 'border-rm-rule-dot-border bg-white',
                ]"
              />
              {{ $t(rule.labelKey) }}
            </li>
          </ul>
        </div>

        <label class="rm-field mt-20 flex w-full flex-col">
          <span class="rm-label text-xl leading-21 font-medium text-navy-2">{{ $t('settingsPassword.confirmLabel') }}</span>
          <span class="rm-input relative mt-6 flex w-full items-center rounded-xl border border-border-slate bg-white p-7 box-border">
            <span class="rm-input-icon mr-10 size-36 shrink-0 overflow-hidden">
              <QIcon name="ic-rm-lock" :size="36" />
            </span>
            <input
              v-model="confirm"
              :type="shown.confirm ? 'text' : 'password'"
              :placeholder="$t('settingsPassword.confirmPlaceholder')"
              autocomplete="new-password"
              class="min-w-0 flex-1 border-0 bg-transparent pr-28 text-exact-13-5 leading-20 font-normal text-text outline-0 placeholder:text-rm-placeholder"
            >
            <button
              type="button"
              class="rm-eye absolute top-1/2 right-10 flex size-24 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
              :aria-label="$t('settingsPassword.togglePassword')"
              @click="shown.confirm = !shown.confirm"
            >
              <img src="/img/icons/ic-eye.svg" alt="" width="20" height="20" class="block size-20 object-contain opacity-70">
            </button>
          </span>
          <!-- Toujours rendue, même vide : `.rm-match { display: block }` de la
               maquette l'emporte sur son attribut `hidden`, et sa marge de 8px
               fait donc partie de la hauteur du champ. -->
          <span
            :class="[
              'rm-match mt-8 block text-base leading-18 font-medium',
              match === null ? '' : match ? 'is-ok text-success' : 'is-error text-rm-weak',
            ]"
          >{{ match === null ? '' : match ? $t('settingsPassword.matchOk') : $t('settingsPassword.matchError') }}</span>
        </label>

        <aside class="rm-tip mt-20 flex min-h-61 w-full items-center gap-11 rounded-xl bg-surface-2 px-9 py-8 box-border">
          <span class="rm-tip-icon size-44 shrink-0 overflow-hidden">
            <QIcon name="ic-rm-tip" :size="44" />
          </span>
          <p class="m-0 min-w-0 flex-1 text-sm leading-16 font-normal text-text">{{ $t('settingsPassword.tipText') }}</p>
        </aside>

        <button
          type="submit"
          class="rm-cta mt-20 flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-rl-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white box-border"
        >
          {{ $t('settingsPassword.save') }}
        </button>
      </form>
    </div>
  </div>
</template>
