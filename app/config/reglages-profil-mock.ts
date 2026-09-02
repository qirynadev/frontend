/**
 * Informations personnelles — repli Figma (node `1553:1020`) quand la session
 * n’a pas encore le champ. Pas d’endpoint de mise à jour profil exposé :
 * formulaire local uniquement. Doc : `docs/reglages-profil-mocks.md`.
 */
export const reglagesProfilMock = {
  firstName: 'Doungnan',
  lastName: 'Coulibaly',
  email: 'doungnan.coulibaly@example.com',
  phone: '+33 6 12 34 56 78',
  birthDate: '12 mai 1992',
  country: 'France',
  city: 'Lyon',
} as const
