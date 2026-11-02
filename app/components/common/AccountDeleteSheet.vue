<script setup lang="ts">
/**
 * Confirmation de la suppression du compte (réglages, mobile et ordinateur). Un mot à
 * recopier plutôt qu'un simple bouton : l'action est irréversible. Après suppression,
 * rechargement complet vers l'accueil, pour repartir sans aucun état de session.
 */
import { ApiError } from '~/core/http/errors'
import { authRepo } from '~/core/repositories'

const open = defineModel<boolean>('open', { default: false })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const password = ref('')
const word = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

const confirmed = computed(() => word.value.trim().toUpperCase() === t('settingsPersonal.deleteWord'))

watch(open, (value) => {
  if (!value) return
  password.value = ''
  word.value = ''
  errorMessage.value = null
})

async function submit(): Promise<void> {
  if (!confirmed.value || submitting.value) return

  submitting.value = true
  errorMessage.value = null
  try {
    await authRepo.deleteAccount(password.value, locale.value)
    window.location.assign(localePath('/'))
  }
  catch (error) {
    errorMessage.value = error instanceof ApiError && error.fieldErrors.password?.[0]
      ? t('settingsPersonal.deleteWrongPassword')
      : t('settingsPersonal.deleteError')
    submitting.value = false
  }
}
</script>

<template>
  <QSheet v-model:open="open" side="bottom-modal" :title="$t('settingsPersonal.deleteTitle')">
    <form class="flex flex-col gap-14" novalidate @submit.prevent="submit">
      <p class="m-0 text-base leading-[19.5px] text-text">{{ $t('settingsPersonal.deleteWarning') }}</p>

      <label class="flex flex-col gap-4 text-sm leading-16 font-medium text-text">
        {{ $t('settingsPersonal.deletePasswordLabel') }}
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="h-44 rounded-xl border border-rp-card-border bg-surface-card px-12 text-base text-text box-border"
        >
        <span class="font-normal text-muted-2">{{ $t('settingsPersonal.deletePasswordHint') }}</span>
      </label>

      <label class="flex flex-col gap-4 text-sm leading-16 font-medium text-text">
        {{ $t('settingsPersonal.deleteWordLabel', { word: $t('settingsPersonal.deleteWord') }) }}
        <input
          v-model="word"
          type="text"
          autocomplete="off"
          class="h-44 rounded-xl border border-rp-card-border bg-surface-card px-12 text-base text-text box-border"
        >
      </label>

      <QAlert v-if="errorMessage" tone="danger" :message="errorMessage" />

      <div class="flex gap-10">
        <QButton variant="outline" tone="neutral" block :disabled="submitting" @click="open = false">
          {{ $t('settingsPersonal.deleteCancel') }}
        </QButton>
        <QButton type="submit" variant="solid" tone="danger" block :loading="submitting" :disabled="!confirmed">
          {{ $t('settingsPersonal.deleteConfirm') }}
        </QButton>
      </div>
    </form>
  </QSheet>
</template>
