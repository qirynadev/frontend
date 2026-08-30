import { describe, expect, it, vi } from 'vitest'
import { createApiClient, unwrapEnvelope } from '~/core/http/api-client'
import { ApiError, toApiError } from '~/core/http/errors'

/** Simule ofetch : la valeur rejetée porte `status` et `data`, comme une `FetchError`. */
function httpError(status: number, data?: unknown) {
  return Object.assign(new Error(`HTTP ${status}`), { status, data })
}

function networkError() {
  return Object.assign(new Error('fetch failed'), { status: 0 })
}

describe('unwrapEnvelope', () => {
  it('déballe une enveloppe Laravel', () => {
    expect(unwrapEnvelope({ data: { id: '1' }, success: true, message: 'ok' })).toEqual({ id: '1' })
    expect(unwrapEnvelope({ data: [1, 2] })).toEqual([1, 2])
  })

  it('laisse passer une réponse non enveloppée', () => {
    // `/all-data` répond sans enveloppe.
    const payload = { menu: {}, homeData: {}, schoolSheets: [], offers: [], pages: [] }
    expect(unwrapEnvelope(payload)).toBe(payload)
  })

  it('ne tronque pas un objet métier possédant un champ data', () => {
    const payload = { id: '1', title: 'x', data: 'contenu', extra: true, more: 1 }
    expect(unwrapEnvelope(payload)).toBe(payload)
  })

  it('laisse passer les scalaires et les tableaux', () => {
    expect(unwrapEnvelope([1, 2])).toEqual([1, 2])
    expect(unwrapEnvelope(null)).toBeNull()
  })
})

describe('en-têtes', () => {
  it('transmet la langue et le jeton', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true })
    const client = createApiClient({ baseUrl: 'https://api.test', locale: 'en', token: 'jeton', fetcher: fetcher as never })

    await client.request('/all-data')

    const headers = fetcher.mock.calls[0]?.[1]?.headers
    expect(headers.lang).toBe('en')
    expect(headers.Authorization).toBe('Bearer jeton')
    expect(fetcher.mock.calls[0]?.[1]?.baseURL).toBe('https://api.test')
  })

  it('n’envoie pas d’en-tête Authorization sans jeton', async () => {
    const fetcher = vi.fn().mockResolvedValue({})
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await client.request('/all-data')

    expect(fetcher.mock.calls[0]?.[1]?.headers.Authorization).toBeUndefined()
    expect(fetcher.mock.calls[0]?.[1]?.headers.lang).toBe('fr')
  })
})

describe('tentatives', () => {
  it('rejoue un GET sur erreur réseau puis renvoie le résultat', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValueOnce({ ok: true })
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/all-data')).resolves.toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('abandonne après trois tentatives et lève une ApiError', async () => {
    const fetcher = vi.fn().mockRejectedValue(networkError())
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/all-data')).rejects.toBeInstanceOf(ApiError)
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('ne rejoue jamais un POST', async () => {
    const fetcher = vi.fn().mockRejectedValue(networkError())
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/newsletter', { method: 'POST' })).rejects.toBeInstanceOf(ApiError)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('ne rejoue pas une erreur définitive', async () => {
    const fetcher = vi.fn().mockRejectedValue(httpError(404))
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/destinations/inconnue')).rejects.toMatchObject({ kind: 'notFound' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejoue une 5xx', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce({ ok: true })
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/all-data')).resolves.toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

describe('unwrap: false', () => {
  it('renvoie la réponse telle quelle, sans déballer `data`', async () => {
    const payload = { success: false, requires_confirmation: true, message: 'x', data: { email: 'a@b.c' } }
    const fetcher = vi.fn().mockResolvedValue(payload)
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/auth/social/register', { method: 'POST', unwrap: false })).resolves.toEqual(payload)
  })

  it('déballe par défaut (comportement inchangé)', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: { id: '1' }, success: true })
    const client = createApiClient({ baseUrl: 'https://api.test', fetcher: fetcher as never })

    await expect(client.request('/x')).resolves.toEqual({ id: '1' })
  })
})

describe('normalisation des erreurs', () => {
  it('classe les statuts HTTP', () => {
    expect(toApiError(httpError(401), '/x').kind).toBe('unauthorized')
    // Le back-office restreint l’accès par IP en recette : /all-data répond 403.
    expect(toApiError(httpError(403), '/all-data').kind).toBe('forbidden')
    expect(toApiError(httpError(404), '/x').kind).toBe('notFound')
    expect(toApiError(httpError(422), '/x').kind).toBe('validation')
    expect(toApiError(httpError(500), '/x').kind).toBe('server')
    expect(toApiError(networkError(), '/x').kind).toBe('network')
  })

  it('remonte le premier message de validation Laravel', () => {
    const error = toApiError(httpError(422, { errors: { email: ['Cette adresse est déjà utilisée.'] } }), '/register')

    expect(error.message).toBe('Cette adresse est déjà utilisée.')
    expect(error.fieldErrors.email).toEqual(['Cette adresse est déjà utilisée.'])
  })

  it('retombe sur le message global', () => {
    expect(toApiError(httpError(403, { message: 'Accès restreint' }), '/x').message).toBe('Accès restreint')
  })

  it('reconnaît un dépassement de délai', () => {
    const aborted = Object.assign(new Error('aborted'), { name: 'AbortError' })
    const error = toApiError(aborted, '/all-data')

    expect(error.kind).toBe('timeout')
    expect(error.retryable).toBe(true)
  })

  it('indique ce qui vaut la peine d’être rejoué', () => {
    expect(toApiError(httpError(500), '/x').retryable).toBe(true)
    expect(toApiError(httpError(422), '/x').retryable).toBe(false)
    expect(toApiError(httpError(401), '/x').retryable).toBe(false)
  })

  it('n’enveloppe pas deux fois une ApiError', () => {
    const original = new ApiError({ kind: 'server', status: 500, message: 'boum', path: '/x' })
    expect(toApiError(original, '/y')).toBe(original)
  })
})
