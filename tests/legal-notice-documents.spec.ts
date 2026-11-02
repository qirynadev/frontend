import { describe, expect, it } from 'vitest'
import { toAdmissionDocumentsState } from '~~/app/core/adapters/admission-documents.adapter'
import { toSiteSettings } from '~~/app/core/adapters/common.adapter'
import { toLegalNoticeTexts } from '~~/app/core/adapters/legal-notice.adapter'
import { phoneLink, whatsappLink } from '~~/app/utils/contact-links'

/** Mentions légales administrées, numéro WhatsApp et pièces privées (2026-11-01). */
describe('toLegalNoticeTexts', () => {
  it('garde les textes renseignés', () => {
    expect(toLegalNoticeTexts({ texts: { hostName: ' OVH SAS ', hostRcs: '', autre: 12 } })).toEqual({ hostName: 'OVH SAS' })
  })

  it('sans réponse, ou avec une liste vide de PHP, il n\'y a aucun texte', () => {
    expect(toLegalNoticeTexts(null)).toEqual({})
    expect(toLegalNoticeTexts({ texts: [] })).toEqual({})
  })
})

describe('whatsappLink', () => {
  it('ne garde que les chiffres, avec l\'indicatif', () => {
    expect(whatsappLink('+225 07 00 00 00 00')).toBe('https://wa.me/2250700000000')
    expect(whatsappLink('0033 6 23 45 67 89')).toBe('https://wa.me/33623456789')
  })

  it('sans numéro exploitable, pas de lien', () => {
    for (const number of ['', '123', null, undefined]) expect(whatsappLink(number)).toBeNull()
  })
})

describe('phoneLink', () => {
  it('garde les chiffres et le « + »', () => {
    expect(phoneLink('09 70 80 89 11')).toBe('tel:0970808911')
    expect(phoneLink('+33 9 72 10 10 07')).toBe('tel:+33972101007')
  })
})

describe('toSiteSettings', () => {
  it('lit le numéro WhatsApp, distinct du téléphone', () => {
    const settings = toSiteSettings({ site: { phone: '+33 6 11 11 11 11', whatsapp: '+225 07 00 00 00 00' } })
    expect(settings.whatsapp).toBe('+225 07 00 00 00 00')
    expect(toSiteSettings({ site: { phone: '+33 6 11 11 11 11' } }).whatsapp).toBe('')
  })
})

describe('toAdmissionDocumentsState', () => {
  const orderId = '11111111-2222-3333-4444-555555555555'

  it('une pièce envoyée s\'ouvre par le BFF, jamais par une adresse du stockage public', () => {
    const state = toAdmissionDocumentsState({ order_id: orderId, id_document_path: 'client-documents/u/o/passeport.pdf', transcripts_path: null })

    expect(state.idDocumentUrl).toBe(`/api/bff/admission/documents/file?orderId=${orderId}&type=id_document`)
    expect(state.idDocumentUrl).not.toContain('storage')
    expect(state.transcriptsUrl).toBeNull()
  })

  it('rien d\'envoyé : état vide, dossier ouvert', () => {
    expect(toAdmissionDocumentsState(null)).toMatchObject({ locked: false, idDocumentUrl: null, recommendationUrl: null })
  })
})
