/**
 * Compte et session.
 *
 * Le contrat décrit ce dont l'application a besoin, pas ce que l'API renvoie :
 * `/auth/login` répond `{ access_token, user: { profile: { first_name … } } }`,
 * avec des champs absents une fois sur deux. La normalisation est dans
 * `core/adapters/session.adapter.ts`.
 *
 * ⚠️ `Session` porte le jeton : **elle ne doit jamais franchir le BFF**. Les
 * routes Nitro déposent le jeton dans le cookie `httpOnly` et ne renvoient au
 * navigateur qu'un `AuthOutcome`, qui n'en contient pas.
 */

export interface UserProfile {
  firstName: string
  lastName: string
  photo: string | null
  phone: string | null
  city: string | null
}

export interface User {
  id: string
  email: string
  /** Nom d'affichage. Repli sur `prénom nom`, puis sur la partie locale de l'e-mail. */
  name: string
  role: string
  /** Faux tant que le code reçu par e-mail n'a pas été saisi. */
  isActivated: boolean
  avatar: string | null
  profile: UserProfile
  /** Langue enregistrée sur le compte (`settings.language`), quand elle existe. */
  locale: string | null
}

/** Ce que produit une authentification réussie, côté serveur uniquement. */
export interface Session {
  token: string
  user: User
}

/**
 * Ce que le navigateur reçoit après une authentification.
 *
 * Pas de jeton : il est parti dans le cookie `httpOnly`. `pendingPayment` évite
 * un aller-retour supplémentaire pour savoir s'il faut reprendre un paiement.
 */
export interface AuthOutcome {
  user: User
  /** Une intention de paiement attend d'être reprise. */
  pendingPayment: boolean
}

/**
 * Résultat d'une authentification tierce.
 *
 * `/auth/social/register` a trois issues, pas deux : succès, échec, ou
 * « cet e-mail existe déjà, confirmez la liaison ». La troisième doit remonter
 * jusqu'à l'écran, qui pose la question.
 */
export interface SocialLinkRequest {
  email: string
  provider: SocialProvider
  /** Fournisseurs déjà rattachés au compte. Vide = compte créé par mot de passe. */
  existingProviders: string[]
}

export interface SocialAuthOutcome {
  /** `null` quand une confirmation de liaison est demandée. */
  outcome: AuthOutcome | null
  linkRequest: SocialLinkRequest | null
}

export type SocialProvider = 'google' | 'facebook' | 'linkedin'
