import type { Page } from '../contracts'
import { toSeo } from './common.adapter'
import { asRecord, dedupeBySlug, html, str } from './primitives'
import { sanitizeHtml } from './sanitize'

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * La FAQ n'est pas du HTML : l'éditeur dédié du back-office
 * (`PageController::updateFaq`) l'enregistre en JSON
 * `[{ "question": "…", "answer": "<p>…</p>" }]`. Rendue comme du HTML, la
 * page affichait ce JSON brut (accents en `é`, balises visibles). En
 * attendant un écran FAQ dédié, chaque question devient un titre suivi de sa
 * réponse, dans la page éditoriale existante. `null` si le contenu n'a pas
 * cette forme : il est alors traité comme du HTML ordinaire.
 */
function faqToHtml(content: string): string | null {
  const trimmed = content.trim()
  if (!trimmed.startsWith('[')) return null
  let items: unknown
  try {
    items = JSON.parse(trimmed)
  }
  catch {
    return null
  }
  if (!Array.isArray(items) || items.length === 0) return null
  const entries = items
    .map((item) => asRecord(item))
    .filter((item) => typeof item.question === 'string' && item.question.trim() !== '')
  if (entries.length === 0) return null
  return sanitizeHtml(
    entries.map((item) => `<h2>${escapeText(String(item.question).trim())}</h2>${str(item, 'answer')}`).join(''),
  )
}

export function toPage(raw: unknown): Page {
  const source = asRecord(raw)
  const title = str(source, 'title')
  const content = faqToHtml(str(source, 'content')) ?? html(source, 'content')

  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title,
    content,
    seo: toSeo(source, title, content),
  }
}

export function toPageList(raw: unknown): Page[] {
  const pages = (Array.isArray(raw) ? raw : [])
    .map(toPage)
    .filter((page) => page.id !== '' && page.slug !== '')

  return dedupeBySlug(pages, 'pages éditoriales')
}
