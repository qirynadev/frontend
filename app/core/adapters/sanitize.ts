/**
 * Assainissement du HTML éditorial.
 *
 * Le back-office renvoie du HTML produit par un éditeur riche (Quill). Il est
 * de première main, mais il finit dans un `v-html` : une injection en base, un
 * compte d'administration compromis ou un import mal contrôlé suffiraient à
 * exécuter du script chez chaque visiteur.
 *
 * On applique donc une **liste blanche** — ce qui n'y figure pas disparaît.
 * Fonction pure, sans DOM : elle tourne au rendu serveur comme dans les tests.
 */

/** Balises conservées. Tout le reste est retiré, contenu textuel préservé. */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
])

/** Balises dont le **contenu** doit disparaître avec elles. */
const STRIPPED_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi

/** Attributs conservés, par balise. */
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  '*': new Set(['class']),
}

/** Seules ces classes survivent : celles de l'éditeur, utilisées pour l'alignement. */
const ALLOWED_CLASS = /^ql-[a-z-]+$/

function isSafeHref(value: string): boolean {
  const trimmed = value.trim().toLowerCase()
  // Bloque `javascript:`, `data:`, `vbscript:` et leurs variantes encodées.
  if (/^[a-z0-9+.-]*:/.test(trimmed)) {
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')
  }
  // Chemins relatifs et ancres.
  return !trimmed.startsWith('//')
}

function sanitizeAttributes(tag: string, rawAttributes: string): string {
  const kept: string[] = []
  const pattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g

  let match: RegExpExecArray | null
  while ((match = pattern.exec(rawAttributes)) !== null) {
    const name = match[1]!.toLowerCase()
    const value = match[2] ?? match[3] ?? match[4] ?? ''

    const allowed = ALLOWED_ATTRIBUTES[tag]?.has(name) || ALLOWED_ATTRIBUTES['*']!.has(name)
    if (!allowed) continue

    if (name === 'href') {
      if (!isSafeHref(value)) continue
      kept.push(`href="${escapeAttribute(value)}"`)
      continue
    }

    if (name === 'class') {
      const classes = value.split(/\s+/).filter((entry) => ALLOWED_CLASS.test(entry))
      if (classes.length > 0) kept.push(`class="${escapeAttribute(classes.join(' '))}"`)
      continue
    }

    kept.push(`${name}="${escapeAttribute(value)}"`)
  }

  // Un lien externe s'ouvre sans donner la main à la page cible.
  if (tag === 'a' && kept.some((attribute) => attribute.startsWith('href="http'))) {
    kept.push('target="_blank"', 'rel="noopener noreferrer"')
  }

  return kept.length > 0 ? ` ${kept.join(' ')}` : ''
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Renvoie un HTML sûr à injecter.
 *
 * Toute entrée non textuelle produit une chaîne vide plutôt qu'une exception.
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string' || input === '') return ''

  return input
    // 1. Les blocs exécutables partent avec leur contenu.
    .replace(STRIPPED_WITH_CONTENT, '')
    // 2. Commentaires — peuvent masquer du balisage conditionnel.
    .replace(/<!--[\s\S]*?-->/g, '')
    // 3. Chaque balise restante est filtrée par la liste blanche.
    .replace(/<\/?([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (whole, rawTag: string, attributes: string) => {
      const tag = rawTag.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ''
      if (whole.startsWith('</')) return `</${tag}>`

      const selfClosing = /\/\s*$/.test(attributes)
      return `<${tag}${sanitizeAttributes(tag, attributes)}${selfClosing ? ' /' : ''}>`
    })
}
