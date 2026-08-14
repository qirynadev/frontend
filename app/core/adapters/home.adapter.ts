import type { Banner, HomeBlock, HomeContent, HomeSlide, HomeStep, Partner } from '../contracts'
import { toSeo } from './common.adapter'
import { asRecord, list, str, toUrl } from './primitives'

function toBlock(raw: unknown): HomeBlock {
  const source = asRecord(raw)
  const title = str(source, 'title')
  return {
    title,
    subtitle: str(source, 'subtitle'),
    // `mobile` porte un titre court propre au shell mobile.
    mobileTitle: str(source, 'mobile') || title,
  }
}

function toSlide(raw: unknown): HomeSlide | null {
  const source = asRecord(raw)
  const image = toUrl(source.image)
  if (!image) return null
  return {
    image,
    description: str(source, 'description'),
    // `author` est `null` sur toutes les diapositives actuelles.
    author: str(source, 'author') || null,
  }
}

function toStep(raw: unknown): HomeStep {
  const source = asRecord(raw)
  return {
    title: str(source, 'title'),
    description: str(source, 'description'),
    image: toUrl(source.image),
  }
}

export function toHomeContent(raw: unknown): HomeContent | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  const title = str(source, 'title')
  const description = str(source, 'description')

  return {
    id,
    title,
    description,
    slides: list(source, 'slides')
      .map(toSlide)
      .filter((slide): slide is HomeSlide => slide !== null),
    steps: list(source, 'steps')
      .map(toStep)
      .filter((step) => step.title !== ''),
    blocks: {
      schools: toBlock(source.schools),
      coaches: toBlock(source.coaches),
      mentors: toBlock(source.mentors),
      languages: toBlock(source.languages),
      offers: toBlock(source.offers),
    },
    seo: toSeo(source, title, description),
  }
}

export function toBannerList(raw: unknown): Banner[] {
  return (Array.isArray(raw) ? raw : [])
    .map((entry) => {
      const source = asRecord(entry)
      return {
        id: str(source, 'id'),
        title: str(source, 'title'),
        description: str(source, 'description'),
        image: toUrl(source.picture) ?? toUrl(source.image),
        url: toUrl(source.url),
      }
    })
    .filter((banner) => banner.id !== '' && banner.image !== null)
}

export function toPartnerList(raw: unknown): Partner[] {
  return (Array.isArray(raw) ? raw : [])
    .map((entry) => {
      const source = asRecord(entry)
      return {
        id: str(source, 'id'),
        name: str(source, 'name'),
        description: str(source, 'description'),
        logo: toUrl(source.logo),
        url: toUrl(source.url),
      }
    })
    .filter((partner) => partner.id !== '' && partner.name !== '')
}
