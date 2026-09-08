function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1).trimEnd()
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${base}…`
}

/**
 * Accroche carte — aperçu texte brut de `SchoolFormation.description` (HTML
 * complet, affiché tel quel par la modale via `RichText` : voir
 * `[school].vue`, aucun découpage ni restyle n'est fait sur ce HTML, sur
 * demande explicite du 2026-09-08 — la mise en forme reste celle du
 * back-office).
 */
export function summaryFromHtml(html: string, max = 160): string {
  const text = stripHtml(html)
  return text ? truncate(text, max) : ''
}
