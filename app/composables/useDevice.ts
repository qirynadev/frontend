/**
 * Détection d'appareil — **`matchMedia` uniquement, jamais le user-agent**.
 *
 * Le user-agent est peu fiable et le restera : un iPad se déclare macOS, un
 * portable tactile se déclare desktop, et surtout un user-agent ne bouge pas
 * quand l'utilisateur redimensionne sa fenêtre. `matchMedia` répond à la seule
 * question qui compte : « de quelle largeur dispose-t-on maintenant ? ».
 *
 * ⚠️ **Ne jamais s'en servir pour choisir quoi rendre côté serveur.** Au premier
 * rendu SSR, aucune largeur n'est connue : ces valeurs partent à `false` et ne
 * deviennent justes qu'après hydratation. Un `v-if="isDesktop"` autour de
 * structures différentes provoquerait un décalage d'hydratation.
 *
 * - **Mise en page** → breakpoints CSS Tailwind (`shell:`), qui fonctionnent
 *   sans JavaScript et sans décalage.
 * - **Comportement JavaScript** → ce composable (ouvrir une bottom sheet plutôt
 *   qu'une modale, activer un carrousel tactile, etc.).
 */

/**
 * Rupture mobile → tablette, en pixels.
 *
 * Doit rester alignée sur `--breakpoint-shell` dans `app/assets/css/main.css` :
 * c'est la même frontière, exprimée une fois en CSS et une fois en JS. Le
 * contrôle de dérive ci-dessous le vérifie en développement.
 */
export const SHELL_BREAKPOINT = 768

export interface DeviceState {
  /** Largeur strictement inférieure à la rupture shell. `false` en SSR. */
  isMobile: Readonly<Ref<boolean>>
  /** Largeur supérieure ou égale à la rupture shell. `false` en SSR. */
  isDesktop: Readonly<Ref<boolean>>
  /**
   * `false` tant que le composant n'est pas monté.
   *
   * À utiliser pour n'activer un comportement dépendant de la largeur qu'une
   * fois l'hydratation faite : `v-if="isHydrated && isDesktop"`.
   */
  isHydrated: Readonly<Ref<boolean>>
}

export function useDevice(): DeviceState {
  const isMobile = useMediaQuery(`(max-width: ${SHELL_BREAKPOINT - 1}px)`)
  const isDesktop = useMediaQuery(`(min-width: ${SHELL_BREAKPOINT}px)`)
  const isHydrated = useMounted()

  if (import.meta.dev && import.meta.client) {
    onMounted(assertBreakpointsAligned)
  }

  return { isMobile, isDesktop, isHydrated }
}

/**
 * Alerte si le token CSS et la constante JS ont divergé.
 *
 * Le cas est silencieux et coûteux à diagnostiquer : la mise en page basculerait
 * à une largeur et le comportement JavaScript à une autre.
 */
function assertBreakpointsAligned(): void {
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-shell')
    .trim()

  if (declared === '') return
  const parsed = Number.parseInt(declared, 10)
  if (Number.isNaN(parsed) || parsed === SHELL_BREAKPOINT) return

  // eslint-disable-next-line no-console -- signal destiné aux développeurs
  console.warn(
    `[qiryna:useDevice] Rupture désalignée : --breakpoint-shell vaut ${declared} `
    + `mais SHELL_BREAKPOINT vaut ${SHELL_BREAKPOINT}px. `
    + 'La mise en page et le comportement JS basculeraient à deux largeurs différentes.',
  )
}
