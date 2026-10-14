/**
 * Lecture du contenu administrable d'une page (pages langue et logement,
 * 2026-10-14). Chaque accesseur renvoie `null` quand rien n'est saisi : la
 * page garde alors son texte, son icône ou sa photo par défaut (`?? $t(...)`).
 * Tolère un contenu absent (catalogue mis en cache par une version antérieure).
 */
import type { PageContent } from '~/core/contracts'

/** Un texte de la page : `pageText(page, 'heading')`. */
export function pageText(page: PageContent | null | undefined, key: string): string | null {
  const value = page?.texts[key]
  return typeof value === 'string' ? value : null
}

/**
 * Un texte d'une liste : `pageListText(page, 'pains', 0)`, ou d'un bloc de
 * liste : `pageListText(page, 'path', 0, 'title')`.
 */
export function pageListText(page: PageContent | null | undefined, key: string, index: number, field?: string): string | null {
  const value = page?.texts[key]
  if (!Array.isArray(value)) return null
  const entry = value[index]
  if (field === undefined) return typeof entry === 'string' ? entry : null
  if (entry && typeof entry === 'object') {
    const text = entry[field]
    return typeof text === 'string' ? text : null
  }
  return null
}

/** URL de l'icône choisie pour un emplacement : `pageIcon(page, 'features', 2)`. */
export function pageIcon(page: PageContent | null | undefined, zone: string, index: number): string | null {
  return page?.icons[zone]?.[index] ?? null
}
