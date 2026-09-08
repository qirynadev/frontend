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

/**
 * Rubriques reconnues, dans l'ordre d'affichage voulu de la modale — source
 * unique : `pattern` détecte la rubrique (`s?` sur « programme »/
 * « admission », l'admin saisissant indifféremment le singulier ou le
 * pluriel — « Admissions : » vu en direct sur Polytechnique, 2026-09-08),
 * `label` est la forme canonique affichée, qui absorbe cette variation —
 * sans ça, une rubrique « Admissions » ne correspondait plus à « Admission »
 * dans `MODAL_SECTION_ORDER` et retombait en fin de liste plutôt qu'à sa
 * place.
 */
const KNOWN_SECTIONS: { pattern: RegExp; label: string }[] = [
  { pattern: /^cible\b/i, label: 'Cible' },
  { pattern: /^programmes?\b/i, label: 'Programmes' },
  { pattern: /^frais\b/i, label: 'Frais' },
  { pattern: /^admissions?\b/i, label: 'Admission' },
  { pattern: /^d[ée]bouch[ée]s\b/i, label: 'Débouchés' },
]

/**
 * L'admin ponctue le libellé indifféremment en `?` (« Cible ? ») ou en `:`
 * (« Cible : », vu en direct sur École Polytechnique/Birmingham/Caltech,
 * 2026-09-08) — les deux doivent disparaître : le gabarit de la modale
 * (`[school].vue`) ajoute lui-même « ? » après le libellé, et les
 * comparaisons (`orderSections`, `summaryFromSections`) le comparent aux
 * noms nus (« cible », « programmes »…).
 */
function normalizeLabel(raw: string): string {
  return raw.trim().replace(/[?:]+\s*$/, '').trim()
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

/**
 * Bloc reconnu comme unité de rubrique : `<p>`, ou un titre (`<h2>`-`<h6>`)
 * quand l'admin choisit un style « Titre » dans Quill plutôt que « Normal »
 * — les deux survivent à `sanitizeHtml` (`core/adapters/sanitize.ts`,
 * `ALLOWED_TAGS`). Repéré en direct (2026-09-08) : Birmingham Business
 * School et Caltech saisissent leur rubrique « Cible » en `<h4>` — en ne
 * cherchant que des `<p>`, ces rubriques n'étaient jamais détectées.
 */
const BLOCK_RE = /<(p|h[2-6])(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi

function contentBlocks(html: string): string[] {
  return html.match(BLOCK_RE) ?? []
}

/** Nom de la balise ouvrante d'un bloc (`p`, `h4`…) — pour un retrait symétrique. */
function blockTag(block: string): string {
  return block.match(/^<([a-z0-9]+)/i)?.[1]?.toLowerCase() ?? 'p'
}

/**
 * Rubrique structurée = le `<strong>` ouvre le bloc et porte un libellé
 * connu (`Cible ?`, `Programmes ?`…). Un `<strong>` d'emphase au milieu
 * d'une phrase (ex. « Le Global BBA ») n'en est pas une.
 */
function sectionLabelFromBlock(block: string): string | null {
  const tag = blockTag(block)
  const inner = block.replace(new RegExp(`^<${tag}[^>]*>`, 'i'), '').replace(new RegExp(`</${tag}>$`, 'i'), '').trim()
  const match = inner.match(/^<strong>\s*([^<]+?)\s*<\/strong>/i)
  if (!match) return null
  const label = normalizeLabel(match[1] ?? '')
  return KNOWN_SECTIONS.find((section) => section.pattern.test(label))?.label ?? null
}

function sectionContentFromBlock(block: string): string {
  const tag = blockTag(block)
  const inner = block
    .replace(new RegExp(`^<${tag}[^>]*>`, 'i'), '')
    .replace(new RegExp(`</${tag}>$`, 'i'), '')
    .replace(/^<strong>\s*[^<]+?\s*<\/strong>\s*(?:&nbsp;|\u00a0|\s)*/i, '')
    .trim()
  return inner.startsWith('<') ? inner : `<p>${inner}</p>`
}

function extractSections(html: string): FormationSection[] {
  const sections: FormationSection[] = []

  for (const block of contentBlocks(html)) {
    const label = sectionLabelFromBlock(block)
    if (!label) continue
    const content = sectionContentFromBlock(block)
    if (stripHtml(content)) sections.push({ label, content })
  }

  return sections
}

function extractBodyHtml(html: string): string {
  const blocks = contentBlocks(html)
  if (blocks.length === 0) {
    // Pas de bloc reconnu : tout le HTML libre sauf s'il n'est qu'une rubrique.
    return sectionLabelFromBlock(`<p>${html}</p>`) ? '' : html.trim()
  }

  return blocks.filter((block) => !sectionLabelFromBlock(block)).join('')
}

function orderSections(sections: FormationSection[]): FormationSection[] {
  const used = new Set<FormationSection>()
  const ordered: FormationSection[] = []

  for (const { label: name } of KNOWN_SECTIONS) {
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
  const first = contentBlocks(bodyHtml)[0] ?? bodyHtml
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
