import { describe, expect, it } from 'vitest'
import { toTeacher } from '~/core/adapters/planning.adapter'

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
