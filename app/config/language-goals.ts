/**
 * Objectifs d'apprentissage — contenu de `objectifs.html`.
 *
 * **Éditorial, non administré** : aucun endpoint de l'API ne décrit ces six
 * choix. Ils vivent donc dans une configuration, traduits, plutôt que recopiés
 * dans le template.
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
