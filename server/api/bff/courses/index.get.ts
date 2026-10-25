import type { CourseSummary } from '~~/app/core/contracts'

/** Langues enseignées, en version liste. */
export default defineEventHandler(async (event): Promise<CourseSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return catalog.courses
})
