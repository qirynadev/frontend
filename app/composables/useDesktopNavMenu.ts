import type { DesktopNavSectionId } from '~/config/desktop-navigation'

/**
 * Ouvre un sous-menu de la topbar depuis un CTA (ex. « Explorer les langues »).
 */
export function useDesktopNavMenu() {
  const openId = useState<DesktopNavSectionId | null>('desktop-nav-menu', () => null)

  function open(id: DesktopNavSectionId) {
    openId.value = id
    if (!import.meta.client) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function close() {
    openId.value = null
  }

  return { openId, open, close }
}
