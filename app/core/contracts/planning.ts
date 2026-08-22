/**
 * Planification des cours de langues — `/user/plannings/*`.
 *
 * Une commande de langue donne droit à `offer.hours` séances d'une heure : ce
 * domaine suit ce qu'il en reste à planifier, par langue plutôt que par
 * commande (une même langue peut cumuler plusieurs commandes, voir
 * `order.ts`).
 */

export interface PlanningTeacherSummary {
  id: string
  fullName: string
  photo: string | null
}

/** Une heure achetée, pas encore casée dans un créneau. */
export interface UnplannedLesson {
  /** Commande à laquelle cette heure est rattachée. */
  orderId: string
  level: string | null
  /** ISO complet — 3 mois après l'achat de la commande. */
  expiresAt: string | null
  daysUntilExpiry: number
  expired: boolean
  /** Aucun professeur choisi sur la commande : `PlanningTeacherStep` avant `PlanningCalendar`. */
  needsTeacher: boolean
  teacher: PlanningTeacherSummary | null
}

export interface LanguageProgress {
  /** `null` quand `lessons` est vide (langue entièrement planifiée) : rien à en dériver. */
  courseId: string | null
  title: string
  picture: string | null
  flag: string | null
  totalHours: number
  totalPlanned: number
  lessons: UnplannedLesson[]
}

/** Carte de sélection d'un professeur — `TeacherResource` réduit à l'essentiel du choix. */
export interface Teacher {
  id: string
  fullName: string
  photo: string | null
  biography: string | null
  rating: number | null
  reviewsCount: number
  experienceYears: number | null
  /** Pays déclaré sur le profil (`country.name` / `country_flag`, réels côté API). */
  countryLabel: string | null
  countryFlag: string | null
  /**
   * Premier créneau libre à venir, dérivé de `plannings[]` (déjà inclus dans
   * cette même réponse — pas d'appel supplémentaire). `null` si aucun.
   */
  nextAvailableAt: string | null
  /** Diplôme déclaré (`formations[0].diploma`) — qualité éditoriale variable, voir `docs/directives-backend.md`. */
  qualification: string | null
  /** `user.email_verified_at !== null` — confirmation d'e-mail, pas un contrôle de profil distinct côté API. */
  verified: boolean
}

/** Un créneau du calendrier d'un professeur — libre ou déjà réservé. */
export interface CalendarSlot {
  id: string
  startDate: string
  endDate: string
  free: boolean
}

/** Une séance déjà casée dans un créneau. */
export interface PlannedSession {
  id: string
  /** Libre, saisi à la réservation (voir `PlanningController::createPlanning`) — pas une clé de regroupement fiable. */
  title: string
  startDate: string | null
  endDate: string | null
  teacher: PlanningTeacherSummary | null
  /** `order.associated_service.id` — apparie une séance à sa `LanguageProgress`. */
  courseId: string | null
}
