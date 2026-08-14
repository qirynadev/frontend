import { asRecord, str } from '~~/app/core/adapters'

/** Renvoi du code de confirmation. */
export default defineEventHandler(async (event) => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()

  if (email === '') {
    throw createError({ statusCode: 422, statusMessage: 'Adresse absente', data: { message: 'Adresse absente', errors: { email: ['required'] } } })
  }

  try {
    await publicClient(event).request('/auth/resend-code', { method: 'POST', body: { email } })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  return { ok: true }
})
