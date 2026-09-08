/**
 * Pastille de disponibilité d'un professeur, à partir de `Teacher.nextAvailableAt`
 * (premier créneau libre à venir, réel — voir `planning.adapter.ts`).
 *
 * Seuils calqués sur ceux qu'illustrait `langueTeachersMock` (Figma
 * `865:2982`) : aujourd'hui / demain / cette semaine / plus tard.
 */

export type TeacherAvailabilityTone = 'today' | 'tomorrow' | 'soon' | 'later'

export interface TeacherAvailability {
  label: string
  tone: TeacherAvailabilityTone
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function resolveTeacherAvailability(
  nextAvailableAt: string | null,
  locale: string,
  t: (key: string, params?: Record<string, unknown>) => string,
): TeacherAvailability | null {
  if (nextAvailableAt === null) return null

  const target = new Date(nextAvailableAt)
  if (Number.isNaN(target.getTime())) return null

  const today = startOfDay(new Date())
  const targetDay = startOfDay(target)
  const daysAhead = Math.round((targetDay - today) / 86_400_000)

  if (daysAhead <= 0) return { label: t('languagePlanning.availableToday'), tone: 'today' }
  if (daysAhead === 1) return { label: t('languagePlanning.availableTomorrow'), tone: 'tomorrow' }

  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(target)
  return {
    label: t('languagePlanning.availableOn', { date }),
    tone: daysAhead <= 7 ? 'soon' : 'later',
  }
}
