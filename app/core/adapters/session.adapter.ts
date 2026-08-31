import type { Session, SocialLinkRequest, SocialProvider, User, UserProfile } from '../contracts'
import { asArray, asRecord, bool, optionalStr, str } from './primitives'

/**
 * Ce que l'adaptation d'une authentification tierce produit **côté serveur**.
 *
 * Distinct de `SocialAuthOutcome` (le contrat client) sur un point qui compte :
 * il porte le jeton. Il ne quitte jamais Nitro — la route BFF le dépose dans le
 * cookie `httpOnly` et ne renvoie au navigateur que l'utilisateur.
 */
export interface SocialAuthResult {
  session: Session | null
  linkRequest: SocialLinkRequest | null
}

/**
 * Compte et session — couche anti-corruption.
 *
 * Défauts constatés sur `POST /auth/login` et `POST /auth/social/*` :
 *
 * | # | Constat | Traitement |
 * |---|---|---|
 * | 1 | `name` absent sur les comptes créés par OAuth | recomposé depuis `profile.first_name`/`last_name`, puis depuis l'e-mail |
 * | 2 | `profile` vaut `null` sur un compte fraîchement créé | objet complet, champs vides |
 * | 3 | `settings.language` absent ou `null` | `null`, jamais `'fr'` par défaut — l'appelant tranche |
 * | 4 | `is_activated` renvoyé tantôt en booléen, tantôt en `0`/`1` | `bool()` |
 * | 5 | `avatar` est parfois une chaîne vide | `null` |
 * | 6 | Le jeton s'appelle `access_token`, `token` selon l'endpoint | les deux sont lus |
 */

/** Nom d'affichage. L'API ne le renseigne pas toujours ; on ne renvoie jamais vide. */
function toDisplayName(source: Record<string, unknown>, profile: UserProfile, email: string): string {
  const given = str(source, 'name')
  if (given !== '') return given

  const composed = [profile.firstName, profile.lastName].filter((part) => part !== '').join(' ')
  if (composed !== '') return composed

  const local = email.split('@')[0] ?? ''
  return local
}

export function toUserProfile(raw: unknown): UserProfile {
  const source = asRecord(raw)
  return {
    firstName: str(source, 'first_name'),
    lastName: str(source, 'last_name'),
    photo: optionalStr(source, 'photo'),
    phone: optionalStr(source, 'phone'),
    city: optionalStr(source, 'city'),
  }
}

/**
 * Deux formes inversées pour « le compte connecté », découvert en direct
 * (2026-08-30, en préremplissant le formulaire de contact) :
 *
 * - `POST /auth/login|register|confirm|social/*` (`UserResource`) : email,
 *   nom, rôle, `is_activated` en **racine** ; `profile` imbriqué
 *   (prénom/nom/photo/téléphone).
 * - `GET /user/me` (`ProfileResource`, utilisé par `session.get.ts` pour
 *   ré-amorcer la session à chaque rendu serveur) : prénom/nom/photo en
 *   **racine** ; `user` imbriqué porte email/nom/rôle/`is_activated`.
 *
 * Sans cette distinction, `toUser()` ne lisait correctement que la première
 * forme — après un F5 ou tout rendu serveur qui repasse par `/user/me`,
 * `email`/`name`/`profile.firstName`/`profile.lastName` retombaient tous à
 * vide, silencieusement (aucune erreur, juste des champs vides).
 */
export function toUser(raw: unknown): User {
  const source = asRecord(raw)
  const nestedUser = asRecord(source.user)
  const isProfileShape = Object.keys(nestedUser).length > 0

  const account = isProfileShape ? nestedUser : source
  const profile = toUserProfile(isProfileShape ? source : source.profile)
  const email = str(account, 'email')

  return {
    id: str(account, 'id'),
    email,
    name: toDisplayName(account, profile, email),
    role: str(account, 'role', 'client'),
    isActivated: bool(account, 'is_activated', false),
    avatar: optionalStr(account, 'avatar') ?? profile.photo,
    profile,
    // Volontairement `null` plutôt que `'fr'` : l'appelant sait quelle langue
    // est affichée, l'adapter non. Forcer un repli ici basculerait un
    // anglophone en français à chaque connexion.
    locale: optionalStr(account, 'settings.language'),
  }
}

/**
 * Session complète, jeton compris.
 *
 * Renvoie `null` si le jeton manque : sans lui, aucun appel authentifié n'est
 * possible et laisser passer un utilisateur « connecté sans jeton » produirait
 * une cascade de 401.
 */
export function toSession(raw: unknown): Session | null {
  const source = asRecord(raw)
  const token = str(source, 'access_token') || str(source, 'token')
  if (token === '') return null

  return { token, user: toUser(source.user) }
}

/**
 * Réponse d'une authentification tierce.
 *
 * Trois issues, pas deux — la troisième est celle qu'on oublie : l'e-mail
 * existe déjà et le back-office demande de confirmer la liaison du fournisseur
 * au compte existant (`requires_confirmation`). Elle doit remonter jusqu'à
 * l'écran, qui pose la question ; la traiter comme un échec ferait boucler
 * l'utilisateur.
 */
export function toSocialAuthResult(raw: unknown, provider: SocialProvider): SocialAuthResult {
  const source = asRecord(raw)

  if (bool(source, 'requires_confirmation', false)) {
    const payload = asRecord(source.data)
    return {
      session: null,
      linkRequest: {
        email: str(payload, 'email'),
        provider: (str(payload, 'provider') || provider) as SocialProvider,
        existingProviders: asArray(payload.existing_providers).filter(
          (entry): entry is string => typeof entry === 'string',
        ),
      },
    }
  }

  return { session: toSession(source), linkRequest: null }
}
