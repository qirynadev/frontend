import type { LegalNoticeTexts } from '~~/app/core/contracts'

/** Textes de la page Mentions légales, administrés dans le back-office. */
export default defineEventHandler(async (event): Promise<LegalNoticeTexts> => {
  const { legalNotice } = await getSnapshot(event)

  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  // Un instantané encore en cache au déploiement n'a pas ce champ.
  return legalNotice ?? {}
})
