/** Seule la production est indexable : voir `server/utils/indexable.ts`. */
export default defineEventHandler((event) => {
  if (isInternalRequest(event.node.req)) return
  if (!isIndexableHost(getRequestHost(event))) {
    setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
  }
})
