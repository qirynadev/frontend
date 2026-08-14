<script setup lang="ts">
/**
 * Contenu éditorial venant du back-office.
 *
 * Le HTML a **déjà été assaini** par les adapters (`core/adapters/sanitize.ts`,
 * liste blanche de balises et d'attributs). Ce composant n'a donc qu'à
 * l'habiller : la typographie de la maquette, appliquée par sélecteurs plutôt
 * qu'en injectant des classes dans du HTML qu'on ne contrôle pas.
 */
withDefaults(
  defineProps<{
    content: string
    /** Réduit la taille du texte pour les encarts secondaires. */
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <div
    :class="['qiryna-rich-text', size === 'sm' ? 'text-sm' : 'text-base', 'text-text']"
    v-html="content"
  />
</template>

<style>
/* Non « scoped » : le HTML injecté n'a pas d'attribut de portée. */
.qiryna-rich-text > * + * {
  margin-top: calc(var(--spacing) * 12);
}

.qiryna-rich-text p {
  margin: 0;
}

.qiryna-rich-text h2,
.qiryna-rich-text h3,
.qiryna-rich-text h4 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-navy);
}

.qiryna-rich-text h2 { font-size: var(--text-3xl); line-height: var(--text-3xl--line-height); }
.qiryna-rich-text h3 { font-size: var(--text-xl); line-height: var(--text-xl--line-height); }
.qiryna-rich-text h4 { font-size: var(--text-base); line-height: var(--text-base--line-height); }

.qiryna-rich-text ul,
.qiryna-rich-text ol {
  margin: 0;
  padding-left: calc(var(--spacing) * 20);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.qiryna-rich-text ul { list-style: disc; }
.qiryna-rich-text ol { list-style: decimal; }

.qiryna-rich-text a {
  color: var(--color-primary-link);
  text-decoration: underline;
}

.qiryna-rich-text strong { font-weight: var(--font-weight-semibold); }

.qiryna-rich-text blockquote {
  margin: 0;
  padding-left: calc(var(--spacing) * 12);
  border-left: 2px solid var(--color-border);
  color: var(--color-muted-2);
}

/* Classes d'alignement de l'éditeur Quill — les seules conservées par l'assainisseur. */
.qiryna-rich-text .ql-align-center { text-align: center; }
.qiryna-rich-text .ql-align-right { text-align: right; }
.qiryna-rich-text .ql-align-justify { text-align: justify; }
</style>
