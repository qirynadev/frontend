/**
 * Contenu administrable d'une page du site (2026-10-14) : pages langue et
 * logement, réglées dans la fiche de la langue ou du pays du back-office
 * (`page_texts` traduit, `icons` et `hero_image` non traduits).
 *
 * Tout est facultatif : une valeur `null` ou absente garde le texte des
 * traductions, l'icône ou la photo de la maquette. La forme exacte de chaque
 * page est fixée côté back-office (`PageContent::SCHEMAS`) ; le site la lit
 * par clé avec `pageText()`, `pageIcon()`… (`app/utils/page-content.ts`).
 */
export type PageTextBlock = Record<string, string | null>

export type PageTextValue = string | null | (string | null)[] | PageTextBlock[]

export interface PageContent {
  texts: Record<string, PageTextValue>
  /** URL de l'icône choisie par emplacement, `null` = icône de la maquette. */
  icons: Record<string, (string | null)[]>
  /** Photo principale de la page, `null` = photo de la maquette. */
  heroImage: string | null
}
