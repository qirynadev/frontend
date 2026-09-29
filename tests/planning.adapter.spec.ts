import { describe, expect, it } from 'vitest'
import { toCalendarSlotList, toTeacher } from '~/core/adapters/planning.adapter'

/**
 * Badge « vérifié » d'un professeur (directives-backend §4).
 *
 * Il reflète le contrôle de profil posé à la main par un admin, jamais la
 * confirmation d'e-mail, vraie pour tout compte dès sa création.
 */
describe('toTeacher — badge vérifié', () => {
  const base = { id: 'p1', full_name: 'Victor SEMEVO', user: { email_verified_at: '2026-08-01T10:00:00Z' } }

  it('lit `verified` quand la réponse passe par TeacherResource', () => {
    expect(toTeacher({ ...base, verified: true })?.verified).toBe(true)
    expect(toTeacher({ ...base, verified: false })?.verified).toBe(false)
  })

  it('lit `is_verified` quand l’endpoint sérialise le modèle brut', () => {
    expect(toTeacher({ ...base, is_verified: true })?.verified).toBe(true)
    expect(toTeacher({ ...base, is_verified: 0 })?.verified).toBe(false)
  })

  it('ignore la confirmation d’e-mail : sans contrôle admin, pas de badge', () => {
    expect(toTeacher(base)?.verified).toBe(false)
  })
})

/**
 * `GET /user/plannings/events` depuis les séances de groupe (back-office,
 * 2026-09-29) : une séance réservée apparaît une fois, avec ses places
 * restantes et `joinable` pour la commande passée en `order_id`.
 */
describe('toCalendarSlotList — séances de groupe', () => {
  const base = { start: '2026-10-02T09:00Z', end: '2026-10-02T10:00Z', future: true }

  it('créneau libre : ni rejoignable ni places', () => {
    expect(toCalendarSlotList([{ ...base, id: 'a', status: 'free' }])[0]).toEqual({
      id: 'a', startDate: base.start, endDate: base.end, free: true, joinable: false, seatsLeft: null,
    })
  })

  it('séance de groupe rejoignable, avec ses places restantes', () => {
    expect(toCalendarSlotList([{ ...base, id: 'b', status: 'used', joinable: true, seats_left: 3 }])[0])
      .toMatchObject({ free: false, joinable: true, seatsLeft: 3 })
  })

  it('une séance passée n\'est jamais rejoignable', () => {
    expect(toCalendarSlotList([{ ...base, id: 'c', status: 'used', joinable: true, future: false }])[0]!.joinable).toBe(false)
  })
})
