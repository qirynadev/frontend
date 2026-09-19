/**
 * Brouillon des préférences cookies (binaire : audience = analytics).
 * Les catégories fonctionnelles / pub ne sont pas déposées sur Qiryna.
 */
export function useCookiePreferences() {
  const { choice, accept, decline } = useCookieConsent()
  const audience = ref(choice.value === 'accepted')
  const saved = ref(false)

  watch(choice, (value) => {
    audience.value = value === 'accepted'
  })

  function persist(next: boolean) {
    audience.value = next
    if (next) accept()
    else decline()
    saved.value = true
  }

  function save() {
    persist(audience.value)
  }

  function rejectAll() {
    persist(false)
  }

  return { audience, saved, save, rejectAll }
}
