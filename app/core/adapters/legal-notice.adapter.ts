import type { LegalNoticeTexts } from '../contracts'
import { asRecord } from './primitives'

/** `GET /legal-notice` → `{ texts: { clé: texte } }`. Seuls les textes renseignés sont gardés. */
export function toLegalNoticeTexts(raw: unknown): LegalNoticeTexts {
  const texts: LegalNoticeTexts = {}
  for (const [key, value] of Object.entries(asRecord(asRecord(raw).texts))) {
    if (typeof value === 'string' && value.trim() !== '') texts[key] = value.trim()
  }
  return texts
}
