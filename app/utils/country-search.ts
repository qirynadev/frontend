import type { Country } from '~/core/contracts'

/**
 * Recherche de pays pour les sélecteurs « pays » et « indicatif ».
 *
 * Un `<select>` natif de 245 pays oblige à dérouler toute la liste ; on
 * cherche ici par saisie, dans l'ordre où l'on pense à un pays : son nom
 * (« cote » trouve « Côte d'Ivoire »), un mot de son nom (« ivoire »), son
 * code ISO (« ci ») ou son indicatif (« 225 », « +225 »).
 */

/** Minuscules sans accents : « Côte » et « cote » doivent se rejoindre. */
export function normaliserRecherche(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Drapeau emoji déduit du code ISO (`FR` → 🇫🇷).
 *
 * Une `<option>` n'accepte pas d'image, et l'API ne fournit pas l'URL du
 * drapeau sur cette route : l'emoji s'affiche partout sur mobile. Certains
 * Windows le rendent en deux lettres — limite du système, pas du code.
 */
export function drapeauEmoji(code: string | null): string {
  if (!code || code.length !== 2) return ''
  return [...code.toUpperCase()]
    .map((lettre) => String.fromCodePoint(127397 + lettre.charCodeAt(0)))
    .join('')
}

/**
 * Filtre et classe les pays pour une saisie.
 *
 * Une saisie faite de chiffres (avec ou sans `+`) vise un indicatif : exact
 * d'abord (« 1 » place les États-Unis avant « 1242 »), puis par préfixe.
 * Sinon on vise un nom : code ISO exact, puis début du nom, puis début d'un
 * mot, puis n'importe où. À score égal, l'ordre alphabétique départage.
 */
export function rechercherPays(pays: readonly Country[], saisie: string, locale = 'fr'): Country[] {
  const requete = normaliserRecherche(saisie)
  const alphabetique = (a: Country, b: Country) => a.name.localeCompare(b.name, locale)
  if (!requete) return [...pays].sort(alphabetique)

  const viseIndicatif = /^\+?\d[\d\s.-]*$/.test(requete)
  const chiffres = requete.replace(/\D/g, '')
  const retenus: { pays: Country, score: number }[] = []

  for (const candidat of pays) {
    let score = -1

    if (viseIndicatif) {
      if (candidat.phoneCode === chiffres) score = 0
      else if (candidat.phoneCode?.startsWith(chiffres)) score = 1
    }
    else {
      const nom = normaliserRecherche(candidat.name)
      const iso = (candidat.code ?? '').toLowerCase()
      if (iso !== '' && iso === requete) score = 0
      else if (nom.startsWith(requete)) score = 1
      else if (nom.split(/[\s'’-]+/).some((mot) => mot.startsWith(requete))) score = 2
      else if (nom.includes(requete)) score = 3
    }

    if (score >= 0) retenus.push({ pays: candidat, score })
  }

  return retenus
    .sort((a, b) => a.score - b.score || alphabetique(a.pays, b.pays))
    .map((entree) => entree.pays)
}
