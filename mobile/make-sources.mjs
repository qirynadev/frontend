// Prépare les sources d'icônes et d'écran de démarrage de l'application, à
// partir de l'icône iOS 1024 fournie (logo Qiryna sur fond blanc).
// Usage (Docker, /icons = dossier fourni, /app = dépôt frontend) :
//   node mobile-assets.mjs /icons/apple-devices/AppIcon.appiconset/icon-ios-1024x1024.png /app/mobile/assets
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('/tmp/ca/node_modules/')
const sharp = require('sharp')

const [source, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const white = { r: 255, g: 255, b: 255, alpha: 1 }

// Icône classique (iOS, anciens Android) : telle quelle.
await sharp(source).resize(1024, 1024).png().toFile(`${out}/icon-only.png`)

// Icône adaptative : seul le disque central (66/108 du calque) est garanti
// visible. Le logo occupe ~78 % de la largeur de la source ;
// capacitor-assets le ramène au disque central (inset 16,7 %) : le logo
// pleine taille y tient (~52 % du calque).
const reduced = await sharp(source).resize(1024, 1024).png().toBuffer()
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: white } })
  .composite([{ input: reduced, gravity: 'center' }])
  .png().toFile(`${out}/icon-foreground.png`)
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: white } })
  .png().toFile(`${out}/icon-background.png`)

// Écran de démarrage : logo centré sur blanc (le même en mode sombre, le logo
// étant noir sur blanc).
const logo = await sharp(source).resize(1400, 1400).png().toBuffer()
for (const name of ['splash.png', 'splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: white } })
    .composite([{ input: logo, gravity: 'center' }])
    .png().toFile(`${out}/${name}`)
}
console.log('sources prêtes')
