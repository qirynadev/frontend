export interface LegalSection {
  title: string
  html: string
}

export interface LegalDocument {
  /** Date extraite du préambule (« Dernière mise à jour : … »). */
  updated: string | null
  /** Paragraphes avant le premier titre, hors la ligne de mise à jour. */
  leadHtml: string
  sections: LegalSection[]
}

const HEADING_RE = /<(h[23])>([\s\S]*?)<\/\1>/gi
const EMPTY_P_RE = /<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi
const UPDATED_RE = /(?:derni[eè]re mise [aà] jour|last updated)\s*:?\s*(.+)$/i

function stripEmpty(html: string): string {
  return html.replace(EMPTY_P_RE, '').trim()
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractUpdated(text: string): string | null {
  const match = text.match(UPDATED_RE)
  return match?.[1]?.replace(/\.$/, '').trim() || null
}

function isDocTitle(title: string, pageTitle: string): boolean {
  const t = title.toLowerCase()
  if (/^politique relative/.test(t)) return true
  if (pageTitle && t === pageTitle.toLowerCase()) return true
  return false
}

/**
 * Découpe le HTML administré (h2 / h3) en cartes lisibles.
 * Le premier h2-titre du document cookies (suivi de la date) est ignoré.
 */
export function splitLegalHtml(html: string, pageTitle = ''): LegalDocument {
  const headings: { index: number, end: number, title: string }[] = []
  const re = new RegExp(HEADING_RE.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(html))) {
    headings.push({
      index: match.index,
      end: match.index + match[0].length,
      title: stripTags(match[2] ?? ''),
    })
  }

  const premier = headings[0]
  const leadRaw = premier ? html.slice(0, premier.index) : html
  let leadHtml = stripEmpty(leadRaw)
  let updated = extractUpdated(stripTags(leadHtml))

  if (updated && !stripTags(leadHtml).replace(UPDATED_RE, '').trim()) {
    leadHtml = ''
  }

  const sections: LegalSection[] = []
  for (let i = 0; i < headings.length; i++) {
    const courant = headings[i]!
    const suivant = headings[i + 1]
    const body = stripEmpty(html.slice(courant.end, suivant ? suivant.index : html.length))
    const title = courant.title
    const bodyText = stripTags(body)

    if (!updated) updated = extractUpdated(bodyText)

    if (isDocTitle(title, pageTitle)) {
      const withoutDate = bodyText.replace(UPDATED_RE, '').trim()
      if (!withoutDate) continue
    }

    if (!title && !body) continue
    sections.push({ title, html: body })
  }

  return { updated, leadHtml, sections }
}
