<script setup lang="ts">
import type { AdmissionStep } from '~/core/contracts/admission'

defineProps<{
  steps: AdmissionStep[]
}>()

const purpleLineRef = ref<HTMLSpanElement | null>(null)
const greyLineRef = ref<HTMLSpanElement | null>(null)
const stepsContainerRef = ref<HTMLDivElement | null>(null)

function updateLines() {
  const steps = stepsContainerRef.value
  const purple = purpleLineRef.value
  const grey = greyLineRef.value
  // Les marqueurs sont relus dans le DOM plutôt que collectés par `:ref` : le
  // tableau de refs n'est pas encore peuplé au premier `nextTick`, et les deux
  // traits restaient alors sans style en ligne, donc invisibles.
  const markers = steps ? [...steps.querySelectorAll<HTMLElement>('.mpa-step-marker')] : []

  if (!steps || !purple || !grey || markers.length < 2) return
  if (steps.offsetParent === null) return

  const box = steps.getBoundingClientRect()
  const first = markers[0]!.getBoundingClientRect()

  // Chercher l'étape courante (current)
  const currentIdx = markers.findIndex(m => m.classList.contains('mpa-step-marker--current'))
  const splitIdx = currentIdx !== -1 ? currentIdx : Math.min(2, markers.length - 1)
  const split = markers[splitIdx]!.getBoundingClientRect()
  const last = markers[markers.length - 1]!.getBoundingClientRect()

  const top = first.top + first.height / 2 - box.top
  const splitY = split.top + split.height / 2 - box.top
  const bottom = box.bottom - (last.top + last.height / 2)

  purple.style.top = `${top}px`
  purple.style.height = `${Math.max(0, splitY - top)}px`
  grey.style.top = `${splitY}px`
  grey.style.bottom = `${bottom}px`
}

let observer: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    updateLines()
  })
  window.addEventListener('resize', updateLines)
  if (document.fonts?.ready) {
    document.fonts.ready.then(updateLines)
  }
  // Recalcule quand le conteneur prend ses dimensions : au montage comme au
  // retour sur l'onglet Aperçu, que `v-show` avait replié à zéro. La maquette
  // fait l'équivalent en appelant `updateMpaLines()` depuis `setMpaTab`.
  if (stepsContainerRef.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => updateLines())
    observer.observe(stepsContainerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLines)
  observer?.disconnect()
})
</script>

<template>
  <section class="mpa-steps-card w-full rounded-xl border border-[rgba(226,232,240,0.8)] bg-white p-17 px-1 box-border">
    <div class="mpa-steps-head flex items-center justify-between gap-12 px-19 pb-16">
      <h2 class="m-0 text-xl leading-[25.5px] font-bold text-[#0b0b0b]">{{ $t('admission.stepsTitle') }}</h2>
      <a href="#" class="mpa-steps-link inline-flex items-center gap-4 text-exact-11-5 leading-[19.5px] font-semibold text-[#4f18f6] no-underline whitespace-nowrap">
        <span>{{ $t('admission.stepsViewDetail') }}</span>
        <img src="/img/icons/ic-rg-chevron.svg" alt="" width="7" height="10" class="block h-10 w-7">
      </a>
    </div>

    <div ref="stepsContainerRef" class="mpa-steps relative flex flex-col gap-16 px-16">
      <div class="mpa-steps-lines pointer-events-none absolute top-0 bottom-0 left-28 w-1" aria-hidden="true">
        <span ref="purpleLineRef" class="mpa-steps-line mpa-steps-line--purple absolute left-0 w-1 bg-[#cfc0fa]" />
        <span ref="greyLineRef" class="mpa-steps-line mpa-steps-line--grey absolute left-0 w-1 bg-[#e2e8f0]" />
      </div>

      <article
        v-for="(step, index) in steps"
        :key="step.id"
        :class="[
          'mpa-step relative z-1 flex items-start gap-12 px-4',
          step.status === 'current' ? 'mpa-step--current -mx-5 rounded-xl bg-[#f7f5ff] px-7 py-12' : '',
          index === steps.length - 1 ? 'mpa-step--last' : '',
        ]"
      >
        <span
          :class="[
            'mpa-step-marker mt-2 flex size-24 shrink-0 items-center justify-center rounded-full box-border',
            step.status === 'done' ? 'mpa-step-marker--done bg-[#4f18f6]' : '',
            step.status === 'current' ? 'mpa-step-marker--current bg-[#4f18f6] text-sm leading-[16.5px] font-medium text-white' : '',
            step.status === 'upcoming' ? 'mpa-step-marker--upcoming border border-[#e2e8f0] bg-white text-sm leading-[16.5px] font-medium text-black' : '',
          ]"
        >
          <img v-if="step.status === 'done'" src="/img/icons/ic-mpa-step-check.svg" alt="" width="10" height="10" class="block size-10">
          <template v-else>{{ step.stepNumber }}</template>
        </span>

        <div class="mpa-step-main min-w-0 flex-1">
          <h3 :class="['m-0 text-base font-medium text-[#0d153e]', step.status === 'current' ? 'leading-[18.125px]' : 'leading-[17.5px]']">
            {{ $t(step.titleKey) }}
          </h3>
          <p :class="['m-0 mt-2 text-xs leading-15 font-normal', index === steps.length - 1 ? 'text-[#94a3b8]' : 'text-[#64748b]']">
            {{ $t(step.descKey) }}
          </p>
        </div>

        <div class="mpa-step-side flex min-w-62 shrink-0 flex-col items-end">
          <span
            :class="[
              'mpa-step-badge rounded-md text-exact-10-5 leading-[15.75px] font-medium whitespace-nowrap',
              step.status === 'done' ? 'mpa-step-badge--done bg-[#e2f4e5] px-13 py-1 text-[#079b12]' : '',
              step.status === 'current' ? 'mpa-step-badge--current bg-[#f3efff] px-14 py-1 text-[#4f18f6]' : '',
              step.status === 'upcoming' ? 'mpa-step-badge--soon bg-[#f1f5f9] px-12 py-1 text-[#64748b]' : '',
            ]"
          >
            <template v-if="step.status === 'done'">{{ $t('admission.statusDone') }}</template>
            <template v-else-if="step.status === 'current'">{{ $t('admission.statusCurrent') }}</template>
            <template v-else>{{ $t('admission.statusSoon') }}</template>
          </span>
          <span v-if="step.completedAt" class="mpa-step-date mt-2 text-xs leading-[15.75px] font-medium text-[#222]">{{ step.completedAt }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
