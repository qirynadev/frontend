/**
 * Options de page propres à Qiryna, déclarées via `definePageMeta`.
 *
 * Les typer ici évite qu'une faute de frappe passe inaperçue : `bottomNav`
 * mal orthographié serait silencieusement ignoré par le layout.
 */
declare module '#app' {
  interface PageMeta {
    /**
     * Affiche la barre de navigation basse. `true` par défaut.
     *
     * À passer à `false` pour un tunnel de paiement ou un écran plein cadre.
     */
    bottomNav?: boolean
    /**
     * Fond du shell. `white` par défaut.
     *
     * Deux écrans de la maquette teintent l'écran entier plutôt que leurs
     * blocs : `langues-post-payment.html` (`.page-lpp { background: #faf9fe }`)
     * et `mon-projet.html`. Le déclarer ici plutôt que dans la page évite un
     * `<div>` pleine hauteur qui se battrait avec le fond du layout.
     */
    shellBackground?: 'white' | 'tint'
  }
}

export {}
