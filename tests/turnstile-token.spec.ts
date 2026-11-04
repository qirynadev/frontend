import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenSlot } from '~/utils/turnstile-token'

describe('createTokenSlot', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** Vrai une fois la promesse tenue, après avoir laissé passer `ms`. */
  async function settledAfter(promise: Promise<void>, ms: number): Promise<boolean> {
    let settled = false
    void promise.then(() => { settled = true })
    await vi.advanceTimersByTimeAsync(ms)
    return settled
  }

  it('attend le jeton d\'un visiteur plus rapide que Cloudflare', async () => {
    const slot = createTokenSlot(25_000, true)
    const ready = slot.ready()

    expect(await settledAfter(ready, 10_000)).toBe(false)
    slot.set('jeton')
    expect(await settledAfter(ready, 0)).toBe(true)
    expect(slot.take()).toBe('jeton')
  })

  it('n\'attend pas un jeton déjà reçu', async () => {
    const slot = createTokenSlot(25_000, true)
    slot.set('jeton')
    expect(await settledAfter(slot.ready(), 0)).toBe(true)
  })

  it('un jeton ne sert qu\'une fois : l\'envoi suivant attend le nouveau', async () => {
    const slot = createTokenSlot(25_000, true)
    slot.set('premier')
    slot.take()

    expect(slot.take()).toBe('')
    expect(await settledAfter(slot.ready(), 1000)).toBe(false)
  })

  it('un jeton expiré n\'est plus proposé', async () => {
    const slot = createTokenSlot(25_000, true)
    slot.set('jeton')
    slot.clear()
    expect(await settledAfter(slot.ready(), 1000)).toBe(false)
  })

  it('ne bloque jamais le formulaire au-delà du délai', async () => {
    const slot = createTokenSlot(25_000, true)
    expect(await settledAfter(slot.ready(), 25_000)).toBe(true)
    expect(slot.take()).toBe('')
  })

  it('sans clé de site, ou si le script est bloqué, rien à attendre', async () => {
    expect(await settledAfter(createTokenSlot(25_000, false).ready(), 0)).toBe(true)

    const slot = createTokenSlot(25_000, true)
    const ready = slot.ready()
    slot.disable()
    expect(await settledAfter(ready, 0)).toBe(true)
  })
})
