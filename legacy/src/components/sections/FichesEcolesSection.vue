<script lang="ts" setup>
import router from "@/router";
import { i18nRoute } from "@/utils";
import { flagBg } from "@/utils/flags";
import hecLogo from "@/assets/images/ecoles/logos/hec.svg";
import nyuLogo from "@/assets/images/ecoles/logos/nyu.svg";
import ubcLogo from "@/assets/images/ecoles/logos/ubc.svg";

const domains = [
  { key: "school-domain-management", path: "<path d='M3 8l9-4 9 4-9 4z'/><path d='M7 10v5c0 1 2 2.5 5 2.5s5-1.5 5-2.5v-5'/><path d='M21 8v5'/>" },
  { key: "school-domain-engineering", path: "<path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'/><circle cx='12' cy='12' r='3'/>" },
  { key: "school-domain-medicine", path: "<path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/><path d='M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27'/>" },
  { key: "school-domain-architecture", path: "<path d='M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13'/><path d='m8 6 2-2'/><path d='m18 16 2-2'/><path d='m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17'/><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/><path d='m15 5 4 4'/>" },
  { key: "school-domain-politics", path: "<path d='M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10h18L12 4z'/>" },
  { key: "school-domain-more", path: "<rect x='4' y='4' width='6' height='6' rx='1'/><rect x='14' y='4' width='6' height='6' rx='1'/><rect x='4' y='14' width='6' height='6' rx='1'/><rect x='14' y='14' width='6' height='6' rx='1'/>" },
];

const schools = [
  { logo: hecLogo, country: "school-dest-france" },
  { logo: nyuLogo, country: "school-dest-usa" },
  { logo: ubcLogo, country: "school-dest-canada" },
];

const rows = [
  { label: "fiche-row-ranking", icon: "<path d='M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3'/>", values: ["#47", "#25", "#38"] },
  { label: "fiche-row-tuition", icon: "<circle cx='12' cy='12' r='9'/><path d='M14.5 9.5C14 8.5 13 8 12 8c-1.5 0-2.5 1-2.5 2s1 1.8 2.5 2 2.5 1 2.5 2-1 2-2.5 2-2-.5-2.5-1.5M12 6.5v11'/>", values: ["€38,700", "$60,438", "CA$36,100"] },
  { label: "fiche-row-employability", icon: "<path d='M6 21V8l6-4 6 4v13M9 21v-5h6v5'/>", values: ["93%", "95%", "92%"] },
  { label: "fiche-row-duration", icon: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>", values: ["fiche-val-duration", "fiche-val-duration", "fiche-val-duration"], i18n: true },
  { label: "fiche-row-language", icon: "<circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18'/>", values: ["fiche-lang-fren", "fiche-lang-en", "fiche-lang-en"], i18n: true },
  { label: "fiche-row-accreditation", icon: "<path d='M12 3l8 4v5c0 4.4-3.4 7.7-8 9-4.6-1.3-8-4.6-8-9V7z'/><path d='M9 12l2 2 4-4'/>", values: ["AACSB, EQUIS, AMBA", "AACSB, EQUIS, AMBA", "AACSB, EQUIS, AMBA"] },
  { label: "fiche-row-partnerships", icon: "<circle cx='9' cy='8' r='3'/><circle cx='17' cy='10' r='2.5'/><path d='M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M14 19c0-2 1-3.6 3-4.2'/>", check: true },
];

const destinations = [
  { key: "dest-usa", flag: "us" },
  { key: "school-dest-france", flag: "fr" },
  { key: "school-dest-china", flag: "cn" },
  { key: "school-dest-uk", flag: "uk" },
  { key: "school-dest-canada", flag: "ca" },
  { key: "school-dest-germany", flag: "de" },
];

const navyFeatures = [
  "fiche-navy-1", "fiche-navy-2", "fiche-navy-3",
  "fiche-navy-4", "fiche-navy-5", "fiche-navy-6",
];

const goSchools = () =>
  router.push(i18nRoute({ name: "schools", params: { slug: "france", areaslug: "all" } }));
</script>

<template>
  <section class="w-full py-12 lg:py-16 bg-surface">
    <div class="global-container">
    <div class="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr_1fr] gap-10 lg:gap-7 items-start">

      <!-- LEFT -->
      <div class="flex flex-col min-w-0">
        <span class="inline-block w-fit rounded-lg bg-[#FCE6E8] px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-[#ED2530] mb-6">
          {{ $t("school-badge") }}
        </span>
        <h2 class="text-[22px] lg:text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-ink mb-5 whitespace-nowrap">
          {{ $t("school-title-line1") }}<br />
          <span class="text-[#ED2530]">{{ $t("school-title-line2") }}</span>
        </h2>
        <p class="text-[13.5px] lg:text-[15px] leading-[1.6] text-[#5B6275] max-w-[600px] mb-9">
          {{ $t("fiche-lead") }}
        </p>

        <!-- 6 domains in one row -->
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-5 mb-9">
          <div v-for="d in domains" :key="d.key" class="flex flex-col items-center gap-2 text-center">
            <div class="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[#FDEEEF]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-[22px] w-[22px]" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="d.path"></svg>
            </div>
            <span class="text-[11px] font-semibold text-ink leading-tight">{{ $t(d.key) }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-9">
          <button
            type="button"
            @click="goSchools"
            class="inline-flex items-center justify-center gap-3 rounded-xl bg-[#ED2530] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_12px_26px_-10px_rgba(237,37,48,.55)] hover:bg-[#D81E29] hover:-translate-y-0.5 transition-all w-fit whitespace-nowrap"
          >
            {{ $t("school-explore-btn") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" class="h-5 w-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <button type="button" class="inline-flex items-center gap-3 text-[15px] font-semibold text-ink w-fit group whitespace-nowrap">
            <span class="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-[#ED2530]/35 group-hover:bg-[#FDEEEF] transition-colors">
              <svg viewBox="0 0 24 24" fill="#ED2530" class="h-3.5 w-3.5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
            </span>
            {{ $t("section-watch") }}
          </button>
        </div>
      </div>

      <!-- CENTER: person + floating icons + comparison card -->
      <div class="relative flex justify-center items-end self-stretch min-w-0 min-h-[480px] lg:min-h-[540px]">
        <!-- halo -->
        <div
          class="absolute top-[4%] left-1/2 -translate-x-1/2 h-[340px] w-[340px] lg:h-[440px] lg:w-[440px] rounded-full z-0"
          style="background: radial-gradient(circle at 50% 45%, #FBDCDE 0%, #FCE9EA 45%, rgba(252,233,234,0) 72%);"
        ></div>

        <!-- floating icons -->
        <div class="hidden lg:flex absolute z-[3] top-[22%] left-[1%] h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c0 1 2 2.5 5 2.5s5-1.5 5-2.5v-5"/></svg>
        </div>
        <div class="hidden lg:flex absolute z-[3] top-[5%] left-1/2 -ml-2 h-10 w-10 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>
        </div>
        <div class="hidden lg:flex absolute z-[3] top-[54%] left-[2%] h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-5 w-5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l5-5 3 3 7-7"/><path d="M16 9h3v3"/></svg>
        </div>

        <!-- person placeholder (behind) -->
        <div class="hidden lg:flex absolute left-0 bottom-0 z-[1] h-[440px] w-[250px] flex-col items-center justify-center gap-2 rounded-[18px] bg-gradient-to-b from-[#FBDCDE] to-[#FDEEEF]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-12 w-12 opacity-50" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
          <span class="text-[12px] font-medium text-ink/40">Photo</span>
        </div>

        <!-- comparison card -->
        <div class="relative z-[2] w-full max-w-[400px] lg:ml-auto lg:mb-6 rounded-[20px] border border-[#ECE9EF] bg-surface p-5 shadow-[0_30px_60px_-30px_rgba(16,26,61,.28)]">
          <div class="text-[15px] font-semibold text-ink mb-4">{{ $t("fiche-compare-title") }}</div>

          <!-- school headers -->
          <div class="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-end gap-2 mb-3">
            <div></div>
            <div v-for="s in schools" :key="s.country" class="flex flex-col items-center gap-1.5">
              <div class="flex h-11 w-14 items-center justify-center rounded-md border border-[#ECE9EF] bg-surface p-1.5">
                <img :src="s.logo" alt="" class="max-h-full max-w-full object-contain" />
              </div>
              <small class="text-[10px] text-[#5B6275]">{{ $t(s.country) }}</small>
            </div>
          </div>

          <!-- rows -->
          <div class="flex flex-col">
            <div
              v-for="(row, idx) in rows"
              :key="row.label"
              class="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-2 py-2.5"
              :class="idx < rows.length - 1 ? 'border-b border-[#F1EEF3]' : ''"
            >
              <div class="flex items-center gap-1.5 text-[10.5px] font-medium text-ink whitespace-nowrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-3.5 w-3.5 shrink-0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="row.icon"></svg>
                {{ $t(row.label) }}
              </div>
              <template v-if="row.check">
                <span v-for="n in 3" :key="n" class="flex justify-center">
                  <span class="flex h-4 w-4 items-center justify-center rounded-full bg-[#1FA463]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" class="h-2.5 w-2.5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>
                  </span>
                </span>
              </template>
              <template v-else>
                <span v-for="(val, i) in row.values" :key="i" class="text-center text-[9px] text-[#5B6275] whitespace-nowrap">
                  {{ row.i18n ? $t(val) : val }}
                </span>
              </template>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 mt-4 -mx-6 -mb-6 px-6 py-3.5 rounded-b-[22px] bg-[#FDEEEF]">
            <span class="text-[11px] text-[#5B6275]">{{ $t("fiche-compare-footer") }}</span>
            <button type="button" @click="goSchools" class="text-[11px] font-semibold text-[#ED2530] hover:underline whitespace-nowrap">{{ $t("fiche-compare-link") }} →</button>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex flex-col gap-5 min-w-0">
        <!-- Destinations -->
        <div class="rounded-[22px] border border-[#ECE9EF] bg-surface p-6 shadow-[0_24px_50px_-28px_rgba(16,26,61,.18)]">
          <h4 class="text-[15px] font-semibold text-ink mb-4">{{ $t("school-destinations-title") }}</h4>
          <div class="grid grid-cols-2 gap-2.5">
            <div v-for="dest in destinations" :key="dest.key" class="flex items-center gap-2.5 rounded-xl bg-[#F8F6F9] px-3 py-2 text-[11px] font-medium text-ink">
              <span class="h-[22px] w-[22px] shrink-0 rounded-full bg-cover bg-center" :style="{ backgroundImage: flagBg(dest.flag) }"></span>
              {{ $t(dest.key) }}
            </div>
            <div class="col-span-2 flex items-center gap-2.5 rounded-xl bg-[#F8F6F9] px-3 py-2 text-[11px] font-medium text-[#5B6275]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#7A859B" class="h-[18px] w-[18px] shrink-0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>
              {{ $t("fiche-dest-more") }}
            </div>
          </div>
        </div>

        <!-- Navy card -->
        <div class="rounded-[22px] bg-[#1B2447] p-6 text-white shadow-[0_30px_60px_-30px_rgba(16,26,61,.5)]">
          <h4 class="text-[15px] font-semibold leading-snug mb-4">{{ $t("fiche-navy-title") }}</h4>
          <ul class="flex flex-col gap-3 mb-4">
            <li v-for="feat in navyFeatures" :key="feat" class="flex gap-3 text-[12px] leading-snug text-[#E8EAF2]">
              <span class="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ED2530]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" class="h-3 w-3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>
              </span>
              {{ $t(feat) }}
            </li>
          </ul>
          <div class="flex items-center gap-2.5 rounded-xl bg-white/[0.07] px-4 py-3 text-[12px] font-medium">
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0"><path d="M8 4h8v3a4 4 0 0 1-8 0z" fill="#F5A623"/><path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3" stroke="#F5A623" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11h4v3h-4zM9 17h6M11 14v3M13 14v3" stroke="#F5A623" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ $t("fiche-navy-pill") }}
          </div>
        </div>
      </div>

    </div>
    </div>
  </section>
</template>
