/**
 * Inventaire cookies affiché à côté du texte CMS.
 * Aligné sur la politique administrée (pas le tableau placeholder Figma).
 */
export interface LegalCookieRow {
  nameKey: string
  purposeKey: string
  durationKey: string
  optional?: boolean
}

export const legalCookieRows: LegalCookieRow[] = [
  { nameKey: 'legalCookies.table.sessionName', purposeKey: 'legalCookies.table.sessionPurpose', durationKey: 'legalCookies.table.sessionDuration' },
  { nameKey: 'legalCookies.table.localeName', purposeKey: 'legalCookies.table.localePurpose', durationKey: 'legalCookies.table.localeDuration' },
  { nameKey: 'legalCookies.table.consentName', purposeKey: 'legalCookies.table.consentPurpose', durationKey: 'legalCookies.table.consentDuration' },
  { nameKey: 'legalCookies.table.stripeName', purposeKey: 'legalCookies.table.stripePurpose', durationKey: 'legalCookies.table.stripeDuration' },
  { nameKey: 'legalCookies.table.gaName', purposeKey: 'legalCookies.table.gaPurpose', durationKey: 'legalCookies.table.gaDuration', optional: true },
]
