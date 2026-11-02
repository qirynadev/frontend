/**
 * Espaces insécables du texte éditorial (demande du 2026-11-01).
 *
 * Sans elles, un nombre comme « 56 715 » se coupe en deux en fin de ligne, et
 * un « : », un « % » ou un « » » se retrouve seul en début de ligne. On ne
 * touche pas aux données du back-office (l'édition y resterait gênée) : la
 * retouche est faite à l'affichage, une fois, avec l'assainissement.
 *
 * Ne transforme que les espaces ordinaires du **texte**, jamais l'intérieur
 * d'une balise. En anglais, ces cas ne se présentent quasiment pas : la règle
 * est sans effet.
 */

const NBSP = ' '

function fixText(text: string): string {
  return text
    // Groupes de chiffres : « 56 715 », « 1 234 567 ».
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`)
    // Avant les signes doubles, le pourcentage et le guillemet fermant.
    .replace(/ (?=[:;?!%»]|&raquo;)/g, NBSP)
    // Après le guillemet ouvrant.
    .replace(/(«|&laquo;) /g, `$1${NBSP}`)
}

/** Applique les espaces insécables aux seuls nœuds texte d'un HTML. */
export function frenchSpacing(html: string): string {
  if (html === '') return html

  return html.replace(/(^|>)([^<]+)/g, (_whole, boundary: string, text: string) => boundary + fixText(text))
}

/**
 * Titres de rubrique : un paragraphe fait **uniquement** de gras (« Cible »,
 * « Admissions », « Frais » dans les formations) est marqué `data-rubrique`,
 * pour que `RichText` le colle au texte qui le suit au lieu de l'en séparer
 * de l'écart entre paragraphes (2026-11-01). Un paragraphe qui commence en
 * gras puis continue en texte n'est pas un titre.
 */
export function markRubriques(html: string): string {
  return html.replace(
    /<p(\s[^>]*)?>(\s*<strong>[^<]+<\/strong>\s*)<\/p>/g,
    (_whole, attributes: string | undefined, content: string) => `<p data-rubrique${attributes ?? ''}>${content}</p>`,
  )
}
