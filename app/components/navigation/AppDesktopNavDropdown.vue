<script setup lang="ts">
/**
 * Lien nav + sous-menu — effet legacy (fade 0,5s, barre rouge, drapeaux).
 */
import type { DesktopNavSectionId } from '~/config/desktop-navigation'

export interface DesktopNavDropdownItem {
  title: string
  href: string
  flag?: string | null
}

const props = defineProps<{
  menuId: DesktopNavSectionId
  label: string
  to: string
  items: DesktopNavDropdownItem[]
  open?: boolean
}>()

const localePath = useLocalePath()
const { openId, close } = useDesktopNavMenu()
const root = ref<HTMLElement | null>(null)

function onEnter() {
  if (openId.value && openId.value !== props.menuId) close()
}

function onLeave() {
  if (props.open) close()
}

watch(() => props.open, (isOpen, _wasOpen, onCleanup) => {
  if (!isOpen || !import.meta.client) return
  const onPointer = (event: PointerEvent) => {
    if (root.value?.contains(event.target as Node)) return
    close()
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }
  const timer = window.setTimeout(() => {
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
  }, 0)
  onCleanup(() => {
    window.clearTimeout(timer)
    document.removeEventListener('pointerdown', onPointer)
    document.removeEventListener('keydown', onKey)
  })
})
</script>

<template>
  <div
    ref="root"
    class="group relative flex h-full items-center"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <NuxtLink
      :to="localePath(to)"
      class="relative flex h-full items-center whitespace-nowrap px-10 pt-30 pb-26 text-[15px] font-medium text-[#3f4254] no-underline transition-colors duration-150 group-hover:text-[#fc1e3d]"
      :class="open && 'text-[#fc1e3d]'"
      :aria-expanded="open ? 'true' : undefined"
      :aria-haspopup="items.length > 0 ? 'menu' : undefined"
    >
      {{ label }}
    </NuxtLink>
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-4 origin-center rounded-[5px] bg-[#ff3942] transition-transform duration-500"
      :class="open
        ? 'scale-x-100'
        : 'scale-x-0 group-hover:scale-x-100 group-hover:group-has-[.submenu:hover]:scale-x-0'"
    />

    <ul
      class="submenu absolute top-full left-0 z-60 min-w-160 w-max rounded-b-[6px] bg-white py-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.4)] transition-all duration-500"
      :class="open
        ? 'visible mt-0 opacity-100'
        : 'invisible mt-10 opacity-0 group-hover:visible group-hover:mt-0 group-hover:opacity-100'"
      role="menu"
    >
      <li
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 h-4 origin-center scale-x-0 rounded-[5px] bg-[#ff3942] transition-transform duration-500 group-hover:group-has-[.submenu:hover]:scale-x-100"
      />
      <li v-for="item in items" :key="item.href + item.title" class="m-0 list-none p-0">
        <NuxtLink
          :to="localePath(item.href)"
          role="menuitem"
          class="flex w-full items-center gap-10 px-20 py-9 text-[14px] font-normal tracking-normal text-[#0a1330] no-underline transition-all duration-500 hover:bg-[#f8f9fa] hover:font-bold"
        >
          <img
            v-if="item.flag"
            :src="item.flag"
            alt=""
            width="20"
            height="20"
            class="size-20 shrink-0 rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
          >
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
