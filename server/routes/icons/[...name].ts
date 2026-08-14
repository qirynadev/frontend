import { defineEventHandler, createError, setHeader } from 'h3'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineEventHandler((event) => {
  const rawName = event.context.params?.name ?? ''
  const name = Array.isArray(rawName) ? rawName.join('/') : rawName

  if (!name) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  const possiblePaths = [
    resolve(process.cwd(), '.output/public/icons', name),
    resolve(process.cwd(), 'public/icons', name),
    resolve(process.cwd(), 'icons', name),
    resolve(__dirname, '../../../public/icons', name),
    resolve(__dirname, '../../../../public/icons', name),
    resolve('/var/www/vhosts/qiryna.lewebartisan.com/httpdocs/public/icons', name),
    resolve('/var/www/vhosts/qiryna.lewebartisan.com/httpdocs/icons', name),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      if (name.endsWith('.webp')) {
        setHeader(event, 'Content-Type', 'image/webp')
      } else if (name.endsWith('.png')) {
        setHeader(event, 'Content-Type', 'image/png')
      } else {
        setHeader(event, 'Content-Type', 'image/svg+xml')
      }
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return readFileSync(path)
    }
  }

  throw createError({ statusCode: 404, statusMessage: `Icon Not Found: ${name} (cwd: ${process.cwd()}, dir: ${__dirname})` })
})
