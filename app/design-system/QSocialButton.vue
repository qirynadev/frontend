<script setup lang="ts">
/**
 * Bouton de connexion tierce.
 *
 * Les marques ci-dessous sont des **identités visuelles**, pas des couleurs de
 * thème : elles ne passent volontairement pas par les tokens et ne doivent pas
 * être retouchées. C'est la seule exception à la règle « aucune couleur en dur ».
 */

type Provider = 'google' | 'facebook' | 'apple' | 'linkedin'
type Layout = 'icon' | 'icon-label' | 'stacked'

withDefaults(
  defineProps<{
    provider: Provider
    /** `icon` : logo seul · `icon-label` : logo + nom · `stacked` : deux lignes. */
    layout?: Layout
    /** Libellé affiché (déjà traduit par l'appelant). */
    label?: string
    /** Première ligne du mode `stacked` (« Continuer avec »). */
    labelTop?: string
    disabled?: boolean
    loading?: boolean
  }>(),
  { layout: 'icon-label', label: undefined, labelTop: undefined, disabled: false, loading: false },
)

const providerName: Record<Provider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  linkedin: 'LinkedIn',
}

const marks: Record<Provider, string> = {
  google:
    '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>',
  facebook:
    '<path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.3V9h2.3V7.01c0-2.27 1.35-3.52 3.41-3.52.99 0 2.02.17 2.02.17v2.22h-1.14c-1.12 0-1.47.7-1.47 1.41V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9z"/>',
  apple:
    '<path fill="#000" d="M13.4 9.55c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-1.4 2.43-.36 6.03 1.01 8 .67.96 1.47 2.04 2.52 2 1.01-.04 1.39-.65 2.61-.65s1.57.65 2.64.63c1.09-.02 1.78-.98 2.45-1.95.77-1.12 1.09-2.2 1.1-2.26-.02-.01-2.12-.81-2.15-3.19zM11.4 3.62c.56-.68.93-1.62.83-2.56-.8.03-1.77.53-2.35 1.2-.52.6-.97 1.56-.85 2.48.89.07 1.8-.45 2.37-1.12z"/>',
  // Glyphe officiel, dessiné dans une grille 24 : ramené à la boîte 18 du
  // composant par une mise à l'échelle, plutôt qu'en redessinant le tracé.
  linkedin:
    '<g transform="scale(0.75)"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></g>',
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :aria-label="label ?? providerName[provider]"
    :class="[
      'inline-flex w-full min-w-0 cursor-pointer items-center justify-center rounded-xl border border-border-slate bg-white transition-colors duration-150 hover:bg-surface',
      // `icon-label` reprend `.social-btn--name` des écrans d'authentification,
      // resserrement compris (`@media (max-width: 360px)` de `app.css`), les
      // deux seuls écrans qui l'emploient s'accordant sur ces valeurs.
      layout === 'stacked'
        ? 'flex-col gap-2 px-8 py-13'
        : 'gap-8 px-8 py-13 max-3xs:gap-6 max-3xs:px-6 max-3xs:py-12',
      disabled || loading ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <QSpinner v-if="loading" size="sm" class="text-navy" />
    <svg
      v-else
      width="16"
      height="16"
      viewBox="0 0 18 18"
      class="shrink-0"
      aria-hidden="true"
      focusable="false"
      v-html="marks[provider]"
    />

    <template v-if="layout === 'stacked'">
      <span class="text-md leading-16 font-medium whitespace-nowrap text-navy">{{ labelTop }}</span>
      <span class="text-md leading-16 font-semibold whitespace-nowrap text-navy">
        {{ label ?? providerName[provider] }}
      </span>
    </template>
    <span
      v-else-if="layout === 'icon-label'"
      class="text-md leading-16 font-semibold whitespace-nowrap text-navy max-3xs:text-sm"
    >
      {{ label ?? providerName[provider] }}
    </span>
  </button>
</template>
