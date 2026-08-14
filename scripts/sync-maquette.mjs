#!/usr/bin/env node
/**
 * Synchronise la maquette de référence depuis le dépôt public UzaLab/qiryna.
 *
 * La maquette (`https://qiryna.vercel.app`, code sur GitHub) est la
 * **spécification** : chaque page de l'application est portée au pixel depuis
 * son HTML/CSS. Ce script maintient la copie locale à jour sans la recopier à
 * la main, et sans le bruit de fins de ligne qui fait diverger 400 fichiers
 * pour rien.
 *
 * Ce qu'il fait :
 *   1. clone (première fois) ou `git pull` (ensuite) le dépôt dans un cache
 *      gitignoré (`.cache/maquette-src/`) ;
 *   2. recopie son dossier `pwa/` vers deux emplacements :
 *      - `maquette/pwa/`     → référence versionnée, citée par les composants ;
 *      - `public/_maquette/` → copie servie en dev pour le harnais de mesure ;
 *   3. normalise les fins de ligne en LF sur les fichiers texte, pour que la
 *      copie n'introduise aucune modification fantôme dans Git.
 *
 * Usage : `npm run maquette:sync`
 *
 * Réseau requis (clone/pull). Le dépôt étant public, aucune authentification.
 */

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'https://github.com/UzaLab/qiryna.git'
const CACHE = join(ROOT, '.cache', 'maquette-src')
const SOURCE = join(CACHE, 'pwa')
const TARGETS = [join(ROOT, 'maquette', 'pwa'), join(ROOT, 'public', '_maquette')]

/** Extensions traitées comme du texte, à normaliser en LF. */
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.webmanifest', '.md', '.txt'])

function git(args, cwd) {
  execFileSync('git', args, { cwd, stdio: ['ignore', 'inherit', 'inherit'] })
}

function fetchRepo() {
  if (existsSync(join(CACHE, '.git'))) {
    console.log('→ mise à jour du cache (git pull)…')
    git(['pull', '--ff-only', '--depth', '1'], CACHE)
    return
  }
  console.log('→ premier clone du dépôt maquette…')
  mkdirSync(dirname(CACHE), { recursive: true })
  rmSync(CACHE, { recursive: true, force: true })
  git(['clone', '--depth', '1', REPO, CACHE])
}

/** Réécrit chaque fichier texte en LF ; laisse le binaire intact. */
function normalizeEol(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      normalizeEol(path)
      continue
    }
    const ext = entry.slice(entry.lastIndexOf('.')).toLowerCase()
    if (!TEXT.has(ext)) continue
    const original = readFileSync(path)
    const lf = Buffer.from(original.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
    if (!lf.equals(original)) writeFileSync(path, lf)
  }
}

function main() {
  fetchRepo()

  if (!existsSync(SOURCE)) {
    console.error('✗ le dépôt ne contient pas de dossier `pwa/` — structure inattendue.')
    process.exit(1)
  }

  for (const target of TARGETS) {
    rmSync(target, { recursive: true, force: true })
    mkdirSync(dirname(target), { recursive: true })
    cpSync(SOURCE, target, { recursive: true })
    normalizeEol(target)
    console.log(`✓ ${target.replace(ROOT, '.')} synchronisé`)
  }

  console.log('\nMaquette à jour. `git status` montre ce qui a changé côté référence.')
}

main()
