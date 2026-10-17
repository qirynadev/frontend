import { defineStore } from 'pinia'

export type ThemePreference = 'clair' | 'sombre' | 'systeme'

/**
 * Préférence d'apparence (clair / sombre / système) — écran
 * `reglages/theme.vue`.
 *
 * Purement locale, jamais liée à la session : un visiteur non connecté peut
 * la choisir, elle survit à une déconnexion. `useCookie` plutôt que
 * `localStorage` pour que le **rendu serveur** connaisse déjà la préférence —
 * sans ça, la première peinture serait toujours en clair, puis basculerait
 * après hydratation : un flash visible à chaque chargement.
 *
 * **Pas de `default` sur `useCookie`** (corrigé le 2026-09-04) : avec
 * `default: () => 'systeme'`, Nuxt réécrit le cookie dès qu'un rendu serveur
 * ne le trouve pas — y compris pour des requêtes qui n'en portent
 * légitimement pas la trace (préchargement de payload d'un `<NuxtLink>`,
 * par ex.), ce qui écrasait silencieusement un choix « sombre » déjà
 * enregistré quelques secondes plus tôt (constaté en direct). Le repli sur
 * « système » se fait dans ce module, jamais dans le cookie lui-même — la
 * seule écriture reste `preference =`, sur clic explicite du bouton
 * Enregistrer.
 */
export const useThemeStore = defineStore('theme', () => {
  const cookie = useCookie<ThemePreference | undefined>('qiryna_theme', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const preference = computed<ThemePreference>({
    get: () => cookie.value ?? 'systeme',
    set: (value) => { cookie.value = value },
  })

  /**
   * Attribut `data-theme` à poser sur `<html>` (voir `app.vue`).
   *
   * `undefined` pour « système » : aucun attribut n'est posé, et c'est la
   * media query `prefers-color-scheme` de `main.css` qui décide seule. Un
   * choix explicite (clair/sombre) doit au contraire toujours l'emporter sur
   * la préférence système, jamais l'inverse — voir le commentaire de la
   * palette sombre dans `main.css`.
   */
  const htmlAttr = computed<'dark' | 'light' | undefined>(() => {
    if (preference.value === 'sombre') return 'dark'
    if (preference.value === 'clair') return 'light'
    return undefined
  })

  return { preference, htmlAttr }
})
