/** Bandeau Offres de Logement par pays — formules Comoé / Volga / Yukon communes.
 *  Stats & headline Figma (France) ; le drapeau suit le pays choisi. */
const FRANCE = {
  headline: 'Un logement étudiant accessible, bien desservi',
  stats: [
    { value: '1 mois', label: 'de caution' },
    { value: '9 à 12 mois', label: 'durée du bail' },
    { value: '50 € à 120 €', label: 'de charges' },
    { value: '559 €', label: 'loyer moyen' },
  ],
};

export const LOGEMENT_OFFRES = {
  france: { flag: 'flag-fr.png', ...FRANCE },
  canada: { flag: 'flag-ca.png', ...FRANCE },
  allemagne: { flag: 'flag-de.png', ...FRANCE },
  chine: { flag: 'flag-cn.png', ...FRANCE },
  angleterre: { flag: 'flag-gb.png', ...FRANCE },
  usa: { flag: 'flag-us.png', ...FRANCE },
};

export function getLogementOffre(pays) {
  return LOGEMENT_OFFRES[pays] || LOGEMENT_OFFRES.france;
}
