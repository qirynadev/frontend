export type AdmissionStepStatus = 'done' | 'current' | 'upcoming'
export type DocumentStatus = 'validated' | 'pending' | 'upload'

export interface AdmissionStep {
  id: string
  stepNumber: number
  titleKey: string
  descKey: string
  status: AdmissionStepStatus
  completedAt?: string
}

export interface AdmissionDocument {
  id: string
  titleKey: string
  required: boolean
  fileType: string
  fileCount?: number
  status: DocumentStatus
  icon: string
}

export interface AdmissionSchool {
  name: string
  program: string
  statusKey: string
  entryDate: string
  progressPercent: number
  advisorName: string
  lastUpdateKey: string
}

export interface AdmissionData {
  school: AdmissionSchool
  steps: AdmissionStep[]
  documents: AdmissionDocument[]
}
