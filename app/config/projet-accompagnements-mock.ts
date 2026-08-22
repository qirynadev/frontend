/**
 * Cartes illustratives de `/mon-projet` ← `mon-projet.html`.
 *
 * Utilisées :
 * - quand l’API ne renvoie aucune commande / langue ;
 * - pour compléter progress / conseiller / date / sous-titre absents.
 *
 * Voir `docs/mon-projet-mocks.md`.
 */
import type { ProjetAccompagnement } from '~/core/contracts/projet'

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export const projetAccompagnementsMock: ProjetAccompagnement[] = [
  {
    id: 'mock-admission',
    titleKey: 'myProject.accompaniementAdmissionTitle',
    sub: 'ESA Paris',
    statusKey: 'myProject.statusInProgress',
    badgeTone: 'purple',
    progressPercent: 80,
    progressColor: '#4615fd',
    advisorName: 'Sarah Kouamé',
    updatedAt: daysAgoIso(1),
    icon: '/img/icons/ic-mp-admission.png',
    to: '/mon-projet/admission',
  },
  {
    id: 'mock-logement',
    titleKey: 'myProject.accompaniementLogementTitle',
    sub: 'Recherche en cours à Paris',
    statusKey: 'myProject.statusInProgress',
    badgeTone: 'green',
    progressPercent: 30,
    progressColor: '#19b64c',
    advisorName: 'Idriss Traoré',
    updatedAt: daysAgoIso(2),
    icon: '/img/icons/ic-mp-logement.png',
    to: '/mon-projet/logement',
  },
  {
    id: 'mock-langues',
    titleKey: 'myProject.accompaniementLanguesTitle',
    sub: 'Anglais général - Niveau B1',
    statusKey: 'myProject.statusInProgress',
    badgeTone: 'pink',
    progressPercent: 50,
    progressColor: '#fc1f99',
    advisorName: 'Amina Diallo',
    updatedAt: daysAgoIso(1),
    icon: '/img/icons/ic-mp-langues.svg',
    to: '/mon-projet/langues',
  },
  {
    id: 'mock-orientation',
    titleKey: 'myProject.accompaniementOrientationTitle',
    sub: "Profil d'orientation généré",
    statusKey: 'myProject.statusDone',
    badgeTone: 'orange',
    progressPercent: 100,
    progressColor: '#f97316',
    advisorName: 'Marie Konan',
    updatedAt: daysAgoIso(5),
    icon: '/img/icons/ic-mp-orientation.png',
    to: '/mon-projet/orientation',
  },
]

/** Complète une carte API avec les champs maquette manquants (par type). */
export function enrichAccompagnementFromMock(item: ProjetAccompagnement): ProjetAccompagnement {
  const fallback = projetAccompagnementsMock.find((m) => m.titleKey === item.titleKey)
  if (!fallback) {
    return {
      ...item,
      progressPercent: item.progressPercent ?? 0,
      advisorName: item.advisorName ?? '—',
      updatedAt: item.updatedAt ?? daysAgoIso(0),
      sub: item.sub.trim() || '—',
    }
  }

  return {
    ...item,
    sub: item.sub.trim() || fallback.sub,
    progressPercent: item.progressPercent ?? fallback.progressPercent,
    advisorName: item.advisorName ?? fallback.advisorName,
    updatedAt: item.updatedAt ?? fallback.updatedAt,
  }
}

/**
 * Garantit les 4 cartes maquette (Admission, Logement, Langues, Orientation).
 * Les cartes API du même type sont conservées ; les types manquants sont
 * injectés depuis le mock.
 */
export function mergeAccompagnementsWithMaquette(
  fromApi: ProjetAccompagnement[],
): ProjetAccompagnement[] {
  const enriched = fromApi.map(enrichAccompagnementFromMock)
  const result = [...enriched]

  for (const mock of projetAccompagnementsMock) {
    if (!result.some((item) => item.titleKey === mock.titleKey)) {
      result.push(mock)
    }
  }

  const order = projetAccompagnementsMock.map((m) => m.titleKey)
  return result.sort((a, b) => {
    const ai = order.indexOf(a.titleKey)
    const bi = order.indexOf(b.titleKey)
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    return 0
  })
}
