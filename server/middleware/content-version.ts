/**
 * Applique, sur ce processus, un signal « contenu modifié » reçu par un autre
 * (voir `server/utils/content-version.ts`). Passe avant le cache des pages :
 * une page calculée avant la modification n'est plus servie.
 */
export default defineEventHandler(async () => {
  await syncContentVersion()
})
