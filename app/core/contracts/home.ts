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

export interface HomeContent {
  id: string
  title: string
  description: string
  slides: HomeSlide[]
  steps: HomeStep[]
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
