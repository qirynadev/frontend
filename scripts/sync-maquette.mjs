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
 *   1. clone (première fois) ou remet à jour (ensuite) le dépôt dans un cache
 *      gitignoré (`.cache/maquette-src/`), sur la branche `release` ;
 *   2. recopie son dossier `pwa/` vers deux emplacements :
 *      - `maquette/pwa/`     → référence versionnée, citée par les composants ;
 *      - `public/_maquette/` → copie servie en dev pour le harnais de mesure ;
 *   3. normalise les fins de ligne en LF sur les fichiers texte, pour que la
 *      copie n'introduise aucune modification fantôme dans Git.
 *
 * Pourquoi `release` et pas `main` : côté maquette, `main` est la branche de
 * travail de l'équipe design (écrans en cours d'ajustement, pas encore
 * relus) ; une fois un écran validé, il est mergé dans `release` — c'est
 * cette branche qui fait foi comme spécification (confirmé par Kader
 * Souary, 2026-08-18). Prendre `main` reviendrait à porter des écrans qui
 * peuvent encore changer.
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
const BRANCH = 'release'
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
    // `fetch` + `reset --hard` plutôt que `pull` : fonctionne même si le
    // cache existant est resté sur une autre branche (ex. `main`, avant ce
    // changement) — pas besoin de le recréer à la main.
    console.log(`→ mise à jour du cache (branche ${BRANCH})…`)
    git(['fetch', '--depth', '1', 'origin', BRANCH], CACHE)
    git(['checkout', '-B', BRANCH, 'FETCH_HEAD'], CACHE)
    git(['reset', '--hard', 'FETCH_HEAD'], CACHE)
    return
  }
  console.log(`→ premier clone du dépôt maquette (branche ${BRANCH})…`)
  mkdirSync(dirname(CACHE), { recursive: true })
  rmSync(CACHE, { recursive: true, force: true })
  git(['clone', '--depth', '1', '--branch', BRANCH, REPO, CACHE])
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
