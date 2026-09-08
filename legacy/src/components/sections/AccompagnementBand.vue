<script lang="ts" setup>
const steps = [
  { num: 1, title: "band-step1-title", desc: "band-step1-desc", path: "<circle cx='11' cy='11' r='7'/><path d='M21 21l-4-4'/>" },
  { num: 2, title: "band-step2-title", desc: "band-step2-desc", path: "<rect x='4' y='5' width='16' height='16' rx='2'/><path d='M4 9h16M8 3v4M16 3v4'/>" },
  { num: 3, title: "band-step3-title", desc: "band-step3-desc", path: "<path d='M7 3h7l4 4v14H7z'/><path d='M14 3v4h4M10 13h6M10 17h6'/>" },
  { num: 4, title: "band-step4-title", desc: "band-step4-desc", path: "<circle cx='8' cy='14' r='4'/><path d='M11 11l8-8 2 2-2 2 2 2-3 2-2-2'/>" },
  { num: 5, title: "band-step5-title", desc: "band-step5-desc", path: "<path d='M4 11l8-7 8 7M6 9v10h12V9M10 19v-5h4v5'/>" },
];
</script>

<template>
  <div class="w-full py-10 lg:py-12 bg-[#FDEEEF]">
    <div class="global-container">
    <div class="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-3">
      <h3 class="shrink-0 text-[22px] lg:text-[24px] font-bold leading-tight text-ink lg:w-[180px]">
        {{ $t("band-title") }}
      </h3>

      <div class="flex flex-1 flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
        <template v-for="(step, i) in steps" :key="step.num">
          <div class="flex flex-col items-center text-center lg:flex-1">
            <div class="relative mb-3">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.25)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-6 w-6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="step.path"></svg>
              </div>
              <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ED2530] text-[11px] font-bold text-white">
                {{ step.num }}
              </span>
            </div>
            <h4 class="text-[15px] font-semibold text-ink mb-1">{{ $t(step.title) }}</h4>
            <p class="text-[12.5px] leading-[1.45] text-[#5B6275] max-w-[190px]">{{ $t(step.desc) }}</p>
          </div>

          <!-- dashed arrow connector -->
          <div v-if="i < steps.length - 1" class="hidden lg:flex shrink-0 items-start justify-center w-6 pt-5">
            <svg viewBox="0 0 40 24" class="h-4 w-7" fill="none">
              <path d="M2 12h30" stroke="#ED2530" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 4"/>
              <path d="M30 6l7 6-7 6" stroke="#ED2530" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
      </div>
    </div>
    </div>
  </div>
</template>
