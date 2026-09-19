<script setup lang="ts">
/**
 * Contact desktop — même flux que le mobile (formulaire + succès).
 */
defineProps<{
  submitted: boolean
  submitting: boolean
  submitError: boolean
  isAuthenticated: boolean
  subject: string
  name: string
  email: string
  message: string
  consent: boolean
  errors: { subject: string, name: string, email: string, message: string, consent: string }
  subjects: readonly { id: string, labelKey: string }[]
  summaryRows: { id: string, icon: string, labelKey: string, value: string }[]
  messageMax: number
}>()

const emit = defineEmits<{
  submit: []
  'update:subject': [value: string]
  'update:name': [value: string]
  'update:email': [value: string]
  'update:message': [value: string]
  'update:consent': [value: boolean]
}>()

const localePath = useLocalePath()
const FORM_ICON = '/img/icons/contact-form'
const SUCCESS_ICON = '/img/icons/contact-success'
</script>

<template>
  <AppDesktopReglagesShell
    :title="submitted ? $t('settingsContact.successTitle') : $t('settingsContact.title')"
    :intro="submitted ? $t('settingsContact.successSubtitle') : $t('settingsContact.subtitle')"
  >
    <template v-if="submitted">
      <aside class="flex items-start rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] p-20">
        <span class="mr-12 mt-2 flex size-28 shrink-0 items-center justify-center rounded-full bg-[#279848]">
          <img :src="`${SUCCESS_ICON}/check-banner.svg`" alt="" width="16" height="16" class="block size-16">
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[14px] leading-20 font-semibold text-[#151515]">{{ $t('settingsContact.successBannerTitle') }}</p>
          <p class="m-0 mt-4 text-[13px] leading-18 text-[#151515]">{{ $t('settingsContact.successBannerDesc') }}</p>
        </div>
      </aside>

      <section class="flex flex-col rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
        <template v-for="(row, index) in summaryRows" :key="row.id">
          <div class="flex items-center">
            <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-full bg-[#f8f8fc]">
              <img :src="row.icon" alt="" width="24" height="24" class="block size-24">
            </span>
            <div>
              <p class="m-0 text-[13px] leading-18 text-[#6b7280]">{{ $t(row.labelKey) }}</p>
              <p class="m-0 mt-2 text-[16px] leading-20 font-bold text-[#151515]">{{ row.value }}</p>
            </div>
          </div>
          <div v-if="index < summaryRows.length - 1" class="my-16 h-px bg-[#f3f4f6]" />
        </template>
      </section>

      <NuxtLink
        :to="localePath('/')"
        class="flex w-full items-center justify-center gap-10 rounded-[12px] bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold text-white no-underline"
      >
        {{ $t('settingsContact.successHomeCta') }}
      </NuxtLink>
    </template>

    <template v-else>
      <QAlert
        v-if="submitError"
        tone="danger"
        :title="$t('settingsContact.submitErrorTitle')"
        :message="$t('settingsContact.submitErrorDesc')"
      />

      <form class="flex w-full flex-col gap-16 rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]" @submit.prevent="emit('submit')">
        <div class="grid grid-cols-2 gap-16">
          <div class="flex flex-col">
            <label for="desk-contact-subject" class="text-[14px] leading-20 font-medium text-[#040c3d]">
              {{ $t('settingsContact.subjectLabel') }}
            </label>
            <div class="relative mt-6">
              <select
                id="desk-contact-subject"
                :value="subject"
                :class="[
                  'box-border w-full appearance-none rounded-[12px] border bg-white px-12 py-12 text-[14px] outline-none',
                  subject ? 'text-[#151515]' : 'text-[#9ca3af]',
                  errors.subject ? 'border-[#e71816]' : 'border-[#e5e7eb]',
                ]"
                @change="emit('update:subject', ($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled>{{ $t('settingsContact.subjectPlaceholder') }}</option>
                <option v-for="item in subjects" :key="item.id" :value="item.id">{{ $t(item.labelKey) }}</option>
              </select>
              <img :src="`${FORM_ICON}/ic-cf-chevron.svg`" alt="" width="20" height="20" class="pointer-events-none absolute top-1/2 right-12 size-20 -translate-y-1/2">
            </div>
            <p v-if="errors.subject" class="mt-6 mb-0 text-[11px] text-[#e71816]">{{ errors.subject }}</p>
          </div>

          <div class="flex flex-col">
            <label for="desk-contact-name" class="text-[14px] leading-20 font-medium text-[#040c3d]">
              {{ $t('settingsContact.nameLabel') }}
            </label>
            <input
              id="desk-contact-name"
              :value="name"
              type="text"
              autocomplete="name"
              :disabled="isAuthenticated"
              :placeholder="$t('settingsContact.namePlaceholder')"
              :class="[
                'mt-6 box-border w-full rounded-[12px] border bg-white px-12 py-12 text-[14px] outline-none disabled:bg-[#f8f8fc]',
                errors.name ? 'border-[#e71816]' : 'border-[#e5e7eb]',
              ]"
              @input="emit('update:name', ($event.target as HTMLInputElement).value)"
            >
            <p v-if="errors.name" class="mt-6 mb-0 text-[11px] text-[#e71816]">{{ errors.name }}</p>
          </div>

          <div class="col-span-2 flex flex-col">
            <label for="desk-contact-email" class="text-[14px] leading-20 font-medium text-[#040c3d]">
              {{ $t('settingsContact.emailLabel') }}
            </label>
            <input
              id="desk-contact-email"
              :value="email"
              type="email"
              autocomplete="email"
              :disabled="isAuthenticated"
              :placeholder="$t('settingsContact.emailPlaceholder')"
              :class="[
                'mt-6 box-border w-full rounded-[12px] border bg-white px-12 py-12 text-[14px] outline-none disabled:bg-[#f8f8fc]',
                errors.email ? 'border-[#e71816]' : 'border-[#e5e7eb]',
              ]"
              @input="emit('update:email', ($event.target as HTMLInputElement).value)"
            >
            <p v-if="errors.email" class="mt-6 mb-0 text-[11px] text-[#e71816]">{{ errors.email }}</p>
          </div>

          <div class="col-span-2 flex flex-col">
            <label for="desk-contact-message" class="text-[14px] leading-20 font-medium text-[#040c3d]">
              {{ $t('settingsContact.messageLabel') }}
            </label>
            <div
              :class="[
                'relative mt-6 rounded-[12px] border bg-white',
                errors.message ? 'border-[#e71816]' : 'border-[#e5e7eb]',
              ]"
            >
              <textarea
                id="desk-contact-message"
                :value="message"
                :maxlength="messageMax"
                :placeholder="$t('settingsContact.messagePlaceholder')"
                class="box-border h-160 w-full resize-none rounded-[12px] border-0 bg-transparent px-12 pt-12 pb-36 text-[14px] outline-none"
                @input="emit('update:message', ($event.target as HTMLTextAreaElement).value)"
              />
              <span class="pointer-events-none absolute right-12 bottom-12 text-[12px] text-[#6b7280]">
                {{ message.length }}/{{ messageMax }}
              </span>
            </div>
            <p v-if="errors.message" class="mt-6 mb-0 text-[11px] text-[#e71816]">{{ errors.message }}</p>
          </div>
        </div>

        <div class="flex items-start gap-12 rounded-[12px] bg-[#f8f8fc] p-16">
          <input
            id="desk-contact-consent"
            type="checkbox"
            :checked="consent"
            class="mt-2 size-16 shrink-0 cursor-pointer"
            @change="emit('update:consent', ($event.target as HTMLInputElement).checked)"
          >
          <label for="desk-contact-consent" class="cursor-pointer text-[13px] leading-18 text-[#151515]">
            {{ $t('settingsContact.consentBefore') }}
            <NuxtLink :to="localePath('/reglages/mentions')" class="font-medium text-[#ff1b40] no-underline">
              {{ $t('settingsContact.privacyLink') }}
            </NuxtLink>
            {{ $t('settingsContact.consentAfter') }}
          </label>
        </div>
        <p v-if="errors.consent" class="m-0 text-[11px] text-[#e71816]">{{ errors.consent }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="flex w-full cursor-pointer items-center justify-center rounded-[12px] border-0 bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold text-white disabled:opacity-70"
        >
          <QSpinner v-if="submitting" size="sm" />
          <span v-else>{{ $t('settingsContact.submit') }}</span>
        </button>
        <p class="m-0 flex items-center justify-center gap-8 text-[12px] text-[#6b7280]">
          <img :src="`${FORM_ICON}/ic-cf-lock.svg`" alt="" width="16" height="16" class="block size-16">
          {{ $t('settingsContact.secureNote') }}
        </p>
      </form>
    </template>
  </AppDesktopReglagesShell>
</template>
