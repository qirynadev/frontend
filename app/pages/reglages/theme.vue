<script setup lang="ts">
/**
 * Réglages — Thème ← `maquette/pwa/pages/reglages-theme.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | introduction | `.rt-intro` `margin-bottom: 20px` · h1 20px `-0.65px` · p 13px/22,75px |
 * | intitulé | `.rt-pick-label` 14px/24px en `600`, `margin-bottom: 12px` |
 * | option | `.rt-option` `padding: 17px`, filet `rgba(226,232,240,.8)` · sélectionnée : `#4f18f6` sur `#faf7fd` |
 * | aperçu | 86×86, rayon 8 · icône 36×36 décalée de 2px · copie `gap: 10px` |
 * | encart | `.rt-info` `min-height: 61px`, `padding: 8px 9px`, icône 44×44 |
 * | bouton | `.rt-cta` `margin-top: 28px`, `padding: 16px 24px`, fond `#4309fc` |
 *
 * Le choix n'est pas encore appliqué : l'application n'a pas de thème sombre.
 * L'écran enregistre donc une préférence sans effet visible — c'est aussi ce
 * que fait la maquette, dont le bouton ne pilote rien.
 *
 * Accessible sans connexion : préférence purement locale, aucun appel
 * authentifié ici.
 */
const { t } = useI18n()

type ThemeId = 'clair' | 'sombre' | 'systeme'

const options: { id: ThemeId, titleKey: string, descKey: string, preview: string, icon: string }[] = [
  { id: 'clair', titleKey: 'settingsTheme.lightTitle', descKey: 'settingsTheme.lightDesc', preview: '/img/rt-preview-clair.webp', icon: 'ic-rt-sun' },
  { id: 'sombre', titleKey: 'settingsTheme.darkTitle', descKey: 'settingsTheme.darkDesc', preview: '/img/rt-preview-sombre.webp', icon: 'ic-rt-moon' },
  { id: 'systeme', titleKey: 'settingsTheme.systemTitle', descKey: 'settingsTheme.systemDesc', preview: '/img/rt-preview-systeme.webp', icon: 'ic-rt-system' },
]

const chosen = ref<ThemeId>('clair')

usePageSeo(() => ({
  title: t('settingsTheme.seoTitle'),
  description: t('settingsTheme.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rt flex flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="rt-main flex w-full max-w-full flex-col gap-15 box-border">
      <AppTopBar :back="true" back-to="/reglages" :gap="0" />

      <section class="rt-intro w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsTheme.title') }}
        </h1>
        <p class="m-0 mt-4 text-lg leading-[22.75px] font-normal text-text">
          {{ $t('settingsTheme.intro') }}
        </p>
      </section>

      <p class="rt-pick-label m-0 text-xl leading-24 font-semibold text-text">
        {{ $t('settingsTheme.pickLabel') }}
      </p>

      <div class="rt-options flex w-full flex-col gap-15" role="radiogroup" :aria-label="$t('settingsTheme.pickLabel')">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          role="radio"
          :aria-checked="chosen === option.id"
          :class="[
            'rt-option flex w-full items-center gap-12 rounded-xl border p-17 text-left cursor-pointer box-border',
            chosen === option.id ? 'is-selected border-rt-option-selected-border bg-rt-option-selected-bg' : 'border-rt-option-border bg-white',
          ]"
          @click="chosen = option.id"
        >
          <span class="rt-option-main flex min-w-0 flex-1 items-center gap-14">
            <span class="rt-option-preview size-86 shrink-0 overflow-hidden rounded-lg">
              <img :src="option.preview" alt="" width="86" height="86" class="block size-86 object-cover">
            </span>
            <span class="rt-option-body flex min-w-0 flex-1 items-start gap-10">
              <span class="rt-option-icon mt-2 size-36 shrink-0 overflow-hidden">
                <QIcon :name="option.icon" :size="36" />
              </span>
              <span class="rt-option-copy flex min-w-0 flex-1 flex-col gap-10">
                <span class="rt-option-title text-xl leading-[18.75px] font-semibold text-black">{{ $t(option.titleKey) }}</span>
                <span class="rt-option-desc text-base leading-[16.5px] font-normal text-rt-option-desc">{{ $t(option.descKey) }}</span>
              </span>
            </span>
          </span>
          <span
            :class="[
              'rt-radio flex size-20 shrink-0 items-center justify-center rounded-full border bg-white box-border',
              chosen === option.id ? 'border-rt-radio-selected-border' : 'border-rt-radio-border',
            ]"
            aria-hidden="true"
          >
            <span :class="['rt-radio-dot size-10 rounded-full', chosen === option.id ? 'bg-rl-radio-dot' : 'bg-transparent']" />
          </span>
        </button>
      </div>

      <aside class="rt-info flex min-h-61 w-full items-center gap-11 rounded-xl bg-surface-2 px-9 py-8 box-border">
        <span class="rt-info-icon size-44 shrink-0 overflow-hidden">
          <QIcon name="ic-rt-info" :size="44" />
        </span>
        <p class="m-0 min-w-0 flex-1 text-sm leading-16 font-normal text-text">{{ $t('settingsTheme.infoText') }}</p>
      </aside>

      <button
        type="button"
        class="rt-cta flex w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-rl-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white box-border"
      >
        {{ $t('settingsTheme.save') }}
      </button>
    </div>
  </div>
</template>
