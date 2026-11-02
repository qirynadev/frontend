import { legalNoticeRepo } from '~/core/repositories'
import { useCatalogStore } from '~/core/stores'
import { phoneLink, whatsappLink } from '~/utils/contact-links'

export interface LegalNoticeView {
  /** Texte administré, sinon celui des traductions du site. */
  text: (key: string) => string
  /** `true` tant que l'équipe n'a rien saisi : le site affiche son texte d'attente. */
  pending: (key: string) => boolean
  whatsappNumber: () => string | null
  whatsappHref: () => string | null
  hostPhoneHref: () => string
}

/**
 * Page Mentions légales, administrée dans le back-office. Le numéro WhatsApp vient
 * des paramètres du site, pour n'avoir à le saisir qu'une fois. Des fonctions
 * plutôt que des `computed` : l'objet est transmis tel quel à l'écran ordinateur,
 * où un `computed` imbriqué ne serait pas déballé dans le gabarit.
 */
export async function useLegalNotice(): Promise<LegalNoticeView> {
  const { t, locale } = useI18n()
  const catalog = useCatalogStore()
  if (!catalog.isReady) await catalog.load()

  const { data } = await usePageData('legal-notice', () => legalNoticeRepo.get(locale.value), { watch: [locale] })

  const text = (key: string) => data.value?.[key] ?? t(`settingsLegalNotice.${key}`)
  const whatsappHref = () => whatsappLink(catalog.settings?.whatsapp)

  return {
    text,
    pending: (key) => data.value?.[key] === undefined,
    whatsappNumber: () => (whatsappHref() ? catalog.settings?.whatsapp ?? null : null),
    whatsappHref,
    hostPhoneHref: () => phoneLink(text('hostPhone')),
  }
}
