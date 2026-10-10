import type { IconName } from '~/design-system/icons'

/**
 * Icône et teinte d'une formation, déduites de son grade et de son titre.
 *
 * Le back-office ne fournit pas d'icône par formation : on la déduit de ce qui
 * est déjà saisi, sans toucher au back-office (décidé le 2026-10-10). Le grade
 * (`Licence`, `Master`, `PhD`…) est le critère le plus fiable, mais il ne
 * suffit pas seul : un Mastère spécialisé ou un diplôme d'ingénieur sont
 * souvent saisis avec le grade « Master ». D'où l'ordre des règles : les types
 * les plus précis d'abord, cherchés dans le titre ET le grade.
 *
 * Teintes reprises de la maquette (`ic-ed-form-1` à `-4`), plus un bleu pour
 * distinguer le cycle ingénieur du master dans une même école.
 */

export interface FormationVisual {
  icon: IconName
  /** Classes de la pastille (fond) et de l'icône (trait). */
  bg: string
  fg: string
}

const TEINTES = {
  violet: { bg: 'bg-[#f1f0fe]', fg: 'text-[#552bfc]' },
  rouge: { bg: 'bg-[#feeded]', fg: 'text-[#fd0a22]' },
  vert: { bg: 'bg-[#e8f8eb]', fg: 'text-[#11a951]' },
  jaune: { bg: 'bg-[#fef7e9]', fg: 'text-[#ffab00]' },
  bleu: { bg: 'bg-[#eaf1fe]', fg: 'text-[#2d6be4]' },
} as const

type Teinte = keyof typeof TEINTES

/** Ordre significatif : la première règle qui reconnaît la formation l'emporte. */
const REGLES: { motif: RegExp, icon: IconName, teinte: Teinte }[] = [
  { motif: /\b(doctorat|doctorate|doctoral|phd|ph\.d)\b/, icon: 'lightbulb', teinte: 'vert' },
  { motif: /\b(mastere specialise|specialized master|ms ?®)/, icon: 'award', teinte: 'jaune' },
  { motif: /\b(mba|executive)\b/, icon: 'briefcase', teinte: 'jaune' },
  { motif: /\b(prepa|cpge|classes? preparatoires?)\b/, icon: 'trending-up', teinte: 'vert' },
  { motif: /\b(ingenieurs?|engineer(ing)?)\b/, icon: 'settings', teinte: 'bleu' },
  { motif: /\b(masters?|msc|m\.sc|magistere|mastere)\b/, icon: 'book', teinte: 'rouge' },
  { motif: /\b(licence|bachelor|bsc|b\.sc|bba|but|bts|dut|undergraduate)\b/, icon: 'graduation', teinte: 'violet' },
]

const PAR_DEFAUT: FormationVisual = { icon: 'graduation', ...TEINTES.violet }

/** Minuscules, sans accents : « Mastère Spécialisé » et « mastere specialise » se valent. */
function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function formationVisual(formation: { title: string, grade: string }): FormationVisual {
  const texte = normaliser(`${formation.title} ${formation.grade}`)
  const regle = REGLES.find((r) => r.motif.test(texte))
  return regle ? { icon: regle.icon, ...TEINTES[regle.teinte] } : PAR_DEFAUT
}
