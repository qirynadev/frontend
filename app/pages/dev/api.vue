<script setup lang="ts">
/**
 * Banc de vérification de la couche anti-corruption (Lot 2).
 *
 * ⚠️ Page d'outillage, hors produit — comme `/dev/ui`, ses libellés ne passent
 * pas par i18n et elle n'est servie qu'en développement.
 *
 * Elle exerce **chaque repository** dans un vrai contexte Nuxt (rendu serveur
 * puis hydratation) et affiche ce que l'application reçoit réellement.
 */

import { catalogRepo, destinationRepo, offerRepo, pageRepo, schoolRepo } from '~/core/repositories'
import { ApiError } from '~/core/http/errors'

definePageMeta({ layout: false })

if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

useHead({ title: 'Qiryna — Vérification API' })

const { data, error, status, refresh } = await useAsyncData('dev-api-probe', async () => {
  const started = Date.now()

  const [catalog, destinations] = await Promise.all([catalogRepo.load(), destinationRepo.list()])

  const firstSlug = destinations[0]?.slug ?? 'france'
  const [destination, schools, page, offer] = await Promise.all([
    destinationRepo.bySlug(firstSlug),
    schoolRepo.list({ destination: firstSlug, perPage: 5 }),
    pageRepo.bySlug('cgu'),
    catalog.offers[0] ? offerRepo.bySlug(catalog.offers[0].slug) : Promise.resolve(null),
  ])

  // Cas non nominaux : le contrat dit « null », pas « exception ».
  const [missingDestination, missingSchool] = await Promise.all([
    destinationRepo.bySlug('atlantide'),
    schoolRepo.bySlug('ecole-qui-nexiste-pas'),
  ])

  return {
    elapsedMs: Date.now() - started,
    catalog,
    destinations,
    destination,
    schools,
    page,
    offer,
    missingDestination,
    missingSchool,
  }
})

const apiError = computed(() => (error.value?.cause instanceof ApiError ? error.value.cause : null))

function weight(value: unknown): string {
  return `${(JSON.stringify(value ?? null).length / 1024).toFixed(1)} Ko`
}
</script>

<template>
  <div class="min-h-dvh bg-backdrop px-gutter py-32">
    <div class="mx-auto flex max-w-1100 flex-col gap-24">
      <header class="flex flex-col gap-8">
        <h1 class="m-0 text-6xl font-bold tracking-tight text-text">Couche anti-corruption</h1>
        <p class="m-0 max-w-640 text-xl text-muted-2">
          Chaque bloc ci-dessous est passé par <code>core/repositories</code> →
          <code>bffFetch</code> → BFF Nitro → <code>core/adapters</code>. Aucune réponse brute
          de l'API n'atteint cette page.
        </p>
        <div class="flex items-center gap-12">
          <QButton size="sm" variant="outline" icon-start="settings" @click="refresh()">Relancer</QButton>
          <QBadge :tone="status === 'success' ? 'success' : status === 'error' ? 'danger' : 'neutral'">
            {{ status }}
          </QBadge>
          <span v-if="data" class="text-base text-muted-2">{{ data.elapsedMs }} ms</span>
        </div>
      </header>

      <QAlert
        v-if="apiError"
        :title="`Appel en échec (${apiError.kind})`"
        :message="apiError.message"
      />
      <QAlert v-else-if="error" title="Erreur inattendue" :message="String(error)" />

      <template v-if="data">
        <DevSection title="catalogRepo.load()" source="/all-data → /api/bff/catalog">
          <DevRow :label="`Charge utile reçue par le navigateur : ${weight(data.catalog)} (au lieu de 4 400 Ko)`" stack>
            <div class="grid gap-12 shell:grid-cols-3">
              <QCard variant="outlined" padding="sm">
                <QStat align="start" :value="String(data.catalog.destinations.length)" label="destinations" icon="globe" />
              </QCard>
              <QCard variant="outlined" padding="sm">
                <QStat align="start" :value="String(data.catalog.offers.length)" label="formules" icon="award" />
              </QCard>
              <QCard variant="outlined" padding="sm">
                <QStat align="start" :value="String(data.catalog.pages.length)" label="pages éditoriales" icon="file" />
              </QCard>
            </div>
            <p class="m-0 text-base text-text">
              Site : <strong>{{ data.catalog.settings.name }}</strong> ·
              {{ data.catalog.settings.socials.length }} réseaux ·
              {{ data.catalog.settings.locales.map((l) => l.code).join(' / ') }}
            </p>
            <p class="m-0 text-base text-text">
              Menu destinations : {{ data.catalog.menu.destinations.entries.map((e) => e.title).join(', ') }}
            </p>
          </DevRow>
        </DevSection>

        <DevSection title="destinationRepo.bySlug()" source="schoolSheets[] → Destination">
          <DevRow v-if="data.destination" label="Le nom du pays est remis dans title, l'accroche dans tagline" stack>
            <QCard variant="outlined">
              <QMediaRow :title="data.destination.title" :description="data.destination.tagline" align="start">
                <template #leading><QIconCircle icon="globe" size="xl" /></template>
                <template #trailing>
                  <QBadge tone="info">{{ data.destination.country.code ?? '—' }}</QBadge>
                </template>
              </QMediaRow>
            </QCard>
            <p class="m-0 text-base text-text">
              {{ data.destination.schoolCount }} écoles après déduplication ·
              charge utile {{ weight(data.destination) }} ·
              présentation HTML des écoles :
              <strong>{{ data.destination.schools.some((s) => 'presentation' in s) ? 'présente ⚠️' : 'absente ✓' }}</strong>
            </p>
            <p class="m-0 text-base text-muted-2">SEO : {{ data.destination.seo.description }}</p>
          </DevRow>
        </DevSection>

        <DevSection title="schoolRepo.list()" source="filtrage et pagination côté serveur">
          <DevRow :label="`${data.schools.total} résultats · page ${data.schools.page}/${data.schools.totalPages} · ${weight(data.schools)}`" stack>
            <QCard v-for="school in data.schools.items" :key="school.id" variant="outlined" padding="sm">
              <QMediaRow :title="school.title" :description="`${school.city} — ${school.formationCount} formation(s)`">
                <template #leading><QIconCircle icon="building" size="lg" /></template>
                <template #trailing><code class="text-xs text-muted-2">{{ school.slug }}</code></template>
              </QMediaRow>
            </QCard>
          </DevRow>
        </DevSection>

        <DevSection title="offerRepo.bySlug() · pageRepo.bySlug()" source="offers[] et pages[] du dump">
          <DevRow v-if="data.offer" label="Formule" stack>
            <QCard variant="outlined">
              <QMediaRow :title="data.offer.heroTitle" :description="`${data.offer.items.length} éléments inclus`">
                <template #leading><QIconCircle icon="award" tone="warning" size="xl" /></template>
                <template #trailing>
                  <QBadge tone="success" variant="solid">{{ data.offer.price.amount }} €</QBadge>
                </template>
              </QMediaRow>
            </QCard>
          </DevRow>
          <DevRow v-if="data.page" :label="`Page « ${data.page.title} » — ${weight(data.page)}`" stack>
            <p class="m-0 text-base text-muted-2">{{ data.page.seo.description }}</p>
          </DevRow>
        </DevSection>

        <DevSection title="Cas non nominaux" source="rien — la maquette et l'API ne les décrivent pas">
          <DevRow label="Une ressource absente renvoie null, elle ne lève pas">
            <QBadge :tone="data.missingDestination === null ? 'success' : 'danger'">
              destinationRepo.bySlug('atlantide') → {{ data.missingDestination === null ? 'null ✓' : 'inattendu' }}
            </QBadge>
            <QBadge :tone="data.missingSchool === null ? 'success' : 'danger'">
              schoolRepo.bySlug('ecole-qui-nexiste-pas') → {{ data.missingSchool === null ? 'null ✓' : 'inattendu' }}
            </QBadge>
          </DevRow>
        </DevSection>
      </template>

      <template v-else-if="status === 'pending'">
        <QSkeleton variant="card" />
        <QSkeleton variant="row" />
        <QSkeleton variant="row" />
      </template>
    </div>
  </div>
</template>
