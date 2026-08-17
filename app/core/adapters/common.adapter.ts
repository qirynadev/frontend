import type { Country, FeatureItem, Menu, MenuEntry, MenuSection, Price, SeoMeta, SiteSettings, SocialLink } from '../contracts'
import { asArray, asRecord, bool, list, num, optionalStr, plainText, str, toUrl } from './primitives'

/**
 * Pays.
 *
 * L'API est incohérente : une destination porte `{ id, name, iso_alpha_2 }`,
 * une école porte `{ name }` seul. Le domaine expose toujours la même forme.
 */
export function toCountry(raw: unknown, flagBase?: string): Country {
  const source = asRecord(raw)
  const code = str(source, 'iso_alpha_2') || str(source, 'code') || str(source, 'iso')
  const normalized = code === '' ? null : code.toUpperCase()

  return {
    id: optionalStr(source, 'id'),
    name: str(source, 'name'),
    code: normalized,
    // Le drapeau fourni tel quel l'emporte (les langues en ont un) ; sinon on
    // le déduit du code ISO, quand l'appelant nous a donné l'hôte de l'API.
    flag: toUrl(source.country_flag) ?? toUrl(source.flag) ?? flagUrl(normalized, flagBase),
  }
}

/**
 * URL du drapeau SVG servi par le back-office.
 *
 * Le motif est vérifié sur les six destinations du catalogue :
 * `https://admin.stage.qiryna.com/vendor/blade-flags/country-fr.svg`.
 */
export function flagUrl(code: string | null, base?: string): string | null {
  if (!code || !base) return null
  return `${base.replace(/\/api\/?$/, '').replace(/\/$/, '')}/vendor/blade-flags/country-${code.toLowerCase()}.svg`
}

/**
 * Prix.
 *
 * `amount` est un nombre d'euros, jamais des centimes — vérifié sur les huit
 * formules de recette (490, 1200, 990, 1499…).
 */
export function toPrice(raw: unknown): Price {
  const source = asRecord(raw)
  const mode = str(source, 'payment_type').toLowerCase()
  return {
    amount: num(source, 'amount', 0),
    currency: 'EUR',
    mode: mode === 'subscription' ? 'subscription' : 'once',
  }
}

/**
 * Élément « ce qui est inclus ».
 *
 * Les entrées entièrement vides sont écartées : l'API en produit
 * systématiquement une par enregistrement sans contenu.
 */
export function toFeatureItems(raw: unknown): FeatureItem[] {
  return asArray(raw)
    .map((entry) => {
      const source = asRecord(entry)
      return {
        title: str(source, 'title'),
        description: str(source, 'description'),
        icon: toUrl(source.icon),
        included: bool(source, 'included', true),
      }
    })
    .filter((item) => item.title !== '' || item.description !== '')
}

/**
 * Métadonnées SEO.
 *
 * Le back-office laisse `seo_title` / `seo_description` vides dans la majorité
 * des cas : on retombe sur le titre éditorial et sur les 160 premiers caractères
 * du contenu, débarrassés de leur HTML.
 */
export function toSeo(raw: unknown, fallbackTitle: string, fallbackHtml: string): SeoMeta {
  const source = asRecord(raw)
  return {
    title: str(source, 'seo_title') || fallbackTitle,
    description: str(source, 'seo_description') || plainText(fallbackHtml, 160),
    image: toUrl(source.og_image) ?? toUrl(source.picture) ?? toUrl(source.image),
  }
}

function toMenuEntry(raw: unknown): MenuEntry {
  const source = asRecord(raw)
  return {
    // Le menu MBA indexe ses entrées par entier là où le reste utilise des UUID.
    id: str(source, 'id'),
    title: str(source, 'title'),
    slug: str(source, 'slug'),
    badge: optionalStr(source, 'badge'),
  }
}

function toMenuSection(raw: unknown): MenuSection {
  const source = asRecord(raw)
  return {
    label: str(source, 'menu'),
    entries: list(source, 'sub_menus')
      .map(toMenuEntry)
      .filter((entry) => entry.slug !== ''),
  }
}

/** `profiling` n'a pas de `sub_menus` dans la réponse actuelle : la section reste vide. */
export function toMenu(raw: unknown): Menu {
  const source = asRecord(raw)
  return {
    destinations: toMenuSection(source.destinations),
    courses: toMenuSection(source.courses),
    living: toMenuSection(source.living),
    mba: toMenuSection(source.mba),
    profiling: toMenuSection(source.profiling),
  }
}

function toSocialLink(raw: unknown): SocialLink {
  const source = asRecord(raw)
  return {
    // L'API mélange `facebook` et `Instagram` : on normalise pour pouvoir
    // choisir une icône par nom sans se soucier de la casse.
    name: str(source, 'name').toLowerCase(),
    url: str(source, 'url'),
  }
}

export function toSiteSettings(raw: unknown): SiteSettings {
  const source = asRecord(raw)
  return {
    name: str(source, 'site.name', 'Qiryna'),
    description: str(source, 'site.description'),
    email: str(source, 'site.email'),
    phone: str(source, 'site.phone'),
    stripePublicKey: optionalStr(source, 'site.stripe_pk_api_key'),
    analyticsId: optionalStr(source, 'site.ga_id'),
    socials: list(source, 'socials')
      .map(toSocialLink)
      .filter((social) => social.url !== ''),
    locales: list(source, 'languages')
      .map((entry) => {
        const locale = asRecord(entry)
        return { code: str(locale, 'value'), label: str(locale, 'label') }
      })
      .filter((locale) => locale.code !== ''),
  }
}
