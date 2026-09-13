import type { LanguageLevelKey } from '~/core/contracts/course'
import { LANGUAGE_LEVEL_KEYS } from '~/core/contracts/course'

/**
 * Niveaux de langue du parcours d'achat — présentation.
 *
 * Les clés viennent du back-office (`LanguageLevelEnum`) ; libellés et nombre
 * de barres de l'icône sont des choix d'affichage, donc ici. L'ordre est celui
 * de l'écran : débutant, intermédiaire, avancé.
 */
export interface LanguageLevelPresentation {
  key: LanguageLevelKey
  labelKey: `course.level.${LanguageLevelKey}`
  /** Barres pleines de l'icône « signal » (sur trois). */
  bars: 1 | 2 | 3
}

export const LANGUAGE_LEVELS: readonly LanguageLevelPresentation[] = LANGUAGE_LEVEL_KEYS.map((key, index) => ({
  key,
  labelKey: `course.level.${key}` as const,
  bars: (index + 1) as 1 | 2 | 3,
}))

export function isLanguageLevel(value: unknown): value is LanguageLevelKey {
  return typeof value === 'string' && (LANGUAGE_LEVEL_KEYS as readonly string[]).includes(value)
}

/** Présentations des clés données, dans l'ordre de l'écran. */
export function levelsAmong(keys: readonly string[]): LanguageLevelPresentation[] {
  return LANGUAGE_LEVELS.filter((level) => keys.includes(level.key))
}
