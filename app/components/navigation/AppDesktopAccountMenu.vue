<script setup lang="ts">
/**
 * Menu compte desktop — s’ouvre depuis l’avatar (Figma Profilage `998:579`).
 * Liens : Mon projet, Réglages, déconnexion.
 */
import { onClickOutside } from '@vueuse/core'
import { useSessionStore } from '~/core/stores'

const localePath = useLocalePath()
const session = useSessionStore()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

onClickOutside(root, () => {
  open.value = false
})

const photoUrl = computed(() =>
  session.user?.profile.photo || session.user?.avatar || null,
)

const initials = computed(() => {
  const user = session.user
  if (!user) return ''
  const first = user.profile.firstName?.charAt(0) ?? ''
  const last = user.profile.lastName?.charAt(0) ?? ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return user.name.slice(0, 2).toUpperCase()
})

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

async function onLogout() {
  close()
  await session.logout()
  await navigateTo(localePath('/'))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <div ref="root" class="relative" @keydown="onKeydown">
    <button
      type="button"
      class="flex size-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-[#fef2f2] p-0 text-xl leading-20 font-semibold tracking-[-0.154px] text-desktop-brand"
      :aria-expanded="open"
      :aria-label="$t('nav.account')"
      @click="toggle"
    >
      <img
        v-if="photoUrl"
        :src="photoUrl"
        alt=""
        width="40"
        height="40"
        class="block size-full object-cover"
      >
      <span v-else>{{ initials }}</span>
    </button>

    <div
      class="absolute top-[calc(100%+10px)] right-0 z-60 w-220 origin-top-right rounded-[16px] border border-[#f3f4f6] bg-white p-8 shadow-[0_16px_40px_rgba(26,29,43,0.12)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity"
      :class="open
        ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
        : 'pointer-events-none -translate-y-6 scale-95 opacity-0'"
      role="menu"
      :aria-hidden="!open"
    >
      <NuxtLink
        :to="localePath('/mon-projet')"
        class="flex items-center rounded-[12px] px-14 py-12 text-[14px] leading-20 font-medium text-[#1a1d2b] no-underline transition-colors duration-150 hover:bg-[#fef2f2]"
        role="menuitem"
        @click="close"
      >
        {{ $t('nav.project') }}
      </NuxtLink>
      <NuxtLink
        :to="localePath('/reglages')"
        class="flex items-center rounded-[12px] px-14 py-12 text-[14px] leading-20 font-medium text-[#1a1d2b] no-underline transition-colors duration-150 hover:bg-[#fef2f2]"
        role="menuitem"
        @click="close"
      >
        {{ $t('menu.settings') }}
      </NuxtLink>
      <span aria-hidden="true" class="mx-10 my-4 block h-px bg-[#f3f4f6]" />
      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-[12px] border-0 bg-transparent px-14 py-12 text-left text-[14px] leading-20 font-medium text-[#ed1c24] transition-colors duration-150 hover:bg-[#fef2f2]"
        role="menuitem"
        @click="onLogout"
      >
        {{ $t('menu.signOut') }}
      </button>
    </div>
  </div>
</template>
