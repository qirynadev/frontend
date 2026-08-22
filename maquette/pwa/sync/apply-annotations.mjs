#!/usr/bin/env node
/**
 * Injecte la couche sync additive dans pages/*.html :
 * - commentaire @maquette-id / @frontend-route / @frontend-file / @sync-status
 * - data-maquette-id sur .screen
 * - data-q-component sur bottom-nav, topbar, formule-card, btn-primary
 *
 * Idempotent : ne modifie pas si @maquette-id déjà présent.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PAGES_DIR = join(ROOT, 'pages')
const SCREEN_MAP = JSON.parse(readFileSync(join(__dirname, 'screen-map.json'), 'utf8'))

const checkOnly = process.argv.includes('--check')

/** @type {Map<string, typeof SCREEN_MAP.screens[0]>} */
const byFile = new Map(SCREEN_MAP.screens.map((s) => [s.file.replace('pages/', ''), s]))

const TOPBAR_RE =
  /<(header|div)(\s[^>]*)?\sclass="([^"]*\b(?:home-topbar|formule-topbar|ed-topbar|le-topbar|connexion-header|page-header)\b[^"]*)"/g

const BTN_PRIMARY_RE =
  /<(a|button)(\s[^>]*)?\sclass="([^"]*\bbtn-primary\b[^"]*)"/g

const FORMULE_CARD_RE =
  /<(article|a|div)(\s[^>]*)?\sclass="([^"]*\bformule-card\b[^"]*)"/g

const BOTTOM_NAV_RE =
  /<(nav)(\s[^>]*)?\sclass="([^"]*\bbottom-nav\b[^"]*)"/g

const SCREEN_RE =
  /<div(\s[^>]*)?\sclass="(screen\s[^"]*)"/

function hasAttr(attrs, name) {
  return new RegExp(`\\b${name}=`).test(attrs)
}

function injectAttr(tagOpen, attrName, attrValue) {
  if (hasAttr(tagOpen, attrName)) return tagOpen
  return tagOpen.replace(/^(<\w+)/, `$1 ${attrName}="${attrValue}"`)
}

function tierFromClass(classAttr) {
  if (classAttr.includes('formule-card--kili')) return 'kili'
  if (classAttr.includes('formule-card--acon')) return 'acon'
  if (classAttr.includes('formule-card--everest')) return 'everest'
  return null
}

function buildComment(screen) {
  const route = screen.frontendRoute ?? '—'
  const vue = screen.frontendFile ?? '—'
  const notes = screen.notes ? `\n  @notes ${screen.notes}` : ''
  return `<!--
  @maquette-id ${screen.maquetteId}
  @frontend-route ${route}
  @frontend-file ${screen.frontendFile ? 'frontend-main/' + screen.frontendFile : '—'}
  @sync-status ${screen.syncStatus} | ${SCREEN_MAP.updated} | commit ${SCREEN_MAP.commit}${notes}
-->
`
}

function annotateHtml(filename, html, screen) {
  if (html.includes('@maquette-id')) return html

  let out = html

  // Commentaire juste après <body>
  out = out.replace(/<body>\s*\n/, `<body>\n${buildComment(screen)}`)

  // screen-shell
  out = out.replace(
    /(<div\s+class="screen-shell")/,
    `$1 data-q-layout="mobile-shell"`,
  )

  // .screen (pas .screen-shell)
  out = out.replace(SCREEN_RE, (match, attrs = '', classAttr) => {
    let open = `<div${attrs} class="${classAttr}"`
    open = injectAttr(open, 'data-maquette-id', screen.maquetteId)
    return open
  })

  // bottom-nav
  out = out.replace(BOTTOM_NAV_RE, (match, tag, attrs = '', classAttr) => {
    let open = `<${tag}${attrs} class="${classAttr}"`
    open = injectAttr(open, 'data-q-component', 'QBottomNav')
    return open
  })

  // topbars
  out = out.replace(TOPBAR_RE, (match, tag, attrs = '', classAttr) => {
    let open = `<${tag}${attrs} class="${classAttr}"`
    open = injectAttr(open, 'data-q-component', 'QTopBar')
    return open
  })

  // formule-card
  out = out.replace(FORMULE_CARD_RE, (match, tag, attrs = '', classAttr) => {
    let open = `<${tag}${attrs} class="${classAttr}"`
    open = injectAttr(open, 'data-q-component', 'QCard')
    const tier = tierFromClass(classAttr)
    if (tier) open = injectAttr(open, 'data-q-tier', tier)
    return open
  })

  // btn-primary (premier CTA principal par page suffit pour la checklist ; on marque tous)
  out = out.replace(BTN_PRIMARY_RE, (match, tag, attrs = '', classAttr) => {
    let open = `<${tag}${attrs} class="${classAttr}"`
    open = injectAttr(open, 'data-q-component', 'QButton')
    open = injectAttr(open, 'data-q-variant', 'primary')
    return open
  })

  // ecole-detail specifics
  if (screen.maquetteId === 'ecole-detail') {
    out = out.replace(
      /(<(?:nav|div)\s[^>]*class="[^"]*\bed-tabs\b[^"]*")/,
      (m) => injectAttr(m, 'data-q-component', 'QSegmentedControl'),
    )
    out = out.replace(
      /(<div\s[^>]*class="[^"]*\bed-modal\b[^"]*")/,
      (m) => injectAttr(m, 'data-q-component', 'QSheet'),
    )
    out = out.replace(
      /(<a\s[^>]*class="[^"]*\bed-float-cta\b[^"]*")/,
      (m) => {
        let x = injectAttr(m, 'data-q-component', 'QButton')
        return injectAttr(x, 'data-q-variant', 'cta')
      },
    )
  }

  return out
}

const htmlFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'))
let updated = 0
let skipped = 0
let missing = 0

for (const file of htmlFiles) {
  const screen = byFile.get(file)
  if (!screen) {
    console.warn(`⚠ Pas d'entrée screen-map pour ${file}`)
    missing++
    continue
  }

  const path = join(PAGES_DIR, file)
  const html = readFileSync(path, 'utf8')

  if (html.includes('@maquette-id')) {
    skipped++
    if (checkOnly) continue
  }

  const next = annotateHtml(file, html, screen)

  if (next === html) {
    skipped++
    continue
  }

  if (!checkOnly) {
    writeFileSync(path, next, 'utf8')
  }
  updated++
  console.log(`✓ ${file}`)
}

if (checkOnly) {
  const unannotated = htmlFiles.filter((f) => {
    const html = readFileSync(join(PAGES_DIR, f), 'utf8')
    return !html.includes('@maquette-id')
  })
  if (unannotated.length) {
    console.error(`✗ Pages sans annotation : ${unannotated.join(', ')}`)
    process.exit(1)
  }
  console.log(`OK — ${htmlFiles.length} pages annotées`)
  process.exit(0)
}

console.log(`\nTerminé : ${updated} modifié(s), ${skipped} déjà à jour, ${missing} sans map`)
