import type { Article } from '~/core/contracts'

/**
 * Actualités de repli, reprises de `home.html`.
 *
 * `GET /articles` existe et répond, mais renvoie un tableau vide sur la
 * recette. **En attendant que le back-office soit alimenté**, l'accueil affiche
 * les deux cartes de la maquette plutôt qu'un état vide : la page reste
 * conforme au rendu attendu.
 *
 * Dès que l'API renverra des articles, ils prendront la place de ces
 * données — aucun changement de code ne sera nécessaire.
 */
export function fallbackArticles(title: string): Article[] {
  return [
    {
      id: 'placeholder-1',
      slug: '',
      title,
      excerpt: '',
      image: '/img/home-article-thumb.webp',
      readingMinutes: 5,
      publishedAt: null,
    },
    {
      id: 'placeholder-2',
      slug: '',
      title,
      excerpt: '',
      image: '/img/home-article-thumb.webp',
      readingMinutes: 5,
      publishedAt: null,
    },
  ]
}
