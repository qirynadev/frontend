import type { Course } from '~~/app/core/contracts'

export default defineEventHandler(async (event): Promise<Course> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { courses } = await getSnapshot(event)

  const course = courses.find((item) => item.slug === slug)
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: `Langue « ${slug} » introuvable` })
  }

  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return course
})
