import { describe, expect, it } from 'vitest'
import { toPageContent } from '~/core/adapters/page-content.adapter'
import { toCourseSummary } from '~/core/adapters/course.adapter'
import { toLivingDestination } from '~/core/adapters/living.adapter'
import { pageIcon, pageListText, pageText } from '~/utils/page-content'

const url = (picto: string) => `https://admin.test/page-icons/${picto}/bleu.svg?v=1`

const raw = {
  page_texts: {
    heading: "Maîtrisez *l'anglais*",
    badge: '   ',
    pains: ['Pas de garant', null, 42],
    path: [{ title: '1. Testez-vous', text: '' }, { title: null, text: null }],
  },
  icons: {
    path: [{ picto: 'video', tint: 'bleu', url: url('video') }, null],
    engage: [{ picto: 'heart' }],
  },
  hero_image: 'https://admin.test/storage/photos/courses/portrait.jpg',
}

describe('contenu de page administrable (2026-10-14)', () => {
  it('lit textes, listes, blocs, icônes et photo', () => {
    const page = toPageContent(raw)

    expect(pageText(page, 'heading')).toBe("Maîtrisez *l'anglais*")
    expect(pageListText(page, 'pains', 0)).toBe('Pas de garant')
    expect(pageListText(page, 'path', 0, 'title')).toBe('1. Testez-vous')
    expect(pageIcon(page, 'path', 0)).toBe(url('video'))
    expect(page.heroImage).toBe(raw.hero_image)
  })

  it('tout ce qui est vide, absent ou mal formé vaut null : le site garde son défaut', () => {
    const page = toPageContent(raw)

    expect(pageText(page, 'badge')).toBeNull()
    expect(pageText(page, 'inconnu')).toBeNull()
    expect(pageListText(page, 'pains', 2)).toBeNull()
    expect(pageListText(page, 'path', 0, 'text')).toBeNull()
    expect(pageListText(page, 'heading', 0)).toBeNull()
    expect(pageIcon(page, 'path', 1)).toBeNull()
    // Icône sans URL : jamais d'image cassée.
    expect(pageIcon(page, 'engage', 0)).toBeNull()
  })

  it('une API sans ces champs, ou un contenu absent, ne lève pas', () => {
    const page = toPageContent({})

    expect(page).toEqual({ texts: {}, icons: {}, heroImage: null })
    expect(pageText(undefined, 'heading')).toBeNull()
    expect(pageListText(null, 'path', 0, 'title')).toBeNull()
    expect(pageIcon(undefined, 'path', 0)).toBeNull()
  })

  it('accompagne la langue et le pays du logement', () => {
    expect(pageText(toCourseSummary({ ...raw, language: 'Anglais', slug: 'anglais' }).page, 'heading')).toBe("Maîtrisez *l'anglais*")
    expect(toLivingDestination({ ...raw, slug: 'france' }).page.heroImage).toBe(raw.hero_image)
  })
})
