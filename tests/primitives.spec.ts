import { describe, expect, it, vi } from 'vitest'
import {
  asArray,
  asRecord,
  bool,
  decodeEntities,
  dedupeBySlug,
  dig,
  isRecord,
  list,
  num,
  optionalNum,
  optionalStr,
  plainText,
  str,
  toIsoDate,
  toUrl,
} from '~/core/adapters/primitives'

describe('navigation défensive', () => {
  it('ne lève jamais sur une valeur inattendue', () => {
    for (const value of [null, undefined, 42, 'texte', [], true]) {
      expect(() => str(value, 'a.b.c')).not.toThrow()
      expect(str(value, 'a.b.c')).toBe('')
      expect(num(value, 'a.b.c')).toBe(0)
      expect(list(value, 'a.b.c')).toEqual([])
    }
  })

  it('distingue un objet navigable d’un tableau ou de null', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord([1])).toBe(false)
    expect(isRecord(null)).toBe(false)
    expect(asRecord('nope')).toEqual({})
    expect(asArray('nope')).toEqual([])
  })

  it('descend un chemin imbriqué', () => {
    expect(dig({ country: { iso_alpha_2: 'FR' } }, 'country.iso_alpha_2')).toBe('FR')
    expect(dig({ country: null }, 'country.iso_alpha_2')).toBeUndefined()
  })
})

describe('str / num / bool', () => {
  it('rogne les espaces et convertit les nombres', () => {
    expect(str({ a: '  Paris ' }, 'a')).toBe('Paris')
    expect(str({ a: 108 }, 'a')).toBe('108')
    expect(str({ a: null }, 'a', 'repli')).toBe('repli')
  })

  it('accepte un nombre transmis en chaîne', () => {
    expect(num({ n: '108' }, 'n')).toBe(108)
    expect(num({ n: 'huit' }, 'n', -1)).toBe(-1)
    expect(num({ n: Number.NaN }, 'n', -1)).toBe(-1)
  })

  it('renvoie null pour les champs réellement optionnels', () => {
    expect(optionalStr({ a: '' }, 'a')).toBeNull()
    expect(optionalStr({ a: 'x' }, 'a')).toBe('x')
    expect(optionalNum({ a: null }, 'a')).toBeNull()
    expect(optionalNum({ a: 0 }, 'a')).toBe(0)
  })

  it('interprète les booléens laxistes de l’API', () => {
    expect(bool({ a: 1 }, 'a')).toBe(true)
    expect(bool({ a: '0' }, 'a')).toBe(false)
    expect(bool({ a: 'true' }, 'a')).toBe(true)
    expect(bool({ a: undefined }, 'a', true)).toBe(true)
  })
})

describe('toIsoDate', () => {
  it('convertit le format JJ/MM/AAAA du back-office', () => {
    expect(toIsoDate('13/01/2026')).toBe('2026-01-13')
    expect(toIsoDate('16/08/2024')).toBe('2024-08-16')
  })

  it('accepte une date déjà ISO', () => {
    expect(toIsoDate('2024-08-16T10:00:00Z')).toBe('2024-08-16')
  })

  it('ignore l’heure que `/payment/list` ajoute au format JJ/MM/AAAA', () => {
    // Sans le suffixe optionnel, `new Date('12/08/2026 22:35')` lit `12/08`
    // en `MM/JJ` et renvoie le 8 décembre — faux, pas juste imprécis.
    expect(toIsoDate('16/08/2026 16:39')).toBe('2026-08-16')
    expect(toIsoDate('12/08/2026 22:35')).toBe('2026-08-12')
    expect(toIsoDate('08/08/2026 11:24:05')).toBe('2026-08-08')
  })

  it('refuse une date impossible plutôt que de la reporter', () => {
    expect(toIsoDate('31/02/2024')).toBeNull()
  })

  it('renvoie null sur tout le reste', () => {
    expect(toIsoDate('')).toBeNull()
    expect(toIsoDate(null)).toBeNull()
    expect(toIsoDate('bientôt')).toBeNull()
  })
})

describe('plainText / decodeEntities', () => {
  it('retire les balises et décode les entités', () => {
    expect(plainText('<p>Bonjour&nbsp;<strong>Marie</strong>&nbsp;!</p>')).toBe('Bonjour Marie !')
    expect(decodeEntities('caf&eacute; &amp; th&#233;')).toBe('café & thé')
  })

  it('coupe sur un mot entier', () => {
    const text = plainText('<p>Étudier en France, c’est faire le choix de l’excellence universitaire</p>', 30)
    expect(text.endsWith('…')).toBe(true)
    expect(text.length).toBeLessThanOrEqual(31)
    expect(text).not.toContain('  ')
  })

  it('renvoie une chaîne vide sur une entrée non textuelle', () => {
    expect(plainText(null)).toBe('')
    expect(plainText(undefined, 50)).toBe('')
  })
})

describe('toUrl', () => {
  it('accepte les URL absolues et les chemins racine', () => {
    expect(toUrl('https://admin.stage.qiryna.com/a.png')).toBe('https://admin.stage.qiryna.com/a.png')
    expect(toUrl('/storage/a.png')).toBe('/storage/a.png')
  })

  it('préfère null à une image cassée', () => {
    expect(toUrl('')).toBeNull()
    expect(toUrl('   ')).toBeNull()
    expect(toUrl('photos/a.png')).toBeNull()
    expect(toUrl(null)).toBeNull()
    expect(toUrl(42)).toBeNull()
  })
})

describe('dedupeBySlug', () => {
  const items = [
    { id: 'b', slug: 'universite-lille' },
    { id: 'a', slug: 'hec-paris' },
    { id: 'a2', slug: 'universite-lille' },
    { id: 'c', slug: 'insead' },
  ]

  it('retient la première entrée par id croissant, pas la première rencontrée', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = dedupeBySlug(items, 'écoles')
    warn.mockRestore()

    expect(result.map((item) => item.id)).toEqual(['a', 'a2', 'c'])
    expect(result.filter((item) => item.slug === 'universite-lille')).toHaveLength(1)
  })

  it('est déterministe quel que soit l’ordre de la réponse', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const forward = dedupeBySlug(items, 'écoles').map((i) => i.id).sort()
    const backward = dedupeBySlug([...items].reverse(), 'écoles').map((i) => i.id).sort()
    warn.mockRestore()

    expect(forward).toEqual(backward)
  })

  it('journalise la collision en développement', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    dedupeBySlug(items, 'écoles de « france »')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('collision(s) de slug')
    warn.mockRestore()
  })

  it('reste silencieux et intact quand il n’y a rien à faire', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const unique = [{ id: 'a', slug: 'x' }, { id: 'b', slug: 'y' }]
    expect(dedupeBySlug(unique, 'écoles')).toEqual(unique)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('préserve l’ordre d’origine de la liste', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = dedupeBySlug(
      [{ id: 'z', slug: 'c' }, { id: 'm', slug: 'a' }, { id: 'n', slug: 'b' }],
      'écoles',
    )
    warn.mockRestore()
    expect(result.map((item) => item.slug)).toEqual(['c', 'a', 'b'])
  })
})
