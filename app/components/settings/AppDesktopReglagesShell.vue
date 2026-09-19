<script setup lang="ts">
/**
 * Cadre desktop Réglages : artboard boxed 1728 + rail 334 (fiche / domaines).
 * Pas de maquette Web — même chrome que les autres écrans desktop.
 */
import { NuxtLink } from '#components'
import { useSessionStore } from '~/core/stores'
import {
  desktopReglagesItemActive,
  desktopReglagesNav,
} from '~/config/desktop-reglages'

defineProps<{
  title: string
  intro?: string
}>()

const route = useRoute()
const localePath = useLocalePath()
const session = useSessionStore()

const photoUrl = computed(() =>
  session.user?.profile.photo || session.user?.avatar || null,
)

const displayName = computed(() =>
  session.user?.name || session.user?.profile.firstName || '',
)

const initials = computed(() => {
  const user = session.user
  if (!user) return '?'
  const first = user.profile.firstName?.charAt(0) ?? ''
  const last = user.profile.lastName?.charAt(0) ?? ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return user.name.slice(0, 2).toUpperCase()
})

const navSections = computed(() =>
  desktopReglagesNav
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.danger || session.isAuthenticated),
    }))
    .filter(section => section.items.length > 0),
)

async function onLogout() {
  await session.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div class="desktop-boxed desktop-split gap-23 pt-32 pb-32">
    <aside class="desktop-rail-sm flex flex-col gap-16">
      <div class="flex w-full items-center gap-16 rounded-[16px] border border-[#f9fafb] bg-white px-24 py-20 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
        <span class="flex size-56 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fef2f2] text-[16px] leading-20 font-semibold text-[#ff1b40]">
          <img
            v-if="photoUrl"
            :src="photoUrl"
            alt=""
            width="56"
            height="56"
            class="block size-full object-cover"
          >
          <span v-else>{{ initials }}</span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 truncate text-[16px] leading-20 font-semibold tracking-[-0.154px] text-[#151515]">
            {{ displayName || $t('desktop.reglages.guestName') }}
          </p>
          <p class="m-0 mt-4 truncate text-[12px] leading-16 text-[#6b7280]">
            {{ session.user?.email || $t('desktop.reglages.guestHint') }}
          </p>
        </div>
      </div>

      <nav
        class="flex w-full flex-col gap-18 rounded-[16px] border border-[#f9fafb] bg-white px-16 pt-20 pb-16 shadow-[0_0_3px_rgba(0,0,0,0.12)]"
        :aria-label="$t('desktop.reglages.navLabel')"
      >
        <section v-for="section in navSections" :key="section.titleKey" class="flex flex-col gap-8">
          <h2 class="m-0 px-12 text-[12px] leading-16 font-semibold tracking-[0.4px] text-[#6b7280]">
            {{ $t(section.titleKey) }}
          </h2>
          <div class="flex flex-col gap-4">
            <component
              :is="item.danger ? 'button' : NuxtLink"
              v-for="item in section.items"
              :key="item.id"
              :to="item.to ? localePath(item.to) : undefined"
              :type="item.danger ? 'button' : undefined"
              class="flex cursor-pointer items-center gap-12 rounded-[10px] border-0 px-12 py-10 text-left text-[13px] leading-[18px] font-medium no-underline"
              :class="item.danger
                ? 'cursor-pointer bg-transparent text-[#e71816]'
                : desktopReglagesItemActive(route.path, item)
                  ? 'bg-[#232a4a] text-white'
                  : 'bg-transparent text-[#151515]'"
              @click="item.danger ? onLogout() : undefined"
            >
              <span
                class="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-[8px]"
                :class="item.danger
                  ? 'bg-[#fef2f2]'
                  : desktopReglagesItemActive(route.path, item)
                    ? 'bg-white/10'
                    : 'bg-[#f8f8fc]'"
              >
                <QIcon :name="item.icon" :size="item.danger ? 16 : 32" />
              </span>
              <span class="min-w-0 flex-1 truncate">{{ $t(item.titleKey) }}</span>
            </component>
          </div>
        </section>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col gap-23">
      <header class="flex flex-col gap-8">
        <h1 class="m-0 text-[25px] leading-32 font-bold tracking-[-0.6px] text-black">
          {{ title }}
        </h1>
        <p v-if="intro" class="m-0 max-w-720 text-[16px] leading-[22px] font-medium tracking-[-0.154px] text-[#6b7280]">
          {{ intro }}
        </p>
      </header>
      <slot />
    </div>
  </div>
</template>
