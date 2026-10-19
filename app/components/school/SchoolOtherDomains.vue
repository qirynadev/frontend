<script setup lang="ts">
/**
 * « Cette école propose aussi : Droit, Médecine » : une école enseignée dans
 * plusieurs domaines a une fiche par domaine (décision du 2026-10-14, plan IA
 * lot 7). Chaque domaine mène à sa fiche, même adresse avec `?domaine=`.
 * Rien n'est affiché quand l'école n'a qu'une fiche.
 */
import type { SchoolDomain } from '~/core/contracts'

const props = defineProps<{
  domains: SchoolDomain[]
  destinationSlug: string
  schoolSlug: string
}>()

const localePath = useLocalePath()

function domainHref(domain: SchoolDomain) {
  return localePath(`/destinations/${props.destinationSlug}/ecoles/${props.schoolSlug}?domaine=${domain.slug}`)
}
</script>

<template>
  <nav
    v-if="domains.length > 0"
    class="flex w-full flex-wrap items-center gap-8"
    :aria-label="$t('school.detail.otherDomainsLabel')"
  >
    <span class="text-md leading-[19.5px] font-medium text-text">{{ $t('school.detail.otherDomains') }}</span>
    <NuxtLink
      v-for="domain in domains"
      :key="domain.id"
      :to="domainHref(domain)"
      class="box-border rounded-xl border border-le-chip-border bg-surface-card px-12 py-8 text-md leading-[19.5px] font-medium text-primary-link no-underline shadow-le-chip"
    >
      {{ domain.title }}
    </NuxtLink>
  </nav>
</template>
