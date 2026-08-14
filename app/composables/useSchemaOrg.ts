/**
 * Schema.org JSON-LD — LOT 6 (Étape 6.3).
 *
 * Permet d'injecter des données structurées pour les moteurs de recherche :
 * - `EducationalOrganization` (Fiches écoles)
 * - `Offer` (Formules de cours, offres d'orientation)
 * - `FAQPage` (Foire aux questions)
 * - `WebSite` & `Organization` (Page d'accueil)
 */

export function useSchemaOrg(schema: MaybeRefOrGetter<Record<string, unknown> | null | undefined>): void {
  useHead(() => {
    const val = toValue(schema)
    // Forme de retour constante (`{ script: [] }`), jamais `{}` : l'union de
    // types que TS déduirait sinon ne satisfait plus `UseHeadInput`.
    if (!val) return { script: [] }

    return {
      script: [
        {
          type: 'application/ld+json',
          // `innerHTML` est la clé qu'unhead reconnaît pour du contenu brut de
          // balise ; `children` ne fait pas partie de son type `Script`.
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            ...val,
          }),
        },
      ],
    }
  })
}

/** Helper pour fiche école : EducationalOrganization */
export function useSchoolSchemaOrg(school: MaybeRefOrGetter<{
  title: string
  description?: string
  presentation?: string
  image?: string | null
  logo?: string | null
  city?: string
  country?: { name?: string }
  foundedYear?: number | null
} | null | undefined>): void {
  const requestUrl = useRequestURL()

  useSchemaOrg(() => {
    const s = toValue(school)
    if (!s) return null

    return {
      '@type': 'EducationalOrganization',
      name: s.title,
      description: s.presentation || s.description || undefined,
      url: requestUrl.href,
      image: s.image || undefined,
      logo: s.logo || undefined,
      address: (s.city || s.country?.name)
        ? {
            '@type': 'PostalAddress',
            addressLocality: s.city || undefined,
            addressCountry: s.country?.name || undefined,
          }
        : undefined,
      foundingDate: s.foundedYear ? String(s.foundedYear) : undefined,
    }
  })
}

/** Helper pour formule / offre : Offer */
export function useOfferSchemaOrg(offer: MaybeRefOrGetter<{
  title: string
  description?: string
  price?: { amount: number; currency: string } | null
} | null | undefined>): void {
  const requestUrl = useRequestURL()

  useSchemaOrg(() => {
    const o = toValue(offer)
    if (!o) return null

    return {
      '@type': 'Offer',
      name: o.title,
      description: o.description || undefined,
      url: requestUrl.href,
      price: o.price ? String(o.price.amount) : undefined,
      priceCurrency: o.price?.currency || 'EUR',
      availability: 'https://schema.org/InStock',
    }
  })
}
