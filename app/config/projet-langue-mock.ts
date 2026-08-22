/**
 * Données illustratives « Mon Projet - Langue » (Figma 860:4150) hors API.
 *
 * Voir `docs/mon-projet-langue-mocks.md`.
 */

export type LangueProgressStepStatus = 'done' | 'current' | 'todo'

export interface LangueProgressStep {
  id: string
  labelKey: string
  status: LangueProgressStepStatus
}

export interface LangueSessionCardMock {
  id: string
  title: string
  timeLabel: string
  dateLabel: string
  /** ISO pour countdown / tri ; optionnel. */
  startAt: string
}

export interface LangueNextCourseMock {
  dateLabel: string
  timeLabel: string
  modeLabelKey: string
  /** Instant cible du countdown (mock Figma ~22h18m35s). */
  startsAt: string
}

export const langueProgressSteps: LangueProgressStep[] = [
  { id: '1', labelKey: 'languageProject.step1', status: 'done' },
  { id: '2', labelKey: 'languageProject.step2', status: 'done' },
  { id: '3', labelKey: 'languageProject.step3', status: 'current' },
  { id: '4', labelKey: 'languageProject.step5', status: 'todo' },
]

/** Cartes « Cours planifiés » — contenu Figma Langue 1 si l’API n’a pas de séances. */
export const languePlannedSessionsMock: LangueSessionCardMock[] = [
  {
    id: 'mock-1',
    title: "Cours d'anglais advanced",
    timeLabel: '10:00 – 11:00 (1h)',
    dateLabel: 'Mercredi 21 mai 2024',
    startAt: '2024-05-21T10:00:00',
  },
  {
    id: 'mock-2',
    title: "Cours d'anglais advanced",
    timeLabel: '16:00 – 17:00 (1h)',
    dateLabel: 'Mercredi 21 mai 2024',
    startAt: '2024-05-21T16:00:00',
  },
  {
    id: 'mock-3',
    title: "Cours d'anglais advanced",
    timeLabel: '10:00 – 11:00 (1h)',
    dateLabel: 'Jeudi 23 mai 2024',
    startAt: '2024-05-23T10:00:00',
  },
  {
    id: 'mock-4',
    title: "Cours d'anglais advanced",
    timeLabel: '16:00 – 17:00 (1h)',
    dateLabel: 'Jeudi 23 mai 2024',
    startAt: '2024-05-23T16:00:00',
  },
]

export interface LangueUnplannedCardMock {
  id: string
  title: string
  durationLabel: string
  /** Chemin relatif si lien mock ; `null` = bouton inerte. */
  to: string | null
}

/** Course / order démo pour le CTA « Planifier » → écran Professeur. */
export const LANGUE_DEMO_COURSE_ID = 'demo'
export const LANGUE_DEMO_ORDER_ID = 'demo-order'

/** Cartes « Cours à planifier » — Figma `862:241` Mon Projet - Langues 2. */
export const langueUnplannedSessionsMock: LangueUnplannedCardMock[] = [
  {
    id: 'unplanned-1',
    title: "Cours d'anglais advanced",
    durationLabel: '60 min',
    to: `/mon-projet/langues/${LANGUE_DEMO_COURSE_ID}/professeur?order=${LANGUE_DEMO_ORDER_ID}&lang=${encodeURIComponent('Anglais')}`,
  },
  {
    id: 'unplanned-2',
    title: "Cours d'anglais advanced",
    durationLabel: '60 min',
    to: `/mon-projet/langues/${LANGUE_DEMO_COURSE_ID}/professeur?order=${LANGUE_DEMO_ORDER_ID}&lang=${encodeURIComponent('Anglais')}`,
  },
  {
    id: 'unplanned-3',
    title: "Cours d'anglais advanced",
    durationLabel: '60 min',
    to: `/mon-projet/langues/${LANGUE_DEMO_COURSE_ID}/professeur?order=${LANGUE_DEMO_ORDER_ID}&lang=${encodeURIComponent('Anglais')}`,
  },
  {
    id: 'unplanned-4',
    title: "Cours d'anglais advanced",
    durationLabel: '60 min',
    to: `/mon-projet/langues/${LANGUE_DEMO_COURSE_ID}/professeur?order=${LANGUE_DEMO_ORDER_ID}&lang=${encodeURIComponent('Anglais')}`,
  },
]

export type LangueTeacherAvailabilityTone = 'today' | 'tomorrow' | 'soon' | 'later'

export interface LangueTeacherCardMock {
  id: string
  fullName: string
  photo: string
  verified: boolean
  countryLabel: string
  flagSrc: string
  rating: number
  reviewsCount: number
  qualification: string
  experienceYears: number
  availabilityLabel: string
  availabilityTone: LangueTeacherAvailabilityTone
  /** Prix affiché ; Figma utilise « - » (hors API). */
  priceFrom: string
}

/**
 * Liste professeurs — Figma `865:2982` Mon Projet - Professeur.
 * Champs pays / dispo / qualification / prix absents de `Teacher` API.
 */
export const langueTeachersMock: LangueTeacherCardMock[] = [
  {
    id: 'mock-teacher-1',
    fullName: 'Michael Brown',
    photo: '/img/mpl-prof/michael.jpg',
    verified: true,
    countryLabel: 'Royaume-Uni',
    flagSrc: '/img/mpl-prof/flag-uk.png',
    rating: 4.8,
    reviewsCount: 98,
    qualification: 'Certifié TEFL',
    experienceYears: 7,
    availabilityLabel: "Disponible aujourd'hui",
    availabilityTone: 'today',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-2',
    fullName: 'Sarah Johnson',
    photo: '/img/mpl-prof/sarah.jpg',
    verified: true,
    countryLabel: 'France',
    flagSrc: '/img/mpl-prof/flag-fr.png',
    rating: 4.9,
    reviewsCount: 124,
    qualification: 'Master en Didactique des langues',
    experienceYears: 5,
    availabilityLabel: 'Disponible demain',
    availabilityTone: 'tomorrow',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-3',
    fullName: 'Emily Chen',
    photo: '/img/mpl-prof/emily.jpg',
    verified: true,
    countryLabel: 'Canada',
    flagSrc: '/img/mpl-prof/flag-ca.png',
    rating: 4.8,
    reviewsCount: 98,
    qualification: 'Certifié TEFL',
    experienceYears: 6,
    availabilityLabel: 'Disponible le 24 mai',
    availabilityTone: 'later',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-4',
    fullName: 'David Wilson',
    photo: '/img/mpl-prof/david.jpg',
    verified: true,
    countryLabel: 'États-Unis',
    flagSrc: '/img/mpl-prof/flag-us.png',
    rating: 4.7,
    reviewsCount: 86,
    qualification: 'Certifié TESOL',
    experienceYears: 8,
    availabilityLabel: 'Disponible le 24 mai',
    availabilityTone: 'later',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-5',
    fullName: 'Olivia Martinez',
    photo: '/img/mpl-prof/sarah.jpg',
    verified: true,
    countryLabel: 'France',
    flagSrc: '/img/mpl-prof/flag-fr.png',
    rating: 4.6,
    reviewsCount: 72,
    qualification: 'Certifié CELTA',
    experienceYears: 4,
    availabilityLabel: "Disponible aujourd'hui",
    availabilityTone: 'today',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-6',
    fullName: 'James Anderson',
    photo: '/img/mpl-prof/michael.jpg',
    verified: true,
    countryLabel: 'Royaume-Uni',
    flagSrc: '/img/mpl-prof/flag-uk.png',
    rating: 4.9,
    reviewsCount: 110,
    qualification: 'Certifié TEFL',
    experienceYears: 9,
    availabilityLabel: 'Disponible demain',
    availabilityTone: 'tomorrow',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-7',
    fullName: 'Sophie Dubois',
    photo: '/img/mpl-prof/emily.jpg',
    verified: true,
    countryLabel: 'Canada',
    flagSrc: '/img/mpl-prof/flag-ca.png',
    rating: 4.5,
    reviewsCount: 64,
    qualification: 'Master FLE',
    experienceYears: 3,
    availabilityLabel: 'Disponible le 31 mai',
    availabilityTone: 'soon',
    priceFrom: '-',
  },
  {
    id: 'mock-teacher-8',
    fullName: 'Liam O\'Connor',
    photo: '/img/mpl-prof/david.jpg',
    verified: true,
    countryLabel: 'États-Unis',
    flagSrc: '/img/mpl-prof/flag-us.png',
    rating: 4.8,
    reviewsCount: 91,
    qualification: 'Certifié TESOL',
    experienceYears: 6,
    availabilityLabel: 'Disponible le 24 mai',
    availabilityTone: 'later',
    priceFrom: '-',
  },
]

/** Créneaux mock — Figma `858:3603` Créneau Professeur (si calendrier API vide). */
export const langueCreneauHoursMock = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
] as const

export const LANGUE_TEACHERS_PER_PAGE = 4

/** Étapes toutes validées — Figma `863:1956` Mon Projet - Langues 4 (certification). */
export const langueCertificationSteps: LangueProgressStep[] = [
  { id: '1', labelKey: 'languageProject.step1', status: 'done' },
  { id: '2', labelKey: 'languageProject.step2', status: 'done' },
  { id: '3', labelKey: 'languageProject.step3', status: 'done' },
  { id: '4', labelKey: 'languageProject.step5', status: 'done' },
]

export const langueCertificationPct = 100

/** Bandeau « Prochain cours » — Figma (countdown 22h / 18min / 35s). */
export const langueNextCourseMock: LangueNextCourseMock = {
  dateLabel: 'Mercredi 21 mai 2024',
  timeLabel: '18:00 – 19:00 (1h)',
  modeLabelKey: 'languageProject.visio',
  /** Relatif : ~22h18m35s après chargement de la page (affichage Figma). */
  startsAt: '',
}

/** Progress % affiché quand aucune heure API (maquette 50 %). */
export const langueProgressFallbackPct = 50
