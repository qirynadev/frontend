export interface FormationSection {
  label: string
  /** HTML du paragraphe (sans le libellé de section). */
  content: string
}

export interface ParsedFormationContent {
  /**
   * Accroche courte pour la carte — paragraphe descriptif, jamais la
   * rubrique « Cible » (miroir de `f.desc` dans `schools.js`).
   */
  summary: string
  /** Rubriques structurées pour la modale (Cible, Programmes…). */
  sections: FormationSection[]
  /**
   * Paragraphes libres hors rubriques — le « détail » de la formation
   * (souvent le corps descriptif après « Cible ? » côté back-office).
   */
  bodyHtml: string
}

const MODAL_SECTION_ORDER = ['Cible', 'Programmes', 'Frais', 'Admission', 'Débouchés'] as const

const SECTION_LABEL_RE = /^(cible|programmes|frais|admission|d[ée]bouch[ée]s)\b/i

function normalizeLabel(raw: string): string {
  return raw.trim().replace(/\?+$/, '').trim()
}

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

function paragraphBlocks(html: string): string[] {
  return html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? []
}

/**
 * Rubrique structurée = le `<strong>` ouvre le paragraphe et porte un
 * libellé connu (`Cible ?`, `Programmes ?`…). Un `<strong>` d'emphase
 * au milieu d'une phrase (ex. « Le Global BBA ») n'en est pas une.
 */
function sectionLabelFromBlock(block: string): string | null {
  const inner = block.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '').trim()
  const match = inner.match(/^<strong>\s*([^<]+?)\s*<\/strong>/i)
  if (!match) return null
  const label = normalizeLabel(match[1])
  if (!SECTION_LABEL_RE.test(label)) return null
  return label
}

function sectionContentFromBlock(block: string): string {
  const inner = block
    .replace(/^<p[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .replace(/^<strong>\s*[^<]+?\s*<\/strong>\s*(?:&nbsp;|\u00a0|\s)*/i, '')
    .trim()
  return inner.startsWith('<') ? inner : `<p>${inner}</p>`
}

function extractSections(html: string): FormationSection[] {
  const sections: FormationSection[] = []

  for (const block of paragraphBlocks(html)) {
    const label = sectionLabelFromBlock(block)
    if (!label) continue
    const content = sectionContentFromBlock(block)
    if (stripHtml(content)) sections.push({ label, content })
  }

  return sections
}

function extractBodyHtml(html: string): string {
  const blocks = paragraphBlocks(html)
  if (blocks.length === 0) {
    // Pas de `<p>` : tout le HTML libre sauf s'il n'est qu'une rubrique.
    return sectionLabelFromBlock(`<p>${html}</p>`) ? '' : html.trim()
  }

  return blocks.filter((block) => !sectionLabelFromBlock(block)).join('')
}

function orderSections(sections: FormationSection[]): FormationSection[] {
  const used = new Set<FormationSection>()
  const ordered: FormationSection[] = []

  for (const name of MODAL_SECTION_ORDER) {
    const match = sections.find((section) => section.label.toLowerCase() === name.toLowerCase())
    if (match) {
      ordered.push(match)
      used.add(match)
    }
  }

  for (const section of sections) {
    if (!used.has(section)) ordered.push(section)
  }

  return ordered
}

/** Premier paragraphe libre (hors rubriques) → accroche carte. */
function summaryFromBody(bodyHtml: string): string {
  if (!bodyHtml) return ''
  const first = paragraphBlocks(bodyHtml)[0] ?? bodyHtml
  const text = stripHtml(first)
  return text ? truncate(text, 160) : ''
}

function summaryFromSections(sections: FormationSection[]): string {
  const programmes = sections.find((s) => s.label.toLowerCase() === 'programmes')
  if (programmes) return truncate(stripHtml(programmes.content), 160)

  const fallback = sections.find((s) => s.label.toLowerCase() !== 'cible')
  if (fallback) return truncate(stripHtml(fallback.content), 160)

  // Pas de repli sur « Cible » : réservée à la modale.
  return ''
}

/**
 * Découpe la description HTML d'une formation (back-office) en accroche
 * carte + rubriques / corps de modale — miroir de `f.desc` + `f.detail`
 * (`schools.js` / `buildFormationDetailHtml`).
 */
export function parseFormationDescription(html: string): ParsedFormationContent {
  const trimmed = html.trim()
  if (!trimmed) return { summary: '', sections: [], bodyHtml: '' }

  const sections = orderSections(extractSections(trimmed))
  const bodyHtml = extractBodyHtml(trimmed)
  const summary = summaryFromBody(bodyHtml) || summaryFromSections(sections)

  return { summary, sections, bodyHtml }
}
