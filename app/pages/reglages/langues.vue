<script setup lang="ts">
/**
 * Réglages — Langue ← `maquette/pwa/pages/reglages-langues.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.page-rl .home-topbar` `padding-bottom: 30px` |
 * | introduction | `.rl-intro` `margin-bottom: 16px` · h1 20px `-0.65px` · p 13px/22,75px |
 * | carte | `.rl-card` `padding: 16px`, rayon 10, ombre `0 0 3.5px` · titre 15px/22,5px |
 * | option | `.rl-option` `padding: 15px`, filet `#f2f2fa` · sélectionnée : `#8a6bfd` sur `#f7f5fe` |
 * | drapeau | 40×40 rond · titre 15px/18,75px en `800` · description 12px/12px |
 * | bandeau | `.rl-banner` `min-height: 86px`, `padding: 4px 9px`, illustration 90×78 |
 * | bouton | `.rl-cta` `margin-top: 28px`, `padding: 16px 24px`, fond `#4309fc` |
 *
 * Le choix agit réellement sur la langue de l'application : `setLocale` pose le
 * cookie `qiryna_locale` et réécrit l'URL selon `prefix_except_default`.
 */
definePageMeta({ middleware: 'auth' })

const { t, locale, setLocale } = useI18n()

type LocaleCode = 'fr' | 'en'

const options: { code: LocaleCode, labelKey: string, descKey: string, flag: string }[] = [
  { code: 'fr', labelKey: 'settingsLanguage.french', descKey: 'settingsLanguage.frenchDesc', flag: '/img/rl-flag-fr.webp' },
  { code: 'en', labelKey: 'settingsLanguage.english', descKey: 'settingsLanguage.englishDesc', flag: '/img/rl-flag-en.webp' },
]

/** Sélection locale : la langue ne bascule qu'à l'enregistrement. */
const chosen = ref<LocaleCode>(locale.value as LocaleCode)

async function save() {
  if (chosen.value !== locale.value) await setLocale(chosen.value)
}

usePageSeo(() => ({
  title: t('settingsLanguage.seoTitle'),
  description: t('settingsLanguage.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rl flex flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="rl-main flex w-full max-w-full flex-col box-border">
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" />

      <section class="rl-intro mb-16 w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsLanguage.title') }}
        </h1>
        <p class="m-0 mt-4 text-lg leading-[22.75px] font-normal text-text">
          {{ $t('settingsLanguage.intro') }}
        </p>
      </section>

      <section class="rl-card w-full rounded-xl bg-white p-16 shadow-card box-border">
        <h2 class="rl-card-title mt-0 mb-12 px-4 text-2xl leading-[22.5px] font-bold text-black">
          {{ $t('settingsLanguage.cardTitle') }}
        </h2>

        <div class="rl-options flex w-full flex-col gap-12" role="radiogroup" :aria-label="$t('settingsLanguage.cardTitle')">
          <button
            v-for="option in options"
            :key="option.code"
            type="button"
            role="radio"
            :aria-checked="chosen === option.code"
            :class="[
              'rl-option flex w-full items-center gap-12 rounded-xl border p-15 text-left cursor-pointer box-border',
              chosen === option.code ? 'is-selected border-rl-option-selected-border bg-rl-option-selected-bg' : 'border-rl-option-border bg-white',
            ]"
            @click="chosen = option.code"
          >
            <span class="rl-option-main flex min-w-0 flex-1 items-center gap-14">
              <span class="rl-flag size-40 shrink-0 overflow-hidden rounded-full">
                <img :src="option.flag" alt="" width="40" height="40" class="block size-40 object-cover">
              </span>
              <span class="rl-option-copy flex min-w-0 flex-col">
                <span class="rl-option-title text-2xl leading-[18.75px] font-extrabold text-rl-option-title">
                  {{ $t(option.labelKey) }}
                </span>
                <span class="rl-option-desc mt-2 text-base leading-[12px] font-normal text-text">
                  {{ chosen === option.code ? $t('settingsLanguage.currentLanguage') : $t(option.descKey) }}
                </span>
              </span>
            </span>
            <span
              :class="[
                'rl-radio flex size-20 shrink-0 items-center justify-center rounded-full border bg-white box-border',
                chosen === option.code ? 'border-rl-radio-selected-border' : 'border-rl-radio-border',
              ]"
              aria-hidden="true"
            >
              <span :class="['rl-radio-dot size-10 rounded-full', chosen === option.code ? 'bg-rl-radio-dot' : 'bg-transparent']" />
            </span>
          </button>
        </div>
      </section>

      <aside class="rl-banner mt-20 flex min-h-86 w-full items-center gap-11 rounded-xl bg-surface-2 px-9 py-4 box-border">
        <span class="rl-banner-illus h-78 w-90 shrink-0 overflow-hidden">
          <img src="/img/rl-banner-globe.webp" alt="" width="90" height="78" class="block h-78 w-90 object-cover object-center">
        </span>
        <div class="rl-banner-copy min-w-0 flex-1">
          <p class="rl-banner-title m-0 text-base leading-20 font-bold text-text">{{ $t('settingsLanguage.bannerTitle') }}</p>
          <p class="rl-banner-desc m-0 mt-4 text-sm leading-16 font-normal text-text">{{ $t('settingsLanguage.bannerDesc') }}</p>
        </div>
      </aside>

      <button
        type="button"
        class="rl-cta mt-28 flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-rl-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white box-border"
        @click="save"
      >
        {{ $t('settingsLanguage.save') }}
      </button>
    </div>
  </div>
</template>
