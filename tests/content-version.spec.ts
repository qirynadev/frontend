import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Signal « contenu modifié » du back-office (2026-10-25) : la version, rangée
 * dans le stockage `data` partagé, fait vider le cache de chaque processus.
 * Le stockage Nitro est remplacé par une version en mémoire.
 */
type Store = Map<string, unknown>

function fakeStorage(stores: Record<string, Store>) {
  return (base: string) => {
    const store = (stores[base] ??= new Map())
    return {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: unknown) => void store.set(key, value),
      getKeys: async () => [...store.keys()],
      removeItem: async (key: string) => void store.delete(key),
    }
  }
}

/** Charge une copie neuve du module : un processus du site, avec son propre état. */
async function newProcess() {
  vi.resetModules()
  return await import('~~/server/utils/content-version')
}

let stores: Record<string, Store>

beforeEach(() => {
  stores = { data: new Map(), cache: new Map() }
  vi.stubGlobal('useStorage', fakeStorage(stores))
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T10:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('version du contenu', () => {
  it('le signal vide le cache du processus qui le reçoit et publie une nouvelle version', async () => {
    const process = await newProcess()
    stores.cache!.set('catalog:qiryna:fr.json', { value: 'ancien' })

    const version = await process.bumpContentVersion()

    expect(stores.cache!.size).toBe(0)
    expect(stores.data!.get('content-version')).toBe(version)
  })

  it('un autre processus vide son cache à sa requête suivante, deux secondes au plus après', async () => {
    const autre = await newProcess()
    await autre.syncContentVersion() // première requête : il note la version en cours
    stores.cache!.set('nitro:routes:_:destinations:france.json', { value: 'page ancienne' })

    const recepteur = await newProcess()
    await recepteur.bumpContentVersion()
    stores.cache!.set('nitro:routes:_:destinations:france.json', { value: 'page ancienne' })

    // Moins de deux secondes après sa dernière lecture : il ne relit pas le disque.
    vi.advanceTimersByTime(1000)
    await autre.syncContentVersion()
    expect(stores.cache!.size).toBe(1)

    vi.advanceTimersByTime(1500)
    await autre.syncContentVersion()
    expect(stores.cache!.size).toBe(0)
  })

  it('sans signal, rien n\'est vidé', async () => {
    const process = await newProcess()
    await process.syncContentVersion()
    stores.cache!.set('catalog:qiryna:fr.json', { value: 'catalogue' })

    vi.advanceTimersByTime(10_000)
    await process.syncContentVersion()

    expect(stores.cache!.size).toBe(1)
  })
})

describe('sameSecret', () => {
  it('ne reconnaît que la clé exacte', async () => {
    const { sameSecret } = await newProcess()

    expect(sameSecret('cle-partagee', 'cle-partagee')).toBe(true)
    expect(sameSecret('cle-partageE', 'cle-partagee')).toBe(false)
    expect(sameSecret('cle', 'cle-partagee')).toBe(false)
    expect(sameSecret('', 'cle-partagee')).toBe(false)
  })
})
