import { describe, expect, it, vi } from 'vitest'
import { toCountry, toFeatureItems, toMenu, toPrice, toSeo, toSiteSettings } from '~/core/adapters/common.adapter'
import { toBannerList, toHomeContent, toPartnerList } from '~/core/adapters/home.adapter'
import { toPage, toPageList } from '~/core/adapters/page.adapter'
import { rawHome, rawMenu, rawPage, rawSettings } from './fixtures/all-data'

describe('toCountry', () => {
  it('unifie les deux formes renvoyées par l’API', () => {
    // Forme « destination ».
    expect(toCountry({ id: 73, name: 'France', iso_alpha_2: 'FR', international_phone: '33' })).toEqual({ id: '73', name: 'France', code: 'FR', phoneCode: '33', flag: null })
    // Forme « école ».
    expect(toCountry({ name: 'France' })).toEqual({ id: null, name: 'France', code: null, phoneCode: null, flag: null })
  })

  it('met le code en majuscules et supporte les alias', () => {
    expect(toCountry({ name: 'Chine', code: 'cn' }).code).toBe('CN')
    expect(toCountry({ name: 'Canada', iso: 'ca' }).code).toBe('CA')
  })

  it('remonte l’indicatif téléphonique quand l’API le fournit', () => {
    // `international_phone` alimente le sélecteur d’indicatif du profil.
    expect(toCountry({ name: 'Côte d’Ivoire', international_phone: '225' }).phoneCode).toBe('225')
    expect(toCountry({ name: 'France' }).phoneCode).toBeNull()
    // Ponctué côté API : seuls les chiffres comptent, sinon l'indicatif ne se
    // reconnaît plus dans un numéro déjà enregistré.
    expect(toCountry({ name: 'Antigua-et-Barbuda', international_phone: '1-268' }).phoneCode).toBe('1268')
  })

  it('ne lève pas sur une entrée absente', () => {
    expect(toCountry(null)).toEqual({ id: null, name: '', code: null, phoneCode: null, flag: null })
  })
})

describe('toPrice', () => {
  it('lit un montant en euros, jamais en centimes', () => {
    expect(toPrice({ amount: 1499, payment_type: 'unique' })).toEqual({ amount: 1499, currency: 'EUR', mode: 'once' })
  })

  it('retombe à zéro plutôt que sur NaN', () => {
    expect(toPrice({ amount: 'gratuit' }).amount).toBe(0)
    expect(toPrice(null).amount).toBe(0)
  })
})

describe('toFeatureItems', () => {
  it('conserve un item n’ayant qu’une description', () => {
    expect(toFeatureItems([{ title: null, description: 'Suivi hebdomadaire' }])).toHaveLength(1)
  })

  it('écarte les items entièrement vides et les entrées non objet', () => {
    expect(toFeatureItems([{ title: null, description: null }, 'oups', null])).toEqual([])
    expect(toFeatureItems('pas un tableau')).toEqual([])
  })

  it('considère un item inclus par défaut', () => {
    expect(toFeatureItems([{ title: 'Coaching' }])[0]?.included).toBe(true)
    expect(toFeatureItems([{ title: 'Option', included: false }])[0]?.included).toBe(false)
  })
})

describe('toSeo', () => {
  it('utilise les champs SEO du back-office quand ils existent', () => {
    const seo = toSeo({ seo_title: 'Titre SEO', seo_description: 'Description SEO' }, 'Repli', '<p>Contenu</p>')
    expect(seo).toEqual({ title: 'Titre SEO', description: 'Description SEO', image: null })
  })

  it('retombe sur le contenu débarrassé de son HTML', () => {
    const seo = toSeo({}, 'Université', '<p>Issue de la <strong>fusion</strong>&nbsp;de 2017</p>')

    expect(seo.title).toBe('Université')
    expect(seo.description).toBe('Issue de la fusion de 2017')
  })

  it('cherche l’image dans og_image, puis picture, puis image', () => {
    expect(toSeo({ picture: 'https://x.test/p.png' }, '', '').image).toBe('https://x.test/p.png')
    expect(toSeo({ image: 'https://x.test/i.png' }, '', '').image).toBe('https://x.test/i.png')
    expect(toSeo({}, '', '').image).toBeNull()
  })
})

describe('toMenu', () => {
  it('traduit les cinq sections', () => {
    const menu = toMenu(rawMenu)

    expect(menu.destinations.label).toBe('Fiche école')
    expect(menu.destinations.entries).toHaveLength(2)
    expect(menu.courses.entries[0]).toEqual({
      id: '0f1a201f-dc42-47ed-a8e6-ca08fb6ca47a',
      title: 'Français',
      slug: 'francais',
      badge: null,
    })
  })

  it('accepte les identifiants entiers du menu MBA', () => {
    expect(toMenu(rawMenu).mba.entries[0]?.id).toBe('1')
  })

  it('donne une section vide quand sub_menus est absent', () => {
    const menu = toMenu(rawMenu)

    expect(menu.profiling.label).toBe('Profilage')
    expect(menu.profiling.entries).toEqual([])
  })

  it('ne lève pas sur un menu absent', () => {
    const menu = toMenu(null)
    expect(menu.destinations.entries).toEqual([])
  })
})

describe('toSiteSettings', () => {
  it('normalise la casse des réseaux sociaux et écarte ceux sans URL', () => {
    const settings = toSiteSettings(rawSettings)

    expect(settings.socials.map((social) => social.name)).toEqual(['facebook', 'instagram'])
  })

  it('expose les locales administrées', () => {
    expect(toSiteSettings(rawSettings).locales).toEqual([
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ])
  })

  it('retombe sur des valeurs sûres', () => {
    const settings = toSiteSettings(null)

    expect(settings.name).toBe('Qiryna')
    expect(settings.socials).toEqual([])
    expect(settings.stripePublicKey).toBeNull()
    expect(settings.logoLight).toBeNull()
    expect(settings.logoDark).toBeNull()
    expect(settings.favicon).toBeNull()
  })

  // directives-backend §25 : logos et favicon téléversés dans les réglages.
  it('expose les deux logos et le favicon administrés', () => {
    const settings = toSiteSettings({
      site: {
        logo_light: 'https://admin.stage.qiryna.com/storage/photos/settings/logo.webp',
        logo_dark: 'https://admin.stage.qiryna.com/storage/photos/settings/logo-fond-dark.webp',
        favicon: 'https://admin.stage.qiryna.com/storage/photos/settings/ic-orientation-logo.webp',
      },
    })

    expect(settings.logoLight).toBe('https://admin.stage.qiryna.com/storage/photos/settings/logo.webp')
    // Fond sombre : pied de page desktop (2026-09-20).
    expect(settings.logoDark).toBe('https://admin.stage.qiryna.com/storage/photos/settings/logo-fond-dark.webp')
    expect(settings.favicon).toBe('https://admin.stage.qiryna.com/storage/photos/settings/ic-orientation-logo.webp')
  })

  it('traite un champ vide comme « rien de téléversé »', () => {
    const settings = toSiteSettings({ site: { logo_light: '', favicon: null } })

    expect(settings.logoLight).toBeNull()
    expect(settings.favicon).toBeNull()
  })
})

describe('toHomeContent', () => {
  it('écarte les diapositives sans image et les étapes sans titre', () => {
    const home = toHomeContent(rawHome)!

    expect(home.slides).toHaveLength(1)
    expect(home.steps).toHaveLength(1)
  })

  it('retombe sur le titre desktop quand le titre mobile est vide', () => {
    const home = toHomeContent(rawHome)!

    expect(home.blocks.mentors.mobileTitle).toBe('Des brillants mentors')
    expect(home.blocks.schools.mobileTitle).toBe('Focus écoles')
  })

  it('renvoie null plutôt qu’une coquille vide', () => {
    expect(toHomeContent(null)).toBeNull()
    expect(toHomeContent({})).toBeNull()
  })

  // Images des sections de l'accueil bureau (2026-09-23) : administrées
  // dans /cms/home, non traduites, servies sous `section_images`.
  it('expose les illustrations de section administrées', () => {
    const home = toHomeContent({
      ...(rawHome as Record<string, unknown>),
      section_images: {
        orientation: 'https://admin.stage.qiryna.com/storage/photos/home_page/sections/o.webp',
        schools: 'https://admin.stage.qiryna.com/storage/photos/home_page/sections/e.webp',
        languages: null,
        housing: '',
      },
    })!

    expect(home.sectionImages.orientation).toBe(
      'https://admin.stage.qiryna.com/storage/photos/home_page/sections/o.webp',
    )
    expect(home.sectionImages.schools).toBe(
      'https://admin.stage.qiryna.com/storage/photos/home_page/sections/e.webp',
    )
    // Rien de téléversé : l'écran garde le visuel de la maquette.
    expect(home.sectionImages.languages).toBeNull()
    expect(home.sectionImages.housing).toBeNull()
  })

  it('renvoie quatre illustrations nulles quand le back-office n’en sert pas', () => {
    const home = toHomeContent(rawHome)!

    expect(home.sectionImages).toEqual({
      orientation: null,
      schools: null,
      languages: null,
      housing: null,
    })
  })
})

describe('bandeaux et partenaires', () => {
  it('écarte un bandeau sans image', () => {
    const banners = toBannerList([
      { id: '1', title: 'Pub', picture: 'https://x.test/b.png', url: 'https://qiryna.com' },
      { id: '2', title: 'Sans visuel', picture: null },
    ])

    expect(banners).toHaveLength(1)
    expect(banners[0]?.url).toBe('https://qiryna.com')
  })

  it('écarte un partenaire sans nom', () => {
    expect(toPartnerList([{ id: '1', name: '' }, { id: '2', name: 'Tate Brown', logo: null, url: null }])).toHaveLength(1)
  })

  it('ne lève pas sur une entrée non tabulaire', () => {
    expect(toBannerList('oups')).toEqual([])
    expect(toPartnerList(null)).toEqual([])
  })
})

describe('pages éditoriales', () => {
  it('déduit le SEO du contenu HTML', () => {
    const page = toPage(rawPage)

    expect(page.slug).toBe('cgu')
    expect(page.seo.title).toBe('CGU')
    expect(page.seo.description).toBe('1. Présentation de la plateforme Qiryna est une plateforme EdTech…')
  })

  it('rend la FAQ stockée en JSON questions/réponses en titres et paragraphes', () => {
    const content = JSON.stringify([
      { question: '1. Qu\'est-ce que Qiryna ?', answer: '<p>Une plateforme dédiée.</p>' },
      { question: 'Balise <b> & co ?', answer: '<p>Oui.</p><script>alert(1)</script>' },
    ])
    const page = toPage({ ...rawPage, slug: 'faq', title: 'FAQ', content })

    expect(page.content).toBe(
      '<h2>1. Qu\'est-ce que Qiryna ?</h2><p>Une plateforme dédiée.</p><h2>Balise &lt;b&gt; &amp; co ?</h2><p>Oui.</p>',
    )
    expect(page.content).not.toContain('"question"')
    expect(page.seo.description).toBe('1. Qu\'est-ce que Qiryna ? Une plateforme dédiée. Balise <b> & co ? Oui.')
  })

  it('laisse intact un contenu HTML qui commence par un crochet sans être une FAQ', () => {
    const page = toPage({ ...rawPage, content: '[Note] <p>Texte.</p>' })
    expect(page.content).toBe('[Note] <p>Texte.</p>')
  })

  it('écarte les pages sans slug et déduplique', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pages = toPageList([rawPage, { ...rawPage, id: 'aaa' }, { ...rawPage, id: 'x', slug: '' }])
    warn.mockRestore()

    expect(pages).toHaveLength(1)
    expect(pages[0]?.id).toBe('0029970a-4c2d-468c-a52d-326ebe541641')
  })
})
