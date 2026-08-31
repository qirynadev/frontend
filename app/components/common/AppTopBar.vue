<script setup lang="ts">
import { useNotificationsStore, useSessionStore } from '~/core/stores'

/**
 * Barre supérieure des écrans publics.
 *
 * Portage littéral de la maquette (`.home-topbar`, `.dest-topbar`, `.le-topbar`…,
 * douze variantes du même bloc) :
 *
 * | Élément | Maquette |
 * |---|---|
 * | bouton menu / retour | 30,5×30,5 (accueil) · 24×24 (autres écrans) |
 * | cadre du logo | 145×45 |
 * | cloche | conteneur 49×49, icône 25×25 |
 * | pastille | 20×20 min, `top: 4px`, `left: 24px`, rouge `--color-danger` |
 *
 * Le bouton retour utilise l'historique quand il existe et retombe sur un
 * chemin explicite sinon — sans quoi une arrivée directe depuis un moteur de
 * recherche laisserait l'utilisateur dans une impasse.
 *
 * La pastille de la cloche lit `useNotificationsStore()` directement plutôt
 * qu'une prop : un compte partagé par toute l'app, jamais une valeur figée
 * recopiée page par page (`:notifications="3"` sur les 26 pages avant ce
 * correctif). Se recharge à chaque montage — donc à chaque navigation,
 * puisqu'`AppTopBar` vit dans chaque page plutôt que dans un layout
 * persistant — pour rester exact quelle que soit la page affichée.
 */
const props = withDefaults(
  defineProps<{
    /** Bouton retour à gauche. */
    back?: boolean
    /** Destination de repli quand il n'y a pas d'historique. */
    backTo?: string
    /** Bouton menu à gauche (accueil uniquement). */
    menu?: boolean
    /**
     * Espace sous la barre, en px.
     *
     * 30 sur la plupart des écrans, 16 sur la liste d'écoles, 22 sur les
     * écrans de domaines/écoles (`--dom-block-gap`, `--le-block-gap`…) —
     * valeurs relevées dans `app.css` (`.dest-topbar`, `.le-topbar`…).
     */
    gap?: 0 | 16 | 22 | 30
  }>(),
  { back: false, backTo: '/', menu: false, gap: 30 },
)

const gapClass: Record<number, string> = { 0: 'pb-0', 16: 'pb-16', 22: 'pb-22', 30: 'pb-30' }

const emit = defineEmits<{ openMenu: [] }>()

const router = useRouter()
const localePath = useLocalePath()
const session = useSessionStore()
const notificationsStore = useNotificationsStore()
const { locale } = useI18n()

const notifications = computed(() => notificationsStore.unreadCount)

onMounted(() => {
  if (session.isAuthenticated) notificationsStore.refresh(locale.value)
})

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
    return
  }
  navigateTo(localePath(props.backTo))
}
</script>

<template>
  <header :class="['flex w-full items-center justify-between', gapClass[gap]]">
    <!-- Gauche : menu (accueil) ou retour (écrans internes) -->
    <button
      v-if="menu"
      type="button"
      class="flex size-30 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      :aria-label="$t('nav.menu')"
      @click="emit('openMenu')"
    >
      <QIcon name="ic-menu" :size="31" />
    </button>

    <button
      v-else-if="back"
      type="button"
      class="flex size-24 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      :aria-label="$t('ds.topbar.back')"
      @click="goBack"
    >
      <QIcon name="ic-lang-back" :size="24" />
    </button>

    <span v-else class="size-30 shrink-0" aria-hidden="true" />

    <!-- Centre : logo -->
    <NuxtLink :to="localePath('/')" class="shrink-0 no-underline" :aria-label="$t('nav.home')">
      <AppLogo :width="145" :height="45" />
    </NuxtLink>

    <!-- Droite : cloche + pastille -->
    <NuxtLink
      :to="localePath({ path: '/messages', query: { tab: 'notification' } })"
      class="relative flex size-49 shrink-0 items-center justify-center no-underline"
      :aria-label="notifications > 0 ? $t('nav.notificationsCount', notifications) : $t('nav.notifications')"
    >
      <QIcon name="ic-bell" :size="25" />
      <span
        v-if="notifications > 0"
        class="absolute top-4 left-24 inline-flex h-20 min-w-20 items-center justify-center rounded-full bg-danger px-6 text-base leading-20 font-medium text-white"
      >
        {{ notifications }}
      </span>
    </NuxtLink>
  </header>
</template>
