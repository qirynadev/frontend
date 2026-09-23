import type { SeoMeta } from './common'

export interface HomeSlide {
  image: string
  description: string
  author: string | null
}

export interface HomeStep {
  title: string
  description: string
  image: string | null
}

/** Bloc de section d'accueil : titre desktop, sous-titre, titre mobile. */
export interface HomeBlock {
  title: string
  subtitle: string
  /** Titre court utilisé par le shell mobile. Retombe sur `title` si absent. */
  mobileTitle: string
}

/**
 * Illustrations des quatre sections de l'accueil bureau, administrées depuis
 * `/cms/home`. Non traduites côté back-office : la même image sert à toutes
 * les langues. `null` tant qu'aucune image n'a été téléversée, auquel cas
 * l'écran garde le visuel de la maquette.
 */
export interface HomeSectionImages {
  orientation: string | null
  schools: string | null
  languages: string | null
  housing: string | null
}

export interface HomeContent {
  id: string
  title: string
  description: string
  slides: HomeSlide[]
  steps: HomeStep[]
  sectionImages: HomeSectionImages
  blocks: {
    schools: HomeBlock
    coaches: HomeBlock
    mentors: HomeBlock
    languages: HomeBlock
    offers: HomeBlock
  }
  seo: SeoMeta
}

export interface Banner {
  id: string
  title: string
  description: string
  image: string | null
  url: string | null
}

export interface Partner {
  id: string
  name: string
  description: string
  logo: string | null
  url: string | null
}
