<script lang="ts" setup>
import router from "@/router";
import { i18nRoute } from "@/utils";

const profFeatures = [
  {
    title: "prof-feat1-title",
    desc: "prof-feat1-desc",
    path: "<circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='4'/><path d='M12 3v3M12 18v3M3 12h3M18 12h3'/>",
  },
  {
    title: "prof-feat2-title",
    desc: "prof-feat2-desc",
    path: "<circle cx='12' cy='12' r='9'/><path d='M15.5 8.5l-2 5-5 2 2-5z'/>",
  },
  {
    title: "prof-feat3-title",
    desc: "prof-feat3-desc",
    path: "<path d='M5 19V12M12 19V6M19 19v-9'/>",
  },
  {
    title: "prof-feat4-title",
    desc: "prof-feat4-desc",
    path: "<path d='M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z'/><path d='M9 12l2 2 4-4'/>",
  },
];

const quizOptions = [
  { key: "prof-quiz-opt1", sel: false },
  { key: "prof-quiz-opt2", sel: true },
  { key: "prof-quiz-opt3", sel: false },
  { key: "prof-quiz-opt4", sel: false },
];

const skills = [
  { key: "prof-skill-analysis", value: 90, color: "#ED2530" },
  { key: "prof-skill-creativity", value: 75, color: "#F5A623" },
  { key: "prof-skill-communication", value: 80, color: "#2D8CFF" },
  { key: "prof-skill-leadership", value: 85, color: "#1FA463" },
];

const jobs = ["prof-job1", "prof-job2", "prof-job3"];

const goProfilage = () => router.push(i18nRoute({ name: "profilage" }));
</script>

<template>
  <section
    class="w-full py-12 lg:py-16"
    style="background: linear-gradient(180deg, #FCF5F5 0%, #FFFFFF 60%);"
  >
    <div class="global-container">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-10 lg:gap-6 items-start">

      <!-- LEFT -->
      <div class="flex flex-col min-w-0">
        <span class="inline-block w-fit rounded-lg bg-[#FCE6E8] px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-[#ED2530] mb-6">
          {{ $t("prof-badge") }}
        </span>
        <h2 class="text-[28px] lg:text-[36px] font-bold leading-[1.1] tracking-[-0.015em] text-ink mb-5">
          <span class="text-[#ED2530]">{{ $t("prof-title-accent") }}</span> {{ $t("prof-title-rest") }}
        </h2>
        <p class="text-[16px] lg:text-[18px] leading-[1.65] text-[#5B6275] max-w-[600px] mb-9">
          {{ $t("prof-lead") }}
        </p>

        <div class="grid grid-cols-2 gap-5 mb-9">
          <div v-for="feat in profFeatures" :key="feat.title" class="flex flex-col">
            <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[14px] bg-[#FDEEEF] mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-6 w-6" v-html="feat.path"></svg>
            </div>
            <h3 class="text-[15px] font-semibold text-ink leading-tight mb-2">{{ $t(feat.title) }}</h3>
            <p class="text-[13px] leading-[1.55] text-[#5B6275]">{{ $t(feat.desc) }}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-9">
          <button
            type="button"
            @click="goProfilage"
            class="inline-flex items-center justify-center gap-3 rounded-xl bg-[#ED2530] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_12px_26px_-10px_rgba(237,37,48,.55)] hover:bg-[#D81E29] hover:-translate-y-0.5 transition-all w-fit"
          >
            {{ $t("prof-cta") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" class="h-5 w-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <button type="button" class="inline-flex items-center gap-3 text-[15px] font-semibold text-ink w-fit group">
            <span class="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-[#ED2530]/35 group-hover:bg-[#FDEEEF] transition-colors">
              <svg viewBox="0 0 24 24" fill="#ED2530" class="h-3.5 w-3.5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
            </span>
            {{ $t("section-watch") }}
          </button>
        </div>
      </div>

      <!-- CENTER: illustration + quiz card -->
      <div class="relative self-start min-w-0 lg:min-h-[560px]">
        <!-- halo -->
        <div
          class="absolute top-[4%] left-[4%] h-[300px] w-[300px] lg:h-[420px] lg:w-[420px] rounded-full z-0"
          style="background: radial-gradient(circle at 50% 45%, #FBDCDE 0%, #FCE9EA 45%, rgba(252,233,234,0) 72%);"
        ></div>

        <!-- floating icons -->
        <div class="hidden lg:flex absolute z-[3] top-[6%] left-[1%] h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10c-.7.7-1 1.4-1 2.5H9c0-1.1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/></svg>
        </div>
        <div class="hidden lg:flex absolute z-[3] top-[0%] left-[42%] h-10 w-10 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5a3 3 0 0 1 6 0 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0 3 3 0 0 1-2-5 3 3 0 0 1 2-5z"/><path d="M12 5v14"/></svg>
        </div>
        <div class="hidden lg:flex absolute z-[3] top-[34%] left-[0%] h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>
        </div>

        <!-- illustration placeholder -->
        <div class="relative lg:absolute lg:left-2 lg:bottom-0 z-[1] mx-auto h-[340px] w-[280px] lg:h-[440px] lg:w-[300px] rounded-[20px] bg-gradient-to-b from-[#FBDCDE] to-[#FDEEEF] flex flex-col items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-14 w-14 opacity-50" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
          <span class="text-[12px] font-medium text-ink/40">Illustration</span>
        </div>

        <!-- quiz card -->
        <div class="relative lg:absolute lg:top-3 lg:right-0 z-[10] mt-6 lg:mt-0 w-full lg:w-[330px] rounded-[18px] border border-[#ECE9EF] bg-surface p-5 shadow-[0_30px_60px_-30px_rgba(16,26,61,.3)]">
          <div class="text-[13px] text-[#5B6275] mb-2.5">{{ $t("prof-quiz-counter") }}</div>
          <div class="h-[5px] rounded bg-[#ECE9EF] mb-5 overflow-hidden">
            <div class="h-full w-1/5 rounded bg-[#ED2530]"></div>
          </div>
          <div class="text-[16px] font-semibold text-ink mb-4">{{ $t("prof-quiz-question") }}</div>
          <div class="flex flex-col gap-2.5">
            <div
              v-for="opt in quizOptions"
              :key="opt.key"
              class="flex items-center gap-3 rounded-xl border px-4 py-3 text-[14px] cursor-pointer transition-colors"
              :class="opt.sel ? 'border-[#ED2530] bg-[#FDEEEF] text-ink font-medium' : 'border-[#ECE9EF] text-[#5B6275]'"
            >
              <span
                class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]"
                :class="opt.sel ? 'border-[#ED2530]' : 'border-[#C7CCD8]'"
              >
                <span v-if="opt.sel" class="h-2 w-2 rounded-full bg-[#ED2530]"></span>
              </span>
              {{ $t(opt.key) }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex flex-col gap-5 min-w-0">
        <!-- Results card -->
        <div class="rounded-[22px] border border-[#ECE9EF] bg-surface p-6 shadow-[0_24px_50px_-28px_rgba(16,26,61,.18)]">
          <div class="text-[16px] font-semibold text-ink mb-4">{{ $t("prof-results-title") }}</div>
          <div class="flex items-center gap-5">
            <div class="flex flex-col items-center shrink-0">
              <div class="relative h-[72px] w-[72px]">
                <svg viewBox="0 0 36 36" class="h-[72px] w-[72px] -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EFEAEC" stroke-width="4"/>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ED2530" stroke-width="4" stroke-dasharray="97.4" stroke-dashoffset="14.6" stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-ink">85%</div>
              </div>
              <span class="mt-1.5 text-center text-[11px] leading-tight text-[#5B6275] max-w-[72px]">{{ $t("prof-results-sub") }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-2.5">
              <div v-for="s in skills" :key="s.key" class="flex items-center gap-2.5 text-[13.5px] text-ink">
                <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="{ background: s.color }"></span>
                {{ $t(s.key) }}
                <b class="ml-auto font-semibold">{{ s.value }}%</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Jobs card -->
        <div class="rounded-[22px] border border-[#ECE9EF] bg-surface p-6 shadow-[0_24px_50px_-28px_rgba(16,26,61,.18)]">
          <div class="text-[16px] font-semibold text-ink mb-4">{{ $t("prof-jobs-title") }}</div>
          <div class="flex flex-col gap-2.5">
            <div v-for="job in jobs" :key="job" class="flex items-center gap-3 rounded-xl border border-[#ECE9EF] px-3.5 py-3 text-[14px] font-medium text-ink">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDEEEF]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-[18px] w-[18px]" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </span>
              <span class="flex-1">{{ $t(job) }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-4 w-4 shrink-0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          </div>
          <div class="text-center mt-4">
            <button type="button" @click="goProfilage" class="text-[14px] font-semibold text-[#ED2530] hover:underline">{{ $t("prof-jobs-more") }}</button>
          </div>
        </div>
      </div>

    </div>
    </div>
  </section>
</template>
