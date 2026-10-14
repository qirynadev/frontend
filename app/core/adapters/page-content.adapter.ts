import type { PageContent, PageTextBlock, PageTextValue } from '../contracts'
import { asArray, asRecord, isRecord, toUrl } from './primitives'

/** Texte saisi, nettoyé ; vide ou autre chose qu'une chaîne = `null` (texte par défaut). */
function cleanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function toTextValue(value: unknown): PageTextValue {
  if (!Array.isArray(value)) return cleanText(value)
  if (value.some(isRecord)) {
    return value.map((entry): PageTextBlock =>
      Object.fromEntries(Object.entries(asRecord(entry)).map(([field, text]) => [field, cleanText(text)])),
    )
  }
  return value.map(cleanText)
}

/**
 * Contenu administrable d'une page (`page_texts`, `icons`, `hero_image`).
 * Une API antérieure au 2026-10-14 ne sert aucun de ces champs : tout reste
 * alors au défaut du site.
 */
export function toPageContent(source: Record<string, unknown>): PageContent {
  const texts = Object.fromEntries(
    Object.entries(asRecord(source.page_texts)).map(([key, value]) => [key, toTextValue(value)]),
  )
  const icons = Object.fromEntries(
    Object.entries(asRecord(source.icons)).map(([zone, slots]) => [
      zone,
      asArray(slots).map((slot) => toUrl(asRecord(slot).url)),
    ]),
  )

  return { texts, icons, heroImage: toUrl(source.hero_image) }
}
