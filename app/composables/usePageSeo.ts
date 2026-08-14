import type { SeoMeta } from '~/core/contracts'

/**
 * Métadonnées d'une page publique — LOT 6 (SEO).
 *
 * Gère automatiquement :
 * - `title`, `description`, `ogTitle`, `ogDescription`, `ogImage` (URL absolue pour WhatsApp/socials), `ogType`, `twitterCard`
 * - `canonical` et balises `hreflang` fr / en (avec fallback si slugs non renseignés par l'API)
 * - `robots` (`noindex, nofollow` si spécifié)
 */
export interface PageSeoInput {
  title: string
  description?: string
  image?: string | null
  /** `noindex` pour les écrans qui n'ont rien à faire dans un index. */
  noindex?: boolean
  /** Type Open Graph. `website` par défaut. */
  type?: 'website' | 'article'
  /** Carte de slugs traduits par locale. Ex: { fr: "france", en: "france" } */
  slugs?: Record<string, string>
}

export function usePageSeo(input: MaybeRefOrGetter<PageSeoInput>): void {
  const site = 'Qiryna'
  const requestUrl = useRequestURL()
  const route = useRoute()
  const { locales } = useI18n()

  const absoluteImageUrl = computed(() => {
    const rawImage = toValue(input).image || '/img/logo.webp'
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage
    }
    const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`
    return `${requestUrl.origin}${cleanPath}`
  })

  useSeoMeta({
    title: () => {
      const { title } = toValue(input)
      return title.includes(site) ? title : `${title} — ${site}`
    },
    description: () => toValue(input).description || undefined,
    ogTitle: () => {
      const { title } = toValue(input)
      return title.includes(site) ? title : `${title} — ${site}`
    },
    ogDescription: () => toValue(input).description || undefined,
    ogImage: () => absoluteImageUrl.value,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogType: () => toValue(input).type ?? 'website',
    ogSiteName: site,
    ogUrl: () => requestUrl.href,
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(input).title,
    twitterDescription: () => toValue(input).description || undefined,
    twitterImage: () => absoluteImageUrl.value,
    robots: () => (toValue(input).noindex ? 'noindex, nofollow' : 'index, follow'),
  })

  // Étape 6.2 : Canonical et Alternates (hreflang)
  useHead(() => {
    const seoVal = toValue(input)
    if (seoVal.noindex) return {}

    const links: Array<{ rel: string; hreflang?: string; href: string }> = []
    const canonicalUrl = requestUrl.href.split('?')[0] ?? requestUrl.href
    links.push({ rel: 'canonical', href: canonicalUrl })

    // Balises hreflang
    const currentLocales = Array.isArray(locales.value) ? locales.value : []
    for (const loc of currentLocales) {
      const code = typeof loc === 'string' ? loc : loc.code
      let targetHref = canonicalUrl

      if (seoVal.slugs && seoVal.slugs[code]) {
        const translatedSlug = seoVal.slugs[code]!
        targetHref = canonicalUrl.replace(route.params.slug as string, translatedSlug)
      }

      links.push({
        rel: 'alternate',
        hreflang: code,
        href: targetHref,
      })
    }

    return { link: links }
  })
}

/** Raccourci quand la donnée porte déjà un `SeoMeta`. */
export function useContractSeo(
  seo: MaybeRefOrGetter<SeoMeta | null | undefined>,
  fallbackTitle: string,
  slugs?: Record<string, string>,
): void {
  usePageSeo(() => {
    const value = toValue(seo)
    return {
      title: value?.title || fallbackTitle,
      description: value?.description,
      image: value?.image,
      slugs,
    }
  })
}
