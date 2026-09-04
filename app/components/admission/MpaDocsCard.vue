<script setup lang="ts">
import type { AdmissionDocument, AdmissionDocumentField } from '~/core/contracts/admission'
import { admissionDocumentsRepo } from '~/core/repositories'

const props = defineProps<{
  documents: AdmissionDocument[]
  orderId: string
  /** `is_complete` : une fois vrai, plus aucun envoi n'est possible (`already-submitted`). */
  locked: boolean
  /** Date de finalisation (`JJ/MM/AAAA`), `null` tant que le dossier n'est pas verrouillé. */
  finalizedAt: string | null
}>()

/** Émis après un envoi ou une finalisation réussis — le parent recharge `admissionDocumentsRepo.show`. */
const emit = defineEmits<{ changed: [] }>()

const { locale } = useI18n()

const uploading = ref<Partial<Record<AdmissionDocumentField, boolean>>>({})
const uploadError = ref<Partial<Record<AdmissionDocumentField, boolean>>>({})

async function onPick(field: AdmissionDocumentField, event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = { ...uploading.value, [field]: true }
  uploadError.value = { ...uploadError.value, [field]: false }
  try {
    await admissionDocumentsRepo.uploadDocument(props.orderId, field, file, locale.value)
    emit('changed')
  }
  catch {
    uploadError.value = { ...uploadError.value, [field]: true }
  }
  finally {
    uploading.value = { ...uploading.value, [field]: false }
    // Permet de resélectionner le même fichier (ex. après un échec) — sans ça,
    // le navigateur ne redéclenche pas `change` pour une valeur inchangée.
    input.value = ''
  }
}

/** Les pièces requises doivent toutes être envoyées avant de pouvoir finaliser. */
const missingRequired = computed(() => props.documents.some((doc) => doc.required && doc.status === 'upload'))

const finalizing = ref(false)
const finalizeError = ref(false)

async function onFinalize(): Promise<void> {
  if (finalizing.value || missingRequired.value) return

  finalizing.value = true
  finalizeError.value = false
  try {
    await admissionDocumentsRepo.finalize(props.orderId, locale.value)
    emit('changed')
  }
  catch {
    finalizeError.value = true
  }
  finally {
    finalizing.value = false
  }
}
</script>

<template>
  <section class="mpa-docs-card mt-10 w-full rounded-xl border border-[rgba(226,232,240,0.8)] bg-surface-card p-17 px-1 box-border" :aria-label="$t('admission.docsTitle')">
    <h2 class="mpa-docs-title m-0 px-15 text-sm leading-[25.5px] font-bold text-[#0b0b0b]">{{ $t('admission.docsTitle') }}</h2>

    <div class="mpa-docs-banner mx-15 mt-16 flex min-h-86 items-start gap-11 rounded-xl bg-[#f5f3ff] p-9 box-border">
      <span class="mpa-docs-banner-icon size-44 shrink-0 overflow-hidden">
        <img src="/img/icons/ic-mpa-doc-info.svg" alt="" width="44" height="44" class="block size-full">
      </span>
      <div class="mpa-docs-banner-copy">
        <h3 class="m-0 text-base leading-20 font-bold text-[#191919]">{{ $t('admission.docsBannerTitle') }}</h3>
        <p class="m-0 mt-4 text-xs leading-16 font-normal text-[#191919]">{{ $t('admission.docsBannerDesc') }}</p>
      </div>
    </div>

    <ul class="mpa-docs-list m-0 mt-16 list-none p-0 px-15">
      <li
        v-for="doc in documents"
        :key="doc.id"
        class="mpa-doc-row flex items-center justify-between gap-12 rounded-xl border border-[#f3f4fb] bg-surface-card p-15 box-border [&+:not(:first-child)]:mt-10"
      >
        <div class="mpa-doc-main min-w-0 flex-1 flex items-center gap-12">
          <span class="mpa-doc-icon size-40 shrink-0 overflow-hidden rounded-2xl">
            <img :src="doc.icon" alt="" width="40" height="40" class="block size-full">
          </span>
          <div class="mpa-doc-copy min-w-0">
            <h4 class="m-0 text-sm leading-[17.5px] font-medium text-[#0d153e]">
              {{ $t(doc.titleKey) }}
              <span v-if="doc.required" class="mpa-doc-required text-mpa-required">*</span>
            </h4>
            <p class="m-0 mt-2 text-base leading-15 font-medium text-[#94a3b8]">
              <template v-if="uploadError[doc.formField]">
                <span class="text-danger">{{ $t('admission.docUploadError') }}</span>
              </template>
              <template v-else-if="doc.fileCount && doc.fileCount > 1">
                {{ $t('admission.fileTypePdfs', { count: doc.fileCount }) }}
              </template>
              <template v-else>
                {{ $t('admission.fileTypePdf') }}
              </template>
            </p>
          </div>
        </div>

        <div class="mpa-doc-status flex shrink-0 items-center gap-5">
          <!-- Dossier finalisé : lecture seule, statut dérivé de la commande -->
          <template v-if="locked">
            <template v-if="doc.status === 'validated'">
              <a
                :href="doc.downloadUrl ?? undefined"
                target="_blank"
                rel="noopener"
                class="mpa-doc-badge mpa-doc-badge--validated inline-flex items-center gap-4 rounded-lg bg-mpa-doc-validated-bg px-10 py-4 text-sm leading-[16.5px] font-medium text-mpa-doc-validated whitespace-nowrap no-underline"
              >
                <span>{{ $t('admission.statusValidated') }}</span>
                <img src="/img/icons/ic-mpa-doc-badge-check.png" alt="" width="11" height="11" class="block shrink-0">
              </a>
            </template>
            <template v-else-if="doc.status === 'pending'">
              <a
                :href="doc.downloadUrl ?? undefined"
                target="_blank"
                rel="noopener"
                class="mpa-doc-badge mpa-doc-badge--pending inline-flex items-center gap-4 rounded-lg bg-mpa-doc-pending-bg px-10 py-4 text-sm leading-[16.5px] font-medium text-mpa-doc-pending whitespace-nowrap no-underline"
              >
                <span>{{ $t('admission.statusPending') }}</span>
                <img src="/img/icons/ic-mpa-doc-badge-clock.png" alt="" width="10" height="10" class="block shrink-0">
              </a>
            </template>
            <template v-else>
              <span class="mpa-doc-badge inline-flex items-center gap-6 rounded-lg bg-[#f1f1f4] px-10 py-4 text-sm leading-[16.5px] font-medium text-[#94a3b8] whitespace-nowrap">
                {{ $t('admission.statusUpload') }}
              </span>
            </template>
          </template>

          <!-- Dossier ouvert : chaque pièce s'envoie (ou se remplace) indépendamment -->
          <template v-else>
            <a
              v-if="doc.downloadUrl"
              :href="doc.downloadUrl"
              target="_blank"
              rel="noopener"
              class="mpa-doc-action flex size-12 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
              :aria-label="$t('admission.downloadDoc')"
            >
              <img src="/img/icons/ic-mpa-doc-download.svg" alt="" width="12" height="12" class="block size-full">
            </a>
            <label
              class="mpa-doc-badge inline-flex cursor-pointer items-center gap-6 rounded-lg px-10 py-4 text-sm leading-[16.5px] font-medium whitespace-nowrap"
              :class="doc.downloadUrl ? 'bg-mpa-doc-validated-bg text-mpa-doc-validated' : 'bg-mpa-doc-upload-bg text-mpa-doc-upload'"
            >
              <QSpinner v-if="uploading[doc.formField]" size="sm" />
              <span v-else>{{ doc.downloadUrl ? $t('admission.replaceDoc') : $t('admission.statusUpload') }}</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                class="sr-only"
                :disabled="uploading[doc.formField]"
                @change="onPick(doc.formField, $event)"
              >
            </label>
          </template>
        </div>
      </li>
    </ul>

    <div class="mpa-docs-finalize mx-15 mt-16 flex flex-col gap-8">
      <template v-if="locked">
        <p class="m-0 inline-flex items-center gap-6 text-sm leading-16 font-medium text-mpa-doc-validated">
          <img src="/img/icons/ic-mpa-doc-badge-check.png" alt="" width="11" height="11" class="block shrink-0">
          <span>{{ finalizedAt ? $t('admission.docsFinalizedNote', { date: finalizedAt }) : $t('admission.docsFinalizedNoteNoDate') }}</span>
        </p>
      </template>
      <template v-else>
        <p class="m-0 text-xs leading-14 font-normal text-[#94a3b8]">{{ $t('admission.docsSubmitHint') }}</p>
        <QAlert v-if="finalizeError" tone="danger" :message="$t('admission.docsSubmitError')" />
        <button
          type="button"
          class="mpa-docs-submit-btn flex w-full items-center justify-center gap-10 rounded-xl border-0 bg-primary-cta px-24 py-14 text-base leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="finalizing || missingRequired"
          @click="onFinalize"
        >
          <QSpinner v-if="finalizing" size="sm" class="text-white" />
          <span v-else>{{ $t('admission.docsSubmitCta') }}</span>
        </button>
      </template>
    </div>
  </section>
</template>
