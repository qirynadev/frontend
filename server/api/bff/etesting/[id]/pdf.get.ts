import { asRecord, optionalStr } from '~~/app/core/adapters'

/**
 * Sert le PDF de résultats en octets bruts (`Content-Type: application/pdf`),
 * pas un JSON de métadonnées avec des « URL » — PT-TESTS renvoie le PDF en
 * base64 brut (confirmé en direct, 2026-09-01 : `JVBERi0xLjQK...` décode en
 * un vrai en-tête `%PDF-1.4`), jamais une URL à ouvrir telle quelle. L'ancien
 * comportement (renvoyer `{pdf_synthese: "<base64>", ...}` et laisser le
 * front faire `window.open(pdf.synthese)`) ne pouvait jamais fonctionner :
 * `toUrl()` rejette silencieusement tout ce qui ne ressemble pas à une URL.
 *
 * Même principe que `ProfilageController::evaluationReport()` côté admin,
 * qui décode déjà correctement ce même champ : décodage une fois ici, le
 * client reçoit un vrai PDF binaire, ouvrable/téléchargeable directement.
 */
export default defineEventHandler(async (event) => {
  const client = authClient(event)
  const id = getRouterParam(event, 'id') ?? ''

  let raw: unknown
  try {
    raw = await client.request(`/etesting/evaluations/${encodeURIComponent(id)}/pdf`)
  }
  catch (error) {
    rethrowApiError(error)
  }

  const base64 = pickPdfBase64(raw)
  if (!base64) {
    throw createError({ statusCode: 404, statusMessage: 'PDF non disponible' })
  }

  setResponseHeader(event, 'content-type', 'application/pdf')
  setResponseHeader(event, 'content-disposition', `inline; filename="evaluation-${id}.pdf"`)
  return base64ToBytes(stripDataUriPrefix(base64))
})

/** Au cas où la valeur stockée serait un data URI complet plutôt que du base64 brut. */
function stripDataUriPrefix(value: string): string {
  const marker = 'base64,'
  const index = value.indexOf(marker)
  return index === -1 ? value : value.slice(index + marker.length)
}

/** `atob` (pas `Buffer`, pour rester sans dépendance aux types Node) donne une chaîne binaire, un octet par code point. */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Même ordre de priorité que l'ancien `openReport()` du front : synthèse >
 * PDF de programme > détail > détail de programme > candidat — le premier
 * champ réellement renseigné l'emporte.
 */
function pickPdfBase64(raw: unknown): string | null {
  const source = asRecord(raw)
  return optionalStr(source, 'pdf_synthese')
    ?? optionalStr(source, 'programme_pdf')
    ?? optionalStr(source, 'pdf_detail')
    ?? optionalStr(source, 'programme_pdf_detail')
    ?? optionalStr(source, 'pdf_candidat')
}
