import type { CalendarSlot, LanguageProgress, PlannedSession, Teacher } from '../contracts/planning'
import { bffFetch } from '../http/client'

/**
 * Planification des cours de langues.
 *
 * `unplanned` groupe par langue (une langue peut cumuler plusieurs
 * commandes) ; `planned` liste les séances déjà casées, toutes langues
 * confondues. Le professeur est choisi **par commande** (`Order.profile_id`),
 * pas par langue — deux commandes de la même langue peuvent avoir des
 * professeurs différents.
 */
export const planningRepo = {
  unplanned(locale?: string): Promise<LanguageProgress[]> {
    return bffFetch<LanguageProgress[]>('/plannings/unplanned', { locale })
  },

  planned(locale?: string): Promise<PlannedSession[]> {
    return bffFetch<PlannedSession[]>('/plannings/planned', { locale })
  },

  /** Professeurs enseignant ce cours et ayant au moins un créneau libre. */
  teachersByCourse(courseId: string, locale?: string): Promise<Teacher[]> {
    return bffFetch<Teacher[]>(`/plannings/teachers/${encodeURIComponent(courseId)}`, { locale })
  },

  /** Calendrier d'un professeur — créneaux libres et déjà pris. */
  events(teacherId: string, locale?: string): Promise<CalendarSlot[]> {
    return bffFetch<CalendarSlot[]>('/plannings/events', { query: { teacherId }, locale })
  },

  /** Assigne (ou change) le professeur d'une commande. */
  assignTeacher(orderId: string, teacherId: string, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/plannings/new-teacher', { method: 'POST', body: { orderId, teacherId }, locale })
  },

  /** Réserve un créneau libre pour une commande. */
  book(input: { planningId: string; orderId: string; title: string; startAt: string; endAt: string }, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/plannings/create', { method: 'POST', body: input, locale })
  },
}
