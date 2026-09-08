<script lang="ts" setup>
import router from "@/router";
import { i18nRoute } from "@/utils";
import { flagBg } from "@/utils/flags";

const featRows = [
  { title: "log-feat1-title", desc: "log-feat1-desc", path: "<circle cx='11' cy='11' r='7'/><path d='M21 21l-4-4'/>" },
  { title: "log-feat2-title", desc: "log-feat2-desc", path: "<path d='M12 3l8 4v5c0 4.4-3.4 7.7-8 9-4.6-1.3-8-4.6-8-9V7z'/><path d='M9 12l2 2 4-4'/>" },
  { title: "log-feat3-title", desc: "log-feat3-desc", path: "<path d='M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM20 13a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zM18 19a4 4 0 0 1-4 3h-2'/>" },
];

const types = [
  { title: "log-type1-title", desc: "log-type1-desc", path: "<circle cx='9' cy='8' r='3'/><circle cx='17' cy='9' r='2.5'/><path d='M3 19c0-3 2.7-5 6-5s6 2 6 5M15 19c0-2 1-3.5 3-4'/>" },
  { title: "log-type2-title", desc: "log-type2-desc", path: "<rect x='5' y='3' width='14' height='18' rx='1'/><path d='M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2'/>" },
  { title: "log-type3-title", desc: "log-type3-desc", path: "<path d='M4 11l8-7 8 7M6 9v10h12V9M10 19v-5h4v5'/>" },
];

const destinations = [
  { key: "school-dest-france", flag: "fr" },
  { key: "dest-usa", flag: "us" },
  { key: "school-dest-canada", flag: "ca" },
  { key: "school-dest-china", flag: "cn" },
  { key: "school-dest-germany", flag: "de" },
  { key: "log-dest-england", flag: "uk" },
];

const navyFeatures = [
  "log-navy-1", "log-navy-2", "log-navy-3", "log-navy-4", "log-navy-5",
];

const goLiving = () =>
  router.push(i18nRoute({ name: "living", params: { slug: "france" } }));
</script>

<template>
  <section
    class="w-full py-12 lg:py-16"
    style="background: linear-gradient(180deg, #FCF5F5 0%, #FFFFFF 60%);"
  >
    <div class="global-container">
    <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_1.75fr_1fr] gap-10 lg:gap-6 items-start">

      <!-- LEFT -->
      <div class="flex flex-col min-w-0">
        <span class="inline-block w-fit rounded-lg bg-[#FCE6E8] px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-[#ED2530] mb-6">
          {{ $t("log-badge") }}
        </span>
        <h2 class="text-[28px] lg:text-[36px] font-bold leading-[1.12] tracking-[-0.015em] text-ink mb-5">
          {{ $t("log-title-line1") }}<br />
          <span class="text-[#ED2530]">{{ $t("log-title-line2") }}</span>
        </h2>
        <p class="text-[16px] lg:text-[18px] leading-[1.65] text-[#5B6275] max-w-[600px] mb-8">
          {{ $t("log-lead") }}
        </p>

        <!-- feature list -->
        <div class="flex flex-col gap-5 mb-9">
          <div v-for="feat in featRows" :key="feat.title" class="flex gap-4">
            <div class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] bg-[#FDEEEF]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-6 w-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="feat.path"></svg>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-ink mb-1">{{ $t(feat.title) }}</h3>
              <p class="text-[13.5px] leading-[1.5] text-[#5B6275]">{{ $t(feat.desc) }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-9">
          <button
            type="button"
            @click="goLiving"
            class="inline-flex items-center justify-center gap-3 rounded-xl bg-[#ED2530] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_12px_26px_-10px_rgba(237,37,48,.55)] hover:bg-[#D81E29] hover:-translate-y-0.5 transition-all w-fit"
          >
            {{ $t("log-cta") }}
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

      <!-- CENTER: person + type cards side by side -->
      <div class="self-start w-full min-w-0">
        <div class="flex flex-col lg:flex-row items-center lg:items-stretch gap-6">
          <!-- person visual -->
          <div class="relative flex justify-center shrink-0 w-full lg:w-[210px] min-h-[420px] lg:min-h-[440px]">
            <div
              class="absolute top-[6%] left-1/2 -translate-x-1/2 h-[300px] w-[300px] lg:h-[400px] lg:w-[400px] rounded-full z-0"
              style="background: radial-gradient(circle at 50% 45%, #FBDCDE 0%, #FCE9EA 45%, rgba(252,233,234,0) 72%);"
            ></div>

            <!-- bubble -->
            <div class="absolute z-[3] top-[8%] left-0 flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 shadow-[0_14px_30px_-12px_rgba(16,26,61,.22)]">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDEEEF]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-4 w-4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 9v10h12V9"/></svg>
              </span>
              <span class="text-[12px] font-medium text-ink leading-tight max-w-[110px]">{{ $t("log-bubble") }}</span>
            </div>

            <!-- person placeholder -->
            <div class="relative z-[2] self-end h-[420px] w-[250px] lg:h-[440px] lg:w-[210px] rounded-[18px] bg-gradient-to-b from-[#FBDCDE] to-[#FDEEEF] flex flex-col items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-14 w-14 opacity-50" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
              <span class="text-[12px] font-medium text-ink/40">Photo</span>
            </div>
          </div>

          <!-- type cards -->
          <div class="flex flex-1 flex-col justify-center gap-4 w-full">
            <div v-for="t in types" :key="t.title" class="flex items-center gap-4 rounded-2xl border border-[#ECE9EF] bg-surface p-3.5 shadow-[0_18px_40px_-30px_rgba(16,26,61,.25)]">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#FDEEEF]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="t.path"></svg>
              </div>
              <div class="flex-1 min-w-0">
                <h5 class="text-[15px] font-semibold text-ink mb-0.5">{{ $t(t.title) }}</h5>
                <p class="text-[12.5px] leading-[1.4] text-[#5B6275]">{{ $t(t.desc) }}</p>
              </div>
              <div class="hidden sm:flex lg:hidden h-[64px] w-[84px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBDCDE] to-[#FDEEEF]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-7 w-7 opacity-40" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex flex-col gap-5 min-w-0">
        <div class="rounded-[22px] border border-[#ECE9EF] bg-surface p-6 shadow-[0_24px_50px_-28px_rgba(16,26,61,.18)]">
          <h4 class="text-[17px] font-semibold text-ink mb-5">{{ $t("log-dest-title") }}</h4>
          <div class="grid grid-cols-4 gap-x-2 gap-y-5">
            <div v-for="dest in destinations" :key="dest.key" class="flex flex-col items-center gap-2 text-center">
              <span class="h-9 w-9 shrink-0 rounded-full bg-cover bg-center shadow-[0_0_0_1px_rgba(16,26,61,.06)]" :style="{ backgroundImage: flagBg(dest.flag) }"></span>
              <span class="text-[11px] font-medium text-ink leading-tight">{{ $t(dest.key) }}</span>
            </div>
            <div class="flex flex-col items-center gap-2 text-center">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEEEF]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-4 w-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              <span class="text-[11px] font-medium text-[#5B6275] leading-tight">{{ $t("log-dest-more") }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-[22px] bg-[#1B2447] p-6 text-white shadow-[0_30px_60px_-30px_rgba(16,26,61,.5)]">
          <h4 class="text-[17px] font-semibold mb-5">{{ $t("log-navy-title") }}</h4>
          <ul class="flex flex-col gap-3.5 mb-5">
            <li v-for="feat in navyFeatures" :key="feat" class="flex gap-3 text-[13.5px] leading-snug text-[#E8EAF2]">
              <span class="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ED2530]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" class="h-3 w-3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>
              </span>
              {{ $t(feat) }}
            </li>
          </ul>
          <div class="flex items-center gap-2.5 rounded-xl bg-white/[0.07] px-4 py-3 text-[13px] font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5 shrink-0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 4.4-3.4 7.7-8 9-4.6-1.3-8-4.6-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>
            {{ $t("log-navy-pill") }}
          </div>
        </div>
      </div>

    </div>
    </div>

  </section>
</template>
