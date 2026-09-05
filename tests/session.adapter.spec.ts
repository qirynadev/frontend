import { describe, expect, it } from 'vitest'
import { toSession, toSocialAuthResult, toUser, toUserProfile } from '~/core/adapters/session.adapter'

/**
 * Charge utile réelle de `POST /auth/login`, relevée sur la recette
 * (`legacy/API_OAUTH_ENDPOINTS.md` § 1, réponse 200).
 */
const rawLogin = {
  access_token: '1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  user: {
    id: '9b8c7e6d-5f4a-3b2c-1d0e-9f8e7d6c5b4a',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'client',
    is_activated: true,
    created_at: '13/01/2026',
    profile: {
      id: '8a7b6c5d',
      first_name: 'John',
      last_name: 'Doe',
      photo: 'https://lh3.googleusercontent.com/a/avatar.jpg',
      role: 'client',
      phone: null,
      sex: null,
      birthday: null,
      city: null,
      address: null,
    },
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    settings: { language: 'fr' },
  },
}

describe('réponse nominale', () => {
  it('extrait le jeton et l’utilisateur', () => {
    const session = toSession(rawLogin)

    expect(session?.token).toBe('1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    expect(session?.user.email).toBe('user@example.com')
    expect(session?.user.name).toBe('John Doe')
    expect(session?.user.isActivated).toBe(true)
    expect(session?.user.locale).toBe('fr')
    expect(session?.user.profile.firstName).toBe('John')
  })

  it('accepte `token` comme `access_token`', () => {
    expect(toSession({ token: 'abc', user: { email: 'a@b.c' } })?.token).toBe('abc')
  })
})

describe('champ manquant', () => {
  it('ne lève sur aucune forme d’entrée', () => {
    for (const input of [null, undefined, 42, 'texte', [], {}]) {
      expect(() => toUser(input)).not.toThrow()
      expect(() => toUserProfile(input)).not.toThrow()
    }
    expect(toUser(null).email).toBe('')
  })

  it('recompose le nom depuis le profil quand `name` est absent', () => {
    // Cas des comptes créés par OAuth : `name` n’est pas renseigné.
    const user = toUser({ email: 'awa@example.com', profile: { first_name: 'Awa', last_name: 'Diallo' } })
    expect(user.name).toBe('Awa Diallo')
  })

  it('retombe sur la partie locale de l’e-mail en dernier recours', () => {
    expect(toUser({ email: 'awa.diallo@example.com' }).name).toBe('awa.diallo')
  })

  it('donne un profil complet même quand `profile` vaut null', () => {
    expect(toUser({ email: 'a@b.c', profile: null }).profile).toEqual({
      firstName: '',
      lastName: '',
      photo: null,
      phone: null,
      city: null,
      birthday: null,
      country: null,
    })
  })

  it('laisse `locale` à null plutôt que de forcer le français', () => {
    // Forcer un repli ici basculerait un anglophone en français à chaque connexion.
    expect(toUser({ email: 'a@b.c' }).locale).toBeNull()
    expect(toUser({ email: 'a@b.c', settings: { language: '' } }).locale).toBeNull()
  })

  it('accepte `is_activated` en 0/1', () => {
    expect(toUser({ is_activated: 1 }).isActivated).toBe(true)
    expect(toUser({ is_activated: 0 }).isActivated).toBe(false)
    expect(toUser({}).isActivated).toBe(false)
  })

  it('ramène un avatar vide à null', () => {
    expect(toUser({ avatar: '' }).avatar).toBeNull()
  })
})

/**
 * Charge utile réelle de `GET /user/me` (`ProfileResource`), relevée en
 * direct sur la recette (2026-08-30) — forme inversée de `rawLogin` :
 * prénom/nom/photo en racine, `user` imbriqué porte email/nom/rôle.
 */
const rawProfileMe = {
  id: 'c9f3797e-5f32-4afa-bb73-d3d709978d62',
  last_name: 'SEMEVO',
  first_name: 'Victor',
  full_name: 'Victor SEMEVO',
  phone: null,
  role: 'admin',
  photo: 'https://ui-avatars.com/api/?name=SEMEVO+Victor',
  city: null,
  user: {
    id: '275f803e-a0f5-45f5-9a99-6780a000392f',
    email: 'sessouv@gmail.com',
    name: 'Victor SEMEVO',
    is_activated: 1,
    role: 'admin',
  },
}

describe('forme `/user/me` (ProfileResource, `user` imbriqué)', () => {
  it('lit e-mail/nom/rôle depuis `user`, pas la racine', () => {
    const user = toUser(rawProfileMe)

    expect(user.id).toBe('275f803e-a0f5-45f5-9a99-6780a000392f')
    expect(user.email).toBe('sessouv@gmail.com')
    expect(user.name).toBe('Victor SEMEVO')
    expect(user.role).toBe('admin')
    expect(user.isActivated).toBe(true)
  })

  it('lit le profil depuis la racine, pas `.profile`', () => {
    expect(toUser(rawProfileMe).profile).toMatchObject({ firstName: 'Victor', lastName: 'SEMEVO' })
  })

  it('retombe sur la photo du profil sans `avatar` dédié', () => {
    expect(toUser(rawProfileMe).avatar).toBe('https://ui-avatars.com/api/?name=SEMEVO+Victor')
  })
})

describe('cas dégradé', () => {
  it('refuse une session sans jeton', () => {
    // Une réponse 200 sans `access_token` (compte désactivé) produirait sinon un
    // utilisateur « connecté » incapable du moindre appel authentifié.
    expect(toSession({ user: { email: 'a@b.c' } })).toBeNull()
    expect(toSession(null)).toBeNull()
    expect(toSession({ access_token: '' })).toBeNull()
  })
})

describe('authentification tierce', () => {
  it('ouvre la session quand le fournisseur est accepté', () => {
    const result = toSocialAuthResult(rawLogin, 'google')

    expect(result.linkRequest).toBeNull()
    expect(result.session?.user.email).toBe('user@example.com')
  })

  it('remonte la demande de liaison au lieu d’un échec', () => {
    // Troisième issue de `/auth/social/register` : l’e-mail existe déjà.
    const result = toSocialAuthResult(
      {
        requires_confirmation: true,
        data: { email: 'user@example.com', provider: 'facebook', existing_providers: ['google'] },
      },
      'facebook',
    )

    expect(result.session).toBeNull()
    expect(result.linkRequest).toEqual({
      email: 'user@example.com',
      provider: 'facebook',
      existingProviders: ['google'],
    })
  })

  it('retombe sur le fournisseur demandé quand la réponse ne le nomme pas', () => {
    const result = toSocialAuthResult({ requires_confirmation: true, data: { email: 'a@b.c' } }, 'linkedin')

    expect(result.linkRequest?.provider).toBe('linkedin')
    expect(result.linkRequest?.existingProviders).toEqual([])
  })

  it('écarte les fournisseurs non textuels de la liste', () => {
    const result = toSocialAuthResult(
      { requires_confirmation: true, data: { email: 'a@b.c', existing_providers: ['google', null, 7] } },
      'google',
    )

    expect(result.linkRequest?.existingProviders).toEqual(['google'])
  })
})
