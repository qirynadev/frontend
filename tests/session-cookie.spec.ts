import { describe, expect, it } from 'vitest'
import { pickSessionToken } from '~/core/http/session.constants'

/** Valeur typique d'un cookie de session Laravel : base64 chiffré, sans `|`. */
const LARAVEL = 'eyJpdiI6IkFCQyIsInZhbHVlIjoiREVGIiwibWFjIjoiR0hJIn0%3D'

describe('pickSessionToken', () => {
  it('rend null sans en-tête ni cookie de session', () => {
    expect(pickSessionToken(undefined)).toBeNull()
    expect(pickSessionToken('')).toBeNull()
    expect(pickSessionToken('qiryna_locale=fr; _ga=GA1.1')).toBeNull()
  })

  it('lit le cookie du site', () => {
    expect(pickSessionToken('qiryna_front_session=12%7Cabc')).toBe('12|abc')
  })

  it('reprend une session ouverte sous l\'ancien nom', () => {
    expect(pickSessionToken('qiryna_session=34%7Cdef')).toBe('34|def')
  })

  it('ignore le cookie Laravel du back-office, même placé en premier', () => {
    expect(pickSessionToken(`qiryna_session=${LARAVEL}; qiryna_session=56%7Cghi`)).toBe('56|ghi')
    expect(pickSessionToken(`qiryna_session=${LARAVEL}`)).toBeNull()
  })

  it('préfère le cookie du site à l\'ancien nom', () => {
    expect(pickSessionToken('qiryna_session=1%7Cold; qiryna_front_session=2%7Cnew')).toBe('2|new')
  })

  it('ignore un cookie du site qui n\'a pas la forme d\'un jeton', () => {
    expect(pickSessionToken('qiryna_front_session=garbage; qiryna_session=7%7Cok')).toBe('7|ok')
  })
})
