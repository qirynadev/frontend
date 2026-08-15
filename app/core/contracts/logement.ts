export type LogementStepStatus = 'done' | 'current' | 'upcoming'

export interface LogementStep {
  id: string
  /** Numéro affiché dans la pastille des étapes non terminées. */
  stepNumber: number
  titleKey: string
  status: LogementStepStatus
  /** Date de réalisation, présente uniquement sur les étapes terminées. */
  completedAt?: string
  icon: string
}
