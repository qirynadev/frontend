export default defineI18nConfig(() => ({
  legacy: false,
  /**
   * Formats de date.
   *
   * Sans eux, `d(date, 'long')` renvoie une **chaîne vide** — silencieusement.
   * C'est ce qui vidait la ligne « Date de paiement » des deux écrans de
   * succès, sans la moindre erreur en console.
   *
   * ⚠️ **Pas d'heure.** La maquette affiche « 2 juillet 2026 à 17:31 », mais
   * l'API renvoie `created_at` au format `JJ/MM/AAAA` : l'heure n'existe pas
   * en amont. L'afficher voudrait dire l'inventer.
   */
  datetimeFormats: {
    fr: {
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    },
    en: {
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    },
  },
  // Les prix sont administrés en euros, quelle que soit la langue affichée :
  // seule la mise en forme change (« 1 499 € » / « €1,499 »).
  numberFormats: {
    fr: {
      currency: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
      decimal: { style: 'decimal' },
    },
    en: {
      currency: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
      decimal: { style: 'decimal' },
    },
  },
}))
