<script setup lang="ts">
/**
 * Réglages — Mentions légales ← `maquette/pwa/pages/reglages-mentions.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | introduction | `.rml-intro` `margin-bottom: 16px` · h1 20px `-0.65px` · p 13px/22,75px |
 * | bandeau | `.rml-trust` `min-height: 86px`, `padding: 0 9px`, icône 44×44 |
 * | carte | `.rml-card` `margin-top: 20px`, filet `rgba(226,232,240,.7)`, `overflow: hidden` |
 * | ligne | `.rml-row` `padding: 16px`, filet supérieur `#f1f5f9` — absent sur la première |
 * | ligne | icône 40×40 · titre 13px/18,125px · description 10px/15px · chevron opacité 0,55 |
 * | aide | `.rml-help-wrap` `padding-top: 20px` · `.rml-help` hauteur fixe 86px |
 *
 * Les six documents pointent `#` dans la maquette : aucune URL n'est encore
 * arrêtée. Les lignes restent donc des `div`, pas des liens morts.
 */
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

const documents = [
  { id: 'cgu', icon: 'ic-rml-cgu', titleKey: 'settingsLegal.cguTitle', descKey: 'settingsLegal.cguDesc' },
  { id: 'privacy', icon: 'ic-rml-privacy', titleKey: 'settingsLegal.privacyTitle', descKey: 'settingsLegal.privacyDesc' },
  { id: 'cookies', icon: 'ic-rml-cookies', titleKey: 'settingsLegal.cookiesTitle', descKey: 'settingsLegal.cookiesDesc' },
  { id: 'rgpd', icon: 'ic-rml-rgpd', titleKey: 'settingsLegal.rgpdTitle', descKey: 'settingsLegal.rgpdDesc' },
  { id: 'cgv', icon: 'ic-rml-cgv', titleKey: 'settingsLegal.cgvTitle', descKey: 'settingsLegal.cgvDesc' },
  { id: 'legal', icon: 'ic-rml-legal', titleKey: 'settingsLegal.legalTitle', descKey: 'settingsLegal.legalDesc' },
]

usePageSeo(() => ({
  title: t('settingsLegal.seoTitle'),
  description: t('settingsLegal.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rml flex flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="rml-main flex w-full max-w-full flex-col box-border">
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" />

      <section class="rml-intro mb-16 w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsLegal.title') }}
        </h1>
        <p class="m-0 mt-4 text-lg leading-[22.75px] font-normal text-text">
          {{ $t('settingsLegal.intro') }}
        </p>
      </section>

      <aside class="rml-trust flex min-h-86 w-full items-center gap-11 rounded-xl bg-surface-2 px-9 box-border">
        <span class="rml-trust-icon size-44 shrink-0 overflow-hidden">
          <QIcon name="ic-rml-trust" :size="44" />
        </span>
        <div class="rml-trust-copy min-w-0 flex-1">
          <p class="rml-trust-title m-0 text-base leading-20 font-bold text-text">{{ $t('settingsLegal.trustTitle') }}</p>
          <p class="rml-trust-desc m-0 mt-4 text-xs leading-16 font-normal text-text">{{ $t('settingsLegal.trustDesc') }}</p>
        </div>
      </aside>

      <section class="rml-card mt-20 w-full overflow-hidden rounded-xl border border-rml-card-border bg-white box-border" :aria-label="$t('settingsLegal.cardLabel')">
        <div
          v-for="(doc, index) in documents"
          :key="doc.id"
          :class="[
            'rml-row flex w-full items-center gap-14 p-16 text-inherit box-border',
            index === 0 ? 'border-t-0' : 'border-t border-t-border-soft',
          ]"
        >
          <span class="rml-row-icon size-40 shrink-0 overflow-hidden">
            <QIcon :name="doc.icon" :size="40" />
          </span>
          <span class="rml-row-copy flex min-w-0 flex-1 flex-col">
            <span class="rml-row-title text-lg leading-[18.125px] font-medium text-black">{{ $t(doc.titleKey) }}</span>
            <span class="rml-row-desc mt-2 text-sm leading-15 font-normal text-black">{{ $t(doc.descKey) }}</span>
          </span>
          <img class="rml-row-chevron block size-20 shrink-0 opacity-55" src="/img/icons/ic-rg-chevron.svg" alt="" width="20" height="20">
        </div>
      </section>

      <div class="rml-help-wrap pt-20">
        <aside class="rml-help flex h-86 min-h-86 w-full items-center justify-between gap-8 rounded-xl bg-surface-2 px-9 box-border">
          <div class="rml-help-main flex min-w-0 flex-1 items-start gap-11">
            <span class="rml-help-icon flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
              <QIcon name="ic-rml-headset" :size="24" />
            </span>
            <div class="rml-help-copy min-w-0 flex-1">
              <p class="rml-help-title m-0 text-base leading-20 font-bold text-text">{{ $t('settingsLegal.helpTitle') }}</p>
              <p class="rml-help-desc m-0 mt-4 text-xs leading-16 font-normal text-text">{{ $t('settingsLegal.helpDesc') }}</p>
            </div>
          </div>
          <a href="#" class="rml-help-cta shrink-0 rounded-xl border border-primary-link bg-white px-11 py-9 text-sm leading-16 font-medium whitespace-nowrap text-primary-link no-underline">
            {{ $t('settingsLegal.contactSupport') }}
          </a>
        </aside>
      </div>
    </div>
  </div>
</template>
