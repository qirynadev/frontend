<script setup lang="ts">
/**
 * Réglages ← `maquette/pwa/pages/reglages.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | introduction | `.rg-intro` `margin-bottom: 28px` · h1 20px `-0.65px` · p 14px/22,75px |
 * | section | `.rg-section` `margin-bottom: 24px` · titre 14px/20px, interlettrage `0,7px` |
 * | carte | `.rg-card` rayon 16, filet `#e5e7eb`, ombre `0 2px 10px -3px` |
 * | ligne | `.rg-row` `padding: 16px`, filet bas `rgba(229,231,235,.5)` — absent sur la dernière |
 * | ligne | icône 40×40 rayon 10 · titre 16px/24px · description 14px/20px |
 * | déconnexion | `.rg-row--danger` titre `#e71816`, pastille 40×40 sur `#fef2f2`, icône 20×20 |
 *
 * `.rg-section:nth-of-type(n+3) .rg-row-title` teinte en indigo les titres à
 * partir de la troisième section — d'où `indigo` porté par la donnée plutôt
 * que par un sélecteur positionnel, plus fragile.
 *
 * Les entrées sans écran pointent `#` dans la maquette : elles restent des
 * `div`, pas des liens morts.
 */
import { NuxtLink } from '#components'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

interface Row {
  id: string
  icon: string
  titleKey: string
  descKey?: string
  to?: string
  /** Valeur affichée à droite (ligne Thème). */
  valueKey?: string
  indigo?: boolean
  /** Ligne Thème : porte `.rg-row--theme`. */
  theme?: boolean
  danger?: boolean
}

const sections: { titleKey: string, rows: Row[] }[] = [
  {
    titleKey: 'settings.sectionAccount',
    rows: [
      { id: 'personal', icon: 'ic-rg-person', titleKey: 'settings.personalTitle', descKey: 'settings.personalDesc' },
      { id: 'password', icon: 'ic-rg-lock', titleKey: 'settings.passwordTitle', descKey: 'settings.passwordDesc', to: '/reglages/mot-de-passe' },
    ],
  },
  {
    titleKey: 'settings.sectionPreferences',
    rows: [
      { id: 'language', icon: 'ic-rg-globe', titleKey: 'settings.languageTitle', descKey: 'settings.languageDesc', to: '/reglages/langues', indigo: true },
      { id: 'theme', icon: 'ic-rg-theme', titleKey: 'settings.themeTitle', valueKey: 'settings.themeValue', to: '/reglages/theme', indigo: true, theme: true },
    ],
  },
  {
    titleKey: 'settings.sectionOther',
    rows: [
      { id: 'help', icon: 'ic-rg-help', titleKey: 'settings.helpTitle', descKey: 'settings.helpDesc', indigo: true },
      { id: 'legal', icon: 'ic-rg-legal', titleKey: 'settings.legalTitle', descKey: 'settings.legalDesc', to: '/reglages/mentions', indigo: true },
      { id: 'logout', icon: 'ic-rg-logout', titleKey: 'settings.logoutTitle', descKey: 'settings.logoutDesc', to: '/connexion', danger: true, indigo: true },
    ],
  },
]

usePageSeo(() => ({
  title: t('settings.seoTitle'),
  description: t('settings.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rg flex min-h-screen flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="rg-main flex w-full max-w-full flex-col gap-15 pb-[var(--spacing-content-bottom)] box-border">
      <AppTopBar :back="true" back-to="/" :notifications="3" />

      <section class="rg-intro w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settings.title') }}
        </h1>
        <p class="m-0 mt-4 text-xl leading-[22.75px] font-normal text-text">
          {{ $t('settings.intro') }}
        </p>
      </section>

      <section v-for="section in sections" :key="section.titleKey" class="rg-section flex flex-col gap-15 w-full">
        <h2 class="rg-section-title m-0 px-4 text-xl leading-20 font-semibold tracking-[0.7px] text-black">
          {{ $t(section.titleKey) }}
        </h2>

        <div class="rg-card w-full overflow-hidden rounded-[16px] border border-rg-card-border bg-rg-card-bg shadow-rg box-border">
          <component
            :is="row.to ? NuxtLink : 'div'"
            v-for="(row, index) in section.rows"
            :key="row.id"
            :to="row.to ? localePath(row.to) : undefined"
            :class="[
              'rg-row flex w-full items-center p-16 text-inherit no-underline box-border',
              row.danger ? 'rg-row--danger' : '',
              row.theme ? 'rg-row--theme' : '',
              index === section.rows.length - 1 ? 'border-b-0' : 'border-b border-b-rg-row-border',
            ]"
          >
            <span
              :class="[
                'rg-row-icon mr-16 size-40 shrink-0 overflow-hidden rounded-xl',
                row.danger ? 'rg-row-icon--danger flex items-center justify-center bg-rg-danger-bg' : '',
              ]"
            >
              <QIcon :name="row.icon" :size="row.danger ? 20 : 40" />
            </span>

            <span class="rg-row-copy flex min-w-0 flex-1 flex-col items-start">
              <span
                :class="[
                  'rg-row-title text-exact-16 leading-24 font-semibold',
                  row.indigo ? 'text-rg-row-indigo' : row.danger ? 'text-rg-danger' : 'text-black',
                ]"
              >{{ $t(row.titleKey) }}</span>
              <span
                v-if="row.descKey"
                :class="['rg-row-desc mt-2 text-xl leading-20 font-normal', row.danger ? 'text-rg-danger-desc' : 'text-rg-row-desc']"
              >{{ $t(row.descKey) }}</span>
            </span>

            <span v-if="row.valueKey" class="rg-row-value mr-8 shrink-0 text-xl leading-20 font-normal text-rg-row-value">
              {{ $t(row.valueKey) }}
            </span>

            <img
              v-if="!row.danger"
              class="rg-row-chevron block size-20 shrink-0 object-contain"
              src="/img/icons/ic-rg-chevron.svg"
              alt=""
              width="20"
              height="20"
            >
          </component>
        </div>
      </section>
    </div>
  </div>
</template>
