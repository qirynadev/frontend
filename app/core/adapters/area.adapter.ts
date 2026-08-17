import type { AreaOfStudySummary } from '../contracts/area'
import { asArray, asRecord, num, str, toUrl } from './primitives'

export function toAreaOfStudySummary(raw: unknown): AreaOfStudySummary {
  const source = asRecord(raw)

  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title: str(source, 'title'),
    icon: toUrl(source.icon),
    schoolCount: num(source, 'nbr_schools', 0),
  }
}

export function toAreaOfStudySummaryList(raw: unknown): AreaOfStudySummary[] {
  return asArray(raw)
    .map(toAreaOfStudySummary)
    .filter((area) => area.id !== '' && area.slug !== '')
}
