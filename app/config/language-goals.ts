/**
 * Objectifs d'apprentissage — contenu de `objectifs.html`.
 *
 * **Repli éditorial depuis le 2026-09-11** : les objectifs sont désormais
 * administrés par langue (`Course.objectives`, voir `course.adapter.ts`). Cette
 * liste ne sert plus que quand l'API n'en renvoie aucun pour la langue **et la
 * locale** demandées — c'est encore le cas de la majorité du catalogue en
 * anglais, les traductions étant en cours de saisie côté back-office. Sans ce
 * repli, l'écran se viderait de ses six cartes.
 *
 * Les libellés/descriptions sont génériques à toute langue — `{language}`
 * (le nom de la langue du cours courant) s'interpole dans les clés qui en ont
 * besoin, `objectifs.vue` le passe systématiquement à `$t()`.
 *
 * Les teintes de pastille et les icônes sont celles de la maquette
 * (`.objectifs-icon--exam`, `--conversation`, `--pro`, `--niveau`,
 * `--admission`, `--autre`).
 */
export interface LanguageGoal {
  id: string
  labelKey: string
  descriptionKey: string
  /** Fichier de `public/img/icons/`, sans extension. Affiché en 20×20. */
  icon: string
  /** Classe de fond de la pastille, adossée à un token. */
  tint: string
  /** Étiquette « Populaire » : seul le premier objectif la porte. */
  badgeKey?: string
}

export const languageGoals: LanguageGoal[] = [
  {
    id: 'exams',
    labelKey: 'goal.exams',
    descriptionKey: 'goal.examsDesc',
    icon: 'ic-obj-exam',
    tint: 'bg-goal-exam',
    badgeKey: 'goal.popular',
  },
  { id: 'conversation', labelKey: 'goal.conversation', descriptionKey: 'goal.conversationDesc', icon: 'ic-obj-conversation', tint: 'bg-goal-conversation' },
  { id: 'professional', labelKey: 'goal.professional', descriptionKey: 'goal.professionalDesc', icon: 'ic-obj-pro', tint: 'bg-goal-pro' },
  { id: 'level', labelKey: 'goal.level', descriptionKey: 'goal.levelDesc', icon: 'ic-obj-niveau', tint: 'bg-goal-level' },
  { id: 'admission', labelKey: 'goal.admission', descriptionKey: 'goal.admissionDesc', icon: 'ic-obj-admission', tint: 'bg-goal-admission' },
  { id: 'other', labelKey: 'goal.other', descriptionKey: 'goal.otherDesc', icon: 'ic-obj-autre', tint: 'bg-goal-other' },
]

/** Icône + teinte d'une pastille, seule partie non administrée d'un objectif. */
export interface GoalVisual {
  icon: string
  tint: string
}

const VISUAL_BY_ID: Record<string, GoalVisual> = Object.fromEntries(
  languageGoals.map((goal) => [goal.id, { icon: goal.icon, tint: goal.tint }]),
)

/**
 * Motifs reconnus dans la `key` d'un objectif administré, dans l'ordre d'essai.
 *
 * Depuis le 2026-09-11, `key` est stockée et partagée entre les langues d'un
 * même objectif (back-office `8cd05a0`) : c'est en pratique le slug de son
 * titre français, figé à la création. Mais `{langue}-professionnel` varie
 * toujours avec la langue enseignée, et les objectifs non encore reliés
 * gardent le slug de leur titre anglais (`international-exams`) : on
 * reconnaît donc des fragments plutôt qu'une liste close d'identifiants. Un
 * objectif ajouté demain avec une clé inconnue n'est pas une erreur — il
 * prend la pastille neutre d'« Autre ».
 */
const VISUAL_PATTERNS: [RegExp, string][] = [
  [/exam/, 'exams'],
  [/conversation|oral|speak/, 'conversation'],
  [/professionnel|professional|business|pro\b/, 'professional'],
  [/niveau|level|remise/, 'level'],
  [/admission|universit|etude|study/, 'admission'],
]

export function goalVisual(key: string): GoalVisual {
  const direct = VISUAL_BY_ID[key]
  if (direct) return direct

  const normalized = key.toLowerCase()
  for (const [pattern, id] of VISUAL_PATTERNS) {
    if (pattern.test(normalized)) return VISUAL_BY_ID[id]!
  }
  return VISUAL_BY_ID.other!
}
