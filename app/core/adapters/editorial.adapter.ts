import type { Article, Orientation } from '../contracts'
import { toSeo } from './common.adapter'
import { asRecord, html, list, num, optionalStr, plainText, str, toIsoDate, toUrl } from './primitives'

/**
 * Offre d'orientation — source `GET /profilage`.
 *
 * Le back-office parle de « catégories » là où la page parle de « ce qui est
 * inclus » : même chose, nom différent. La traduction se fait ici.
 */
export function toOrientation(raw: unknown): Orientation | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  const title = str(source, 'title')
  const description = html(source, 'description')

  const amount = num(source, 'amount', 0)

  return {
    id,
    title,
    description,
    image: toUrl(source.picture) ?? toUrl(source.image),
    features: list(source, 'categories')
      .map((entry) => {
        const category = asRecord(entry)
        return {
          slug: str(category, 'slug'),
          title: str(category, 'title'),
          description: str(category, 'description'),
          icon: toUrl(category.icon),
        }
      })
      .filter((feature) => feature.title !== ''),
    // ⚠️ L'API n'expose aucun prix pour cette offre. `null` plutôt qu'un zéro
    // qui s'afficherait « 0 € » — la page masque alors le bloc tarifaire.
    price: amount > 0
      ? { amount, currency: 'EUR', mode: str(source, 'payment_type') === 'subscription' ? 'subscription' : 'once' }
      : null,
    seo: toSeo(source, title, description),
  }
}

/**
 * Articles de la page d'accueil — source `GET /articles`.
 *
 * L'endpoint existe et répond, mais renvoie un tableau vide sur la recette :
 * la page d'accueil doit donc afficher un état vide, pas une section fantôme.
 */
export function toArticleList(raw: unknown): Article[] {
  return (Array.isArray(raw) ? raw : [])
    .map((entry): Article => {
      const source = asRecord(entry)
      const body = str(source, 'content') || str(source, 'description')
      const words = plainText(body).split(/\s+/).filter(Boolean).length

      return {
        id: str(source, 'id'),
        slug: str(source, 'slug'),
        title: str(source, 'title'),
        excerpt: str(source, 'excerpt') || plainText(body, 120),
        image: toUrl(source.picture) ?? toUrl(source.image) ?? toUrl(source.thumbnail),
        // ~200 mots/minute ; `null` plutôt qu'un « 0 min de lecture ».
        readingMinutes: words > 0 ? Math.max(1, Math.round(words / 200)) : null,
        publishedAt: toIsoDate(optionalStr(source, 'published_at') ?? optionalStr(source, 'created_at')),
      }
    })
    .filter((article) => article.id !== '' && article.title !== '')
}
