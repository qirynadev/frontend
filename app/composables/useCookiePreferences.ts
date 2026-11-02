/**
 * Brouillon des préférences cookies : mesure d'audience et marketing, séparés.
 * La catégorie fonctionnelle n'est pas déposée sur Qiryna.
 */
export function useCookiePreferences() {
  const { choice, choose } = useCookieConsent()
  const audience = ref(consentAllows(choice.value, 'measure'))
  const marketing = ref(consentAllows(choice.value, 'marketing'))
  const saved = ref(false)

  watch(choice, (value) => {
    audience.value = consentAllows(value, 'measure')
    marketing.value = consentAllows(value, 'marketing')
  })

  function save() {
    choose(audience.value, marketing.value)
    saved.value = true
  }

  function rejectAll() {
    audience.value = false
    marketing.value = false
    save()
  }

  return { audience, marketing, saved, save, rejectAll }
}
