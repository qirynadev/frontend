/**
 * Alias d'URL des destinations.
 *
 * Les maquettes emploient `angleterre` et `usa` là où le catalogue API dit
 * `royaume-uni` et `etats-unis` : les deux écritures restent des URL valides,
 * et cette table ramène à celle que connaît l'API.
 *
 * Ce fichier est tout ce qui subsiste de `desktop-destination-country.ts`,
 * supprimé le 2026-09-20 avec les écrans desktop pays par pays : un seul
 * écran les sert désormais tous (`desktop-pages/destination.vue`), alimenté
 * par l'API.
 */
const ALIAS_VERS_API: Record<string, string> = {
  'canada': 'canada',
  'angleterre': 'royaume-uni',
  'royaume-uni': 'royaume-uni',
  'usa': 'etats-unis',
  'etats-unis': 'etats-unis',
}

/** Slug catalogue pour charger la destination (alias de maquette inclus). */
export function resolveDestinationApiSlug(routeSlug: string): string {
  return ALIAS_VERS_API[routeSlug] ?? routeSlug
}
