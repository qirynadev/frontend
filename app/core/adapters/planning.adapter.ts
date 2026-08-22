import type { CalendarSlot, LanguageProgress, PlannedSession, PlanningTeacherSummary, Teacher, UnplannedLesson } from '../contracts/planning'
import { asArray, asRecord, bool, dig, num, optionalNum, optionalStr, str, toUrl } from './primitives'

/** `TeacherResource` réduit à ce qu'une pastille de professeur affiche. */
export function toPlanningTeacherSummary(raw: unknown): PlanningTeacherSummary | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  return {
    id,
    fullName: str(source, 'full_name'),
    photo: toUrl(source.photo),
  }
}

function toUnplannedLesson(raw: unknown): UnplannedLesson {
  const source = asRecord(raw)

  return {
    orderId: str(source, 'id'),
    level: optionalStr(source, 'level'),
    // Déjà ISO complet côté API (`toIso8601String`) : pas de `toIsoDate`.
    expiresAt: optionalStr(source, 'expires_at'),
    daysUntilExpiry: num(source, 'days_until_expiry', 0),
    expired: bool(source, 'expired', false),
    needsTeacher: bool(source, 'needs_teacher', true),
    teacher: toPlanningTeacherSummary(source.teacher),
  }
}

export function toLanguageProgressList(raw: unknown): LanguageProgress[] {
  return asArray(raw).map((entry) => {
    const source = asRecord(entry)
    const rawLessons = asArray(source.plannings)

    return {
      // Porté par chaque heure restante, pas par le groupe : `null` si la
      // langue est entièrement planifiée (`plannings` vide).
      courseId: optionalStr(asRecord(rawLessons[0]), 'course_id'),
      title: str(source, 'title'),
      picture: toUrl(source.picture),
      flag: toUrl(source.flag),
      totalHours: num(source, 'total_hours', 0),
      totalPlanned: num(source, 'total_planned', 0),
      lessons: rawLessons.map(toUnplannedLesson),
    }
  })
}

export function toPlannedSession(raw: unknown): PlannedSession {
  const source = asRecord(raw)

  return {
    id: str(source, 'id'),
    title: str(source, 'title'),
    // Déjà ISO complet côté API (`Y-m-d\TH:i\Z`).
    startDate: optionalStr(source, 'start_date'),
    endDate: optionalStr(source, 'end_date'),
    teacher: toPlanningTeacherSummary(source.teacher),
    // `title` est une saisie libre à la réservation, pas une clé de
    // regroupement fiable — `order.associated_service.id` l'est.
    courseId: optionalStr(asRecord(dig(source, 'order.associated_service')), 'id'),
  }
}

export function toPlannedSessionList(raw: unknown): PlannedSession[] {
  return asArray(raw).map(toPlannedSession)
}

/**
 * Premier créneau libre à venir d'un professeur, à partir de `plannings[]`
 * (déjà présent sur `TeacherResource` — un appel par professeur en plus
 * n'est pas nécessaire pour ça).
 */
function toNextAvailableAt(raw: unknown): string | null {
  const now = Date.now()
  let earliest: string | null = null

  for (const entry of asArray(raw)) {
    const source = asRecord(entry)
    if (str(source, 'status') !== 'free') continue
    const start = optionalStr(source, 'start_date')
    if (start === null) continue
    const time = new Date(start).getTime()
    if (Number.isNaN(time) || time <= now) continue
    if (earliest === null || time < new Date(earliest).getTime()) earliest = start
  }

  return earliest
}

export function toTeacher(raw: unknown): Teacher | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  return {
    id,
    fullName: str(source, 'full_name'),
    photo: toUrl(source.photo),
    // HTML éditorial simple (un `<p>`) : pas de rich-text élaboré côté profil professeur.
    biography: optionalStr(source, 'biography'),
    rating: optionalNum(source, 'rating'),
    reviewsCount: num(source, 'reviews_count', 0),
    experienceYears: optionalNum(source, 'experience_years'),
    countryLabel: optionalStr(source, 'country.name'),
    countryFlag: toUrl(source.country_flag),
    nextAvailableAt: toNextAvailableAt(source.plannings),
    qualification: optionalStr(source, 'formations.0.diploma'),
    verified: optionalStr(source, 'user.email_verified_at') !== null,
  }
}

/**
 * `/user/plannings/teachers/{courseId}` renvoie un `LengthAwarePaginator`
 * sérialisé (`{data: [...], current_page, ...}`), pas un tableau nu comme
 * `/teachers` ou `/courses/{id}/teachers` — seul cet endpoint pagine.
 */
export function toTeacherList(raw: unknown): Teacher[] {
  const source = asRecord(raw)
  const entries = Array.isArray(raw) ? raw : asArray(source.data)
  return entries.map(toTeacher).filter((teacher): teacher is Teacher => teacher !== null)
}

function toCalendarSlot(raw: unknown): CalendarSlot | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  const start = str(source, 'start')
  const end = str(source, 'end')
  if (id === '' || start === '' || end === '') return null

  return {
    id,
    startDate: start,
    endDate: end,
    free: str(source, 'status') === 'free' && bool(source, 'future', false),
  }
}

export function toCalendarSlotList(raw: unknown): CalendarSlot[] {
  return asArray(raw).map(toCalendarSlot).filter((slot): slot is CalendarSlot => slot !== null)
}
