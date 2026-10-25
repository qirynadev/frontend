/**
 * Service worker de Qiryna : notifications push web, et rien d'autre.
 *
 * Aucun gestionnaire `fetch` : les pages, les données et les images ne passent
 * jamais par ici et ne sont jamais mises en cache. Le site s'affiche exactement
 * comme sans service worker.
 *
 * Le contenu reçu est celui du back-office (`qiryna-backoffice/docs/push-web.md`) :
 * `{ title, body, icon, data: { url } }`.
 */

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  }
  catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Qiryna', {
    body: payload.body || '',
    icon: payload.icon || '/apple-touch-icon.png',
    data: payload.data || {},
  }))
})

/**
 * Au clic : la page visée, dans un onglet du site déjà ouvert s'il y en a un.
 * Seules les pages du site s'ouvrent : une adresse d'un autre domaine est
 * ramenée au même chemin sur le site.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  let target
  try {
    target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin)
  }
  catch {
    target = new URL('/', self.location.origin)
  }
  const url = self.location.origin + target.pathname + target.search + target.hash

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const sameOrigin = windows.filter(client => new URL(client.url).origin === self.location.origin)

    const exact = sameOrigin.find(client => client.url === url)
    if (exact) return exact.focus()

    const existing = sameOrigin.find(client => 'navigate' in client)
    if (existing) {
      await existing.focus()
      return existing.navigate(url)
    }

    return self.clients.openWindow(url)
  })())
})
