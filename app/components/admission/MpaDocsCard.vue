<script setup lang="ts">
import type { AdmissionDocument, AdmissionDocumentField } from '~/core/contracts/admission'
import { admissionDocumentsRepo } from '~/core/repositories'

const props = defineProps<{
  documents: AdmissionDocument[]
  orderId: string
  /**
   * `is_complete` de la commande : une fois vrai, l'API refuse tout nouvel
   * envoi (`already-submitted`) — plus aucune interaction n'est proposée.
   */
  locked: boolean
}>()

const emit = defineEmits<{ sent: [] }>()

const { locale } = useI18n()

/** Fichier choisi pour chaque pièce, en attente du seul envoi possible. */
const selected = ref<Partial<Record<AdmissionDocumentField, File>>>({})

function onPick(field: AdmissionDocumentField, event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) selected.value = { ...selected.value, [field]: file }
}

function clearSelection(field: AdmissionDocumentField): void {
  const next = { ...selected.value }
  delete next[field]
  selected.value = next
}

/**
 * Les pièces requises (`AdmissionDocument.required`) doivent toutes être
 * choisies avant l'envoi : un seul envoi est possible par commande (voir
 * `admissionDocumentsRepo`), il n'y a pas de seconde chance pour compléter un
 * dossier partiel.
 */
const missingRequired = computed(() => props.documents.some((doc) => doc.required && doc.status === 'upload' && !selected.value[doc.formField]))
const hasAnySelection = computed(() => Object.keys(selected.value).length > 0)

const submitting = ref(false)
const submitError = ref(false)

async function onSubmit(): Promise<void> {
  if (submitting.value || missingRequired.value || !hasAnySelection.value) return

  submitting.value = true
  submitError.value = false
  try {
    await admissionDocumentsRepo.store(props.orderId, selected.value, locale.value)
    selected.value = {}
    emit('sent')
  }
  catch {
    submitError.value = true
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mpa-docs-card mt-10 w-full rounded-xl border border-[rgba(226,232,240,0.8)] bg-white p-17 px-1 box-border" :aria-label="$t('admission.docsTitle')">
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
        class="mpa-doc-row flex items-center justify-between gap-12 rounded-xl border border-[#f3f4fb] bg-white p-15 box-border [&+:not(:first-child)]:mt-10"
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
            <p class="m-0 mt-2 text-base leading-15 font-medium text-[#94a3b8] truncate">
              <template v-if="doc.status === 'upload' && selected[doc.formField]">
                {{ selected[doc.formField]!.name }}
              </template>
              <template v-else>
                {{ $t('admission.fileTypePdf') }}
              </template>
            </p>
          </div>
        </div>

        <div class="mpa-doc-status flex shrink-0 items-center gap-5">
          <!-- Statut validé -->
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
          </template>

          <!-- Statut en attente de vérification -->
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

          <!-- À téléverser : verrouillé (un envoi déjà eu lieu, sans cette pièce) -->
          <template v-else-if="locked">
            <span class="mpa-doc-badge inline-flex items-center gap-6 rounded-lg bg-[#f1f1f4] px-10 py-4 text-sm leading-[16.5px] font-medium text-[#94a3b8] whitespace-nowrap">
              {{ $t('admission.statusUpload') }}
            </span>
          </template>

          <!-- À téléverser : sélection possible avant l'unique envoi -->
          <template v-else>
            <button
              v-if="selected[doc.formField]"
              type="button"
              class="mpa-doc-action flex size-16 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#94a3b8]"
              :aria-label="$t('admission.clearSelection')"
              @click="clearSelection(doc.formField)"
            >
              ✕
            </button>
            <label
              class="mpa-doc-badge mpa-doc-badge--upload inline-flex cursor-pointer items-center gap-6 rounded-lg px-10 py-4 text-sm leading-[16.5px] font-medium whitespace-nowrap"
              :class="selected[doc.formField] ? 'bg-mpa-doc-validated-bg text-mpa-doc-validated' : 'bg-mpa-doc-upload-bg text-mpa-doc-upload'"
            >
              <span>{{ selected[doc.formField] ? $t('admission.fileSelected') : $t('admission.statusUpload') }}</span>
              <input type="file" accept="application/pdf,image/jpeg,image/png" class="sr-only" @change="onPick(doc.formField, $event)">
            </label>
          </template>
        </div>
      </li>
    </ul>

    <div v-if="!locked" class="mpa-docs-submit mx-15 mt-16 flex flex-col gap-8">
      <p class="m-0 text-xs leading-14 font-normal text-[#94a3b8]">{{ $t('admission.docsSubmitHint') }}</p>
      <QAlert v-if="submitError" tone="danger" :message="$t('admission.docsSubmitError')" />
      <button
        type="button"
        class="mpa-docs-submit-btn flex w-full items-center justify-center gap-10 rounded-xl border-0 bg-primary-cta px-24 py-14 text-base leading-20 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting || missingRequired || !hasAnySelection"
        @click="onSubmit"
      >
        <QSpinner v-if="submitting" size="sm" class="text-white" />
        <span v-else>{{ $t('admission.docsSubmitCta') }}</span>
      </button>
    </div>
  </section>
</template>
