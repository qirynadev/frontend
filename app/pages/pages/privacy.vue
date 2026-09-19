<script setup lang="ts">
/**
 * Politique de confidentialité — même chrome que cookies, cartes depuis le CMS.
 */
import DesktopPagesPrivacy from '~/desktop-pages/pages-privacy.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const { page, document, apiError, isInitialLoading, refresh } = await useLegalCmsPage('privacy')

const title = computed(() => page.value?.title || t('settingsLegal.privacyTitle'))
const intro = computed(() => t('legalPage.privacyIntro'))

useContractSeo(() => page.value?.seo, t('settingsLegal.privacyTitle'))
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
              {{ $t('legalPage.privacyLead') }}
            </p>
          </div>

          <AppLegalSections v-if="document" :sections="document.sections" />

          <NuxtLink
            :to="localePath('/reglages/exercer-mes-droits')"
            class="flex w-full items-center justify-between rounded-[16px] border border-rml-row-border bg-surface-card p-16 text-inherit no-underline box-border"
          >
            <span>
              <span class="block text-2xl leading-[22.5px] font-semibold text-rml-heading">
                {{ $t('legalPage.rightsTitle') }}
              </span>
              <span class="mt-2 block text-lg leading-[17.875px] text-rml-desc">
                {{ $t('legalPage.rightsCta') }}
              </span>
            </span>
            <img src="/img/icons/legal-hub/ic-ril-chevron.svg" alt="" width="20" height="20" class="ml-8 block size-20">
          </NuxtLink>

          <AppLegalContact
            :title="$t('settingsLegal.helpTitle')"
            :description="$t('settingsLegal.helpDesc')"
            :email="$t('legalPage.contactEmail')"
          />
        </template>
      </PageState>
    </div>
  </div>

  <div class="hidden shell:block">
    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <DesktopPagesPrivacy
        v-if="page"
        :title="title"
        :intro="intro"
        :document="document"
      />
    </PageState>
  </div>
</template>
