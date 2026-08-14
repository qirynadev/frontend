import type { Course } from '~~/app/core/contracts'

export default defineEventHandler(async (event): Promise<Course> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { courses } = await getSnapshot(event)

  const course = courses.find((item) => item.slug === slug)
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: `Langue « ${slug} » introuvable` })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return course
})
