/**
 * Lien de conversation WhatsApp, `null` sans numéro exploitable. `wa.me` attend
 * l'indicatif et le numéro, chiffres seuls : `+33 6 23…` et `0033 6 23…` donnent
 * tous deux `33623…`.
 */
export function whatsappLink(number: string | null | undefined): string | null {
  const digits = (number ?? '').replace(/\D/g, '').replace(/^00/, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** Lien d'appel : chiffres, avec le « + » de l'indicatif s'il y en a un. */
export function phoneLink(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`
}
