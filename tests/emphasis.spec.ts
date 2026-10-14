import { describe, expect, it } from 'vitest'
import { emphasisSegments } from '~/utils/emphasis'

describe('emphasisSegments', () => {
  it('met en couleur le passage entre astérisques', () => {
    expect(emphasisSegments('Étudier en *France*')).toEqual([
      { text: 'Étudier en ', emphasis: false },
      { text: 'France', emphasis: true },
    ])
  })

  it('accepte plusieurs passages, au début comme au milieu', () => {
    expect(emphasisSegments('*Paris*, Lyon et *Lille*')).toEqual([
      { text: 'Paris', emphasis: true },
      { text: ', Lyon et ', emphasis: false },
      { text: 'Lille', emphasis: true },
    ])
  })

  it('laisse un astérisque isolé tel quel', () => {
    expect(emphasisSegments('Top 10* mondial')).toEqual([{ text: 'Top 10* mondial', emphasis: false }])
  })

  it('un titre sans astérisque reste d’un seul tenant', () => {
    expect(emphasisSegments('Étudier au Canada')).toEqual([{ text: 'Étudier au Canada', emphasis: false }])
  })
})
