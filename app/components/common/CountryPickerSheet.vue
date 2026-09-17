<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import type { Country } from '~/core/contracts'
import { drapeauEmoji, rechercherPays } from '~/utils/country-search'

/**
 * Sélecteur de pays ou d'indicatif avec recherche par saisie.
 *
 * Remplace les `<select>` natifs du profil (2026-09-16) : 245 pays à dérouler
 * à l'aveugle. On tape un nom, un mot du nom, un code ISO ou un indicatif
 * (`rechercherPays`, `app/utils/country-search.ts`).
 *
 * Feuille basse plutôt que liste déroulante ancrée au champ : sur mobile, le
 * clavier et une liste de 245 lignes ne tiennent pas dans un menu accroché à
 * un champ de 46px, et les champs du formulaire rognent leur contenu
 * (`overflow-hidden`). Contrairement à `QSheet`, où tout le panneau défile,
 * l'en-tête et la recherche restent fixes : seule la liste défile.
 *
 * Plusieurs pays partagent un indicatif (+1, +7…) : la sélection se fait donc
 * par identifiant de pays, jamais par indicatif.
 */
const props = withDefaults(
  defineProps<{
    countries: readonly Country[]
    title: string
    /** Identifiant du pays coché. */
    selectedId?: string | null
    /** Affiche l'indicatif en bout de ligne (sélecteur d'indicatif). */
    showDialCode?: boolean
  }>(),
  { selectedId: null, showDialCode: false },
)

const emit = defineEmits<{ select: [country: Country] }>()

const open = defineModel<boolean>('open', { default: false })

const { locale } = useI18n()
const saisie = ref('')
const champRecherche = useTemplateRef<HTMLInputElement>('champRecherche')
const liste = useTemplateRef<HTMLElement>('liste')

const resultats = computed(() => rechercherPays(props.countries, saisie.value, locale.value))

/** Une réouverture repart de la liste complète. */
watch(open, (ouvert) => {
  if (!ouvert) saisie.value = ''
})

/**
 * À l'ouverture : focus sur la recherche plutôt que sur la croix (le but est
 * de taper), et le pays déjà choisi ramené au centre de la liste.
 */
function surOuverture(event: Event) {
  event.preventDefault()
  champRecherche.value?.focus({ preventScroll: true })
  liste.value?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' })
}

function choisir(pays: Country) {
  emit('select', pays)
  open.value = false
}

/** `Entrée` retient le premier résultat : taper « benin » puis valider suffit. */
function validerPremier() {
  const premier = resultats.value[0]
  if (premier) choisir(premier)
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-100 bg-navy/40" />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-100 mx-auto flex h-[80dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-drawer"
        @open-auto-focus="surOuverture"
      >
        <div class="flex shrink-0 items-center justify-between gap-12 px-gutter pt-20 pb-12">
          <DialogTitle class="m-0 min-w-0 truncate text-3xl font-semibold text-text">
            {{ title }}
          </DialogTitle>
          <DialogClose as-child>
            <QIconButton icon="close" :label="$t('ds.sheet.close')" size="md" />
          </DialogClose>
        </div>

        <div class="shrink-0 px-gutter pb-12">
          <label class="box-border flex h-46 w-full items-center gap-8 rounded-[12px] border border-border-slate bg-white px-12">
            <QIcon name="search" :size="18" class="shrink-0 text-muted-2" />
            <input
              ref="champRecherche"
              v-model="saisie"
              type="search"
              enterkeyhint="search"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              :placeholder="$t('countryPicker.searchPlaceholder')"
              :aria-label="$t('countryPicker.searchPlaceholder')"
              class="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg leading-20 font-medium text-text outline-0"
              @keydown.enter.prevent="validerPremier"
            >
          </label>
        </div>

        <ul
          ref="liste"
          class="m-0 min-h-0 flex-1 list-none overflow-y-auto overscroll-contain px-12 pt-0 pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
        >
          <li v-for="pays in resultats" :key="pays.id ?? pays.name">
            <button
              type="button"
              :aria-current="pays.id === selectedId ? 'true' : undefined"
              :class="[
                'flex w-full cursor-pointer items-center gap-12 rounded-xl border-0 px-12 py-10 text-left',
                pays.id === selectedId ? 'bg-surface-2' : 'bg-transparent',
              ]"
              @click="choisir(pays)"
            >
              <span class="w-28 shrink-0 text-center text-2xl leading-none" aria-hidden="true">{{ drapeauEmoji(pays.code) }}</span>
              <span class="min-w-0 flex-1 truncate text-lg leading-20 font-medium text-text">{{ pays.name }}</span>
              <span v-if="showDialCode && pays.phoneCode" class="shrink-0 text-lg leading-20 font-medium tabular-nums text-muted-2">
                +{{ pays.phoneCode }}
              </span>
              <QIcon v-if="pays.id === selectedId" name="check" :size="18" class="shrink-0 text-primary" />
            </button>
          </li>

          <li v-if="resultats.length === 0" class="px-12 py-24 text-center text-lg leading-20 text-muted-2">
            {{ $t('countryPicker.empty', { query: saisie.trim() }) }}
          </li>
        </ul>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
