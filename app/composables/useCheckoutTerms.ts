let settle: ((accepted: boolean) => void) | null = null

/**
 * Acceptation des conditions générales avant tout paiement (2026-11-02). Une seule
 * fenêtre pour tout le site (`CheckoutTermsDialog`, montée dans `app.vue`), ouverte
 * par `useCheckout` : les boutons d'achat sont répartis sur une dizaine d'écrans.
 * L'horodatage est posé sur la commande par le back-office.
 */
export function useCheckoutTerms() {
  const open = useState('checkout-terms-open', () => false)

  /** Ouvre la fenêtre ; résolue à `true` si le client coche et continue. */
  function ask(): Promise<boolean> {
    settle?.(false)
    open.value = true
    return new Promise((resolve) => {
      settle = resolve
    })
  }

  function answer(accepted: boolean) {
    open.value = false
    settle?.(accepted)
    settle = null
  }

  return { open, ask, answer }
}
