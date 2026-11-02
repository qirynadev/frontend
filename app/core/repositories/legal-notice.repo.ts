import type { LegalNoticeTexts } from '../contracts'
import { bffFetch } from '../http/client'

export const legalNoticeRepo = {
  /** Une panne ne vide pas la page : elle garde alors les textes du site. */
  async get(locale?: string): Promise<LegalNoticeTexts> {
    return bffFetch<LegalNoticeTexts>('/legal-notice', { locale }).catch(() => ({}))
  },
}
