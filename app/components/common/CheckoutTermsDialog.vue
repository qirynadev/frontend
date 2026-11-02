<script setup lang="ts">
/** Case d'acceptation des conditions générales avant le paiement : voir `useCheckoutTerms`. */
const { open, answer } = useCheckoutTerms()
const localePath = useLocalePath()

const accepted = ref(false)

watch(open, (value) => {
  if (value) accepted.value = false
})

/** Fermer la fenêtre (Échap, clic à côté) vaut annulation. */
const sheetOpen = computed({
  get: () => open.value,
  set: (value) => {
    if (!value && open.value) answer(false)
  },
})
</script>

<template>
  <QSheet
    v-model:open="sheetOpen"
    side="bottom-modal"
    :title="$t('checkout.terms.title')"
  >
    <p class="m-0 text-base leading-[19.5px] font-normal text-muted-2">{{ $t('checkout.terms.intro') }}</p>

    <label class="flex cursor-pointer items-start gap-10 text-base leading-20 text-text">
      <input v-model="accepted" type="checkbox" class="mt-2 size-18 shrink-0 cursor-pointer accent-primary">
      <span>
        {{ $t('checkout.terms.labelBefore') }}
        <NuxtLink :to="localePath('/pages/cgu')" target="_blank" class="font-semibold text-primary-link no-underline">
          {{ $t('checkout.terms.link') }}
        </NuxtLink>
      </span>
    </label>

    <div class="flex gap-10">
      <QButton variant="outline" tone="neutral" block @click="answer(false)">
        {{ $t('checkout.terms.cancel') }}
      </QButton>
      <QButton variant="solid" tone="primary" block :disabled="!accepted" @click="answer(true)">
        {{ $t('checkout.terms.confirm') }}
      </QButton>
    </div>
  </QSheet>
</template>
