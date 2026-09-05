<script setup lang="ts">
/**
 * Lien nav + sous-menu — effet legacy (fade 0,5s, barre rouge, drapeaux).
 */
export interface DesktopNavDropdownItem {
  title: string
  href: string
  flag?: string | null
}

defineProps<{
  label: string
  to: string
  items: DesktopNavDropdownItem[]
}>()

const localePath = useLocalePath()
</script>

<template>
  <div class="group relative flex h-full items-center">
    <NuxtLink
      :to="localePath(to)"
      class="relative flex h-full items-center whitespace-nowrap px-10 pt-30 pb-26 text-[15px] font-medium text-[#3f4254] no-underline transition-colors duration-150 group-hover:text-[#fc1e3d]"
    >
      {{ label }}
    </NuxtLink>
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-4 origin-center scale-x-0 rounded-[5px] bg-[#ff3942] transition-transform duration-500 group-hover:scale-x-100 group-hover:group-has-[.submenu:hover]:scale-x-0"
    />

    <ul
      class="submenu invisible absolute top-full left-0 z-60 mt-10 min-w-160 w-max rounded-b-[6px] bg-white py-3 opacity-0 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:visible group-hover:mt-0 group-hover:opacity-100"
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
