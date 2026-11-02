/**
 * Domaines ouverts aux moteurs de recherche. Écrits ici et non déduits de
 * `NUXT_PUBLIC_SITE_URL` : danube renseignait son propre hôte et se déclarait donc
 * indexable. Tout autre domaine (my, danube, adresse de test) reste hors des index.
 */
const INDEXABLE_HOSTS = new Set(['qiryna.com', 'www.qiryna.com'])

export function isIndexableHost(host: string): boolean {
  return INDEXABLE_HOSTS.has(host.toLowerCase().replace(/:\d+$/, ''))
}
