<script setup lang="ts">
/**
 * Politique de cookies ← Figma `1562:1890` + texte CMS.
 *
 * Le HTML administré reste la source légale. Le chrome Figma (préférences,
 * inventaire, durées) s’ajoute au-dessus, branché sur `useCookieConsent`.
 */
import DesktopPagesCookies from '~/desktop-pages/pages-cookies.vue'

const { t } = useI18n()
const { page, document, apiError, isInitialLoading, refresh } = await useLegalCmsPage('cookies')

const title = computed(() => t('legalCookies.title'))
const intro = computed(() => t('legalCookies.intro'))

useContractSeo(() => page.value?.seo, t('legalCookies.title'))
</script>

<template>
  <div class="flex flex-1 flex-col shell:hidden">
    <div class="flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages/mentions" :gap="0" />

      <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
        <template #loading>
          <div class="flex flex-col gap-16">
            <QSkeleton variant="text" :lines="2" />
            <QSkeleton variant="text" :lines="8" />
          </div>
        </template>

        <template v-if="page">
          <AppLegalHeader :title="title" :intro="intro" :updated="document?.updated" />

          <div class="rounded-[20px] bg-rml-rights-info p-16">
            <p class="m-0 text-[12px] leading-[22.75px] font-medium text-[#1e1b4b]">
              {{ $t('legalCookies.introCard') }}
            </p>
          </div>

          <AppCookieExtras />

          <AppLegalSections v-if="document" :sections="document.sections" />

          <AppLegalContact
            :title="$t('legalCookies.questionTitle')"
            :description="$t('legalCookies.questionDesc')"
            :email="$t('legalPage.contactEmail')"
          />
        </template>
      </PageState>
    </div>
  </div>

  <div class="hidden shell:block">
    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <DesktopPagesCookies
        v-if="page"
        :title="title"
        :intro="intro"
        :document="document"
      />
    </PageState>
  </div>
</template>
