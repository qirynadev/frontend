import type { CourseSummary } from '~~/app/core/contracts'

/** Langues enseignées, en version liste. */
export default defineEventHandler(async (event): Promise<CourseSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return catalog.courses
})
