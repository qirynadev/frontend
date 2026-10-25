/**
 * Cache navigateur des données publiques du site (`/api/bff/...`).
 *
 * `no-cache` (2026-10-25) : le navigateur redemande à chaque fois, et le
 * serveur répond depuis sa mémoire. Avant, il gardait ces réponses 1 à
 * 5 minutes (`max-age`), si bien qu'une modification du back-office restait
 * invisible pour un visiteur déjà passé, même une fois le cache serveur vidé
 * par le signal du back-office (`server/utils/content-version.ts`).
 */
export const PUBLIC_CONTENT_CACHE = 'public, no-cache'
