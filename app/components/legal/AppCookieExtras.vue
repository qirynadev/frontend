<script setup lang="ts">
/**
 * Préférences + inventaire — Figma `1562:1890`, consentement réel (audience).
 */
import { legalCookieRows } from '~/config/legal-cookies'

defineProps<{
  wide?: boolean
}>()

const { audience, saved, save, rejectAll } = useCookiePreferences()
</script>

<template>
  <div class="flex w-full flex-col" :class="wide ? 'gap-23' : 'gap-22'">
    <div class="flex w-full" :class="wide ? 'flex-row items-stretch gap-23' : 'flex-col gap-22'">
      <section class="flex min-w-0 flex-1 flex-col">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc shell:px-0 shell:text-[14px]">
          {{ $t('legalCookies.prefsTitle') }}
        </h2>
        <div class="mt-12 flex flex-col rounded-[16px] border border-rg-card-border bg-white p-20 shadow-rp-card box-border">
          <div class="flex items-start">
            <div class="min-w-0 flex-1 pr-16">
              <h3 class="m-0 text-[15px] leading-[22.5px] font-semibold text-text">
                {{ $t('legalCookies.necessaryTitle') }}
              </h3>
              <p class="m-0 mt-4 text-[13px] leading-[17.875px] text-rml-muted">
                {{ $t('legalCookies.necessaryDesc') }}
              </p>
            </div>
            <div class="flex flex-col items-end">
              <AppLegalSwitch
                locked
                :label="$t('legalCookies.necessaryTitle')"
              />
              <span class="mt-4 text-[10px] leading-15 text-rml-desc">
                {{ $t('legalCookies.alwaysOn') }}
              </span>
            </div>
          </div>

          <div class="mt-16 border-t border-rml-row-border pt-16">
            <div class="flex items-center">
              <div class="min-w-0 flex-1 pr-16">
                <h3 class="m-0 text-[15px] leading-[22.5px] font-semibold text-text">
                  {{ $t('legalCookies.audienceTitle') }}
                </h3>
                <p class="m-0 mt-4 text-[13px] leading-[17.875px] text-rml-muted">
                  {{ $t('legalCookies.audienceDesc') }}
                </p>
              </div>
              <AppLegalSwitch
                v-model="audience"
                :label="$t('legalCookies.audienceTitle')"
              />
            </div>
          </div>

          <div class="mt-16 border-t border-rml-row-border pt-16">
            <div class="flex items-center">
              <div class="min-w-0 flex-1 pr-16">
                <h3 class="m-0 text-[15px] leading-[22.5px] font-semibold text-text">
                  {{ $t('legalCookies.functionalTitle') }}
                </h3>
                <p class="m-0 mt-4 text-[13px] leading-[17.875px] text-rml-muted">
                  {{ $t('legalCookies.functionalDesc') }}
                </p>
              </div>
              <div class="flex flex-col items-end">
                <AppLegalSwitch
                  disabled
                  :label="$t('legalCookies.functionalTitle')"
                />
                <span class="mt-4 text-[10px] leading-15 text-rml-desc">
                  {{ $t('legalCookies.functionalUnused') }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-16 border-t border-rml-row-border pt-16">
            <div class="flex items-center">
              <div class="min-w-0 flex-1 pr-16">
                <h3 class="m-0 text-[15px] leading-[22.5px] font-semibold text-text">
                  {{ $t('legalCookies.adsTitle') }}
                </h3>
                <p class="m-0 mt-4 text-[13px] leading-[17.875px] text-rml-muted">
                  {{ $t('legalCookies.adsDesc') }}
                </p>
              </div>
              <div class="flex flex-col items-end">
                <AppLegalSwitch
                  disabled
                  :label="$t('legalCookies.adsTitle')"
                />
                <span class="mt-4 text-[10px] leading-15 text-rml-desc">
                  {{ $t('legalCookies.adsUnused') }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-24 flex gap-12">
            <button
              type="button"
              class="flex h-47 flex-1 cursor-pointer items-center justify-center rounded-[12px] border-[1.5px] border-primary-link bg-transparent text-xl leading-20 font-semibold text-primary-link"
              @click="rejectAll"
            >
              {{ $t('legalCookies.rejectAll') }}
            </button>
            <button
              type="button"
              class="flex h-47 flex-1 cursor-pointer items-center justify-center rounded-[12px] border-0 bg-primary text-xl leading-20 font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              @click="save"
            >
              {{ $t('legalCookies.save') }}
            </button>
          </div>
          <p class="m-0 mt-16 text-center text-[11px] leading-[16.5px] text-rml-desc">
            {{ saved ? $t('legalCookies.saved') : $t('legalCookies.hint') }}
          </p>
        </div>
      </section>

      <section class="flex min-w-0 flex-1 flex-col">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc shell:px-0 shell:text-[14px]">
          {{ $t('legalCookies.tableTitle') }}
        </h2>
        <div class="mt-12 overflow-hidden rounded-[20px] border border-[rgba(243,232,255,0.5)]">
          <div class="grid grid-cols-12 gap-8 bg-[#f5f4fc] px-16 py-12">
            <span class="col-span-4 text-[13px] leading-[19.5px] font-medium text-[#363c45]">
              {{ $t('legalCookies.colName') }}
            </span>
            <span class="col-span-5 text-[13px] leading-[19.5px] font-medium text-[#363c45]">
              {{ $t('legalCookies.colPurpose') }}
            </span>
            <span class="col-span-3 text-right text-[13px] leading-[19.5px] font-medium text-[#363c45]">
              {{ $t('legalCookies.colDuration') }}
            </span>
          </div>
          <div
            v-for="(row, index) in legalCookieRows"
            :key="row.nameKey"
            class="grid grid-cols-12 gap-8 px-16 py-12"
            :class="index < legalCookieRows.length - 1 ? 'border-b border-[rgba(243,232,255,0.3)]' : ''"
          >
            <span
              class="col-span-4 text-[13px] leading-[19.5px] font-medium"
              :class="row.optional ? 'text-[#f59e0b]' : 'text-[#1e1b4b]'"
            >
              {{ $t(row.nameKey) }}
            </span>
            <span class="col-span-5 text-[13px] leading-[19.5px] text-rml-muted">
              {{ $t(row.purposeKey) }}
            </span>
            <span class="col-span-3 text-right text-[13px] leading-[19.5px] text-rml-muted">
              {{ $t(row.durationKey) }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <div class="flex w-full" :class="wide ? 'flex-row gap-23' : 'flex-col gap-22'">
      <section class="flex min-w-0 flex-1 flex-col">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc shell:px-0 shell:text-[14px]">
          {{ $t('legalCookies.durationsTitle') }}
        </h2>
        <div class="mt-12 rounded-[20px] border border-rml-row-border p-20 box-border">
          <p class="m-0 text-[13px] leading-[22px] text-[#2b2b2b]">
            {{ $t('legalCookies.durationsBody') }}
          </p>
        </div>
      </section>
      <section class="flex min-w-0 flex-1 flex-col">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc shell:px-0 shell:text-[14px]">
          {{ $t('legalCookies.browserTitle') }}
        </h2>
        <div class="mt-12 rounded-[20px] border border-rml-row-border p-20 box-border">
          <p class="m-0 text-[13px] leading-[22px] text-[#2b2b2b]">
            {{ $t('legalCookies.browserBody') }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
