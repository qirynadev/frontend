/**
 * Mots en exergue d'un titre administré : les passages entre astérisques
 * s'affichent en couleur (« Étudier en *France* »). Syntaxe choisie le
 * 2026-10-14 pour la page destination ; l'aperçu du formulaire du back-office
 * applique la même règle (`Components/Destination/pageDefaults.ts`).
 *
 * Un astérisque isolé reste tel quel : rien n'est perdu sur une faute de frappe.
 */
export interface EmphasisSegment {
  text: string
  emphasis: boolean
}

export function emphasisSegments(text: string): EmphasisSegment[] {
  const segments: EmphasisSegment[] = []
  let last = 0
  for (const match of text.matchAll(/\*([^*]+)\*/g)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), emphasis: false })
    segments.push({ text: match[1]!, emphasis: true })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), emphasis: false })
  return segments
}
