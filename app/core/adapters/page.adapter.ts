import type { Page } from '../contracts'
import { toSeo } from './common.adapter'
import { asRecord, dedupeBySlug, html, str } from './primitives'

export function toPage(raw: unknown): Page {
  const source = asRecord(raw)
  const title = str(source, 'title')
  const content = html(source, 'content')

  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title,
    content,
    seo: toSeo(source, title, content),
  }
}

export function toPageList(raw: unknown): Page[] {
  const pages = (Array.isArray(raw) ? raw : [])
    .map(toPage)
    .filter((page) => page.id !== '' && page.slug !== '')

  return dedupeBySlug(pages, 'pages éditoriales')
}
