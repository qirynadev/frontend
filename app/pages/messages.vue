<script setup lang="ts">
/**
 * Messages ← `maquette/pwa/pages/messages.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | accroche | `.msg-hero` `min-height: 118px`, `padding-bottom: 60px` · copie plafonnée à 170px · illustration 190×150 ancrée en haut à droite |
 * | onglets | `.msg-tabs` `padding: 7px`, filet `#e6e5f2` · actif sur `#3b2cf2`, pastille décalée à `right: -21px` |
 * | barre d'outils | `.msg-search` et `.msg-filter` `padding: 11px 17px`, rayon 8 · filtre large de 101px |
 * | carte | `.msg-card` `padding: 17px 18px` · avatar 48×48 · corps `padding: 0 10px 0 16px` |
 * | carte | nom 14px/20px tronqué · étiquette 9px/13,5px · aperçu 11px/19,5px sur 2 lignes |
 * | vide | `.msg-empty` `padding: 28px 16px`, centré |
 * | sécurité | `.msg-secure` `min-height: 86px`, illustration 116×78 |
 *
 * Trois formes d'avatar coexistent dans la maquette : photo 48×48, icône 24×24
 * sur fond teinté, et illustration 48×48 sans fond.
 *
 * Le champ de recherche garde le `padding: 1px` que le navigateur applique aux
 * `input` : le preflight Tailwind le supprime, et la barre perd 2px.
 *
 * La recherche filtre la liste sur le nom et l'aperçu. Le bouton « Filtrer »
 * reste inerte : la maquette ne définit aucun critère.
 */
import { messageConversations } from '~/config/messages-conversations'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

type TabId = 'messages' | 'notification'
const activeTab = ref<TabId>('messages')
const query = ref('')

/**
 * Pagination décorative, comme dans la maquette (`data-pages="4"`) : la liste
 * tient sur un écran et l'API n'expose pas de messagerie. À brancher sur une
 * vraie pagination le jour où l'endpoint existera.
 */
const page = ref(1)
const totalPages = 4

/** `.msg-tag--*` (`app.css`). */
const tagClass = {
  purple: 'msg-tag--purple bg-msg-tag-purple-bg text-msg-tag-purple',
  green: 'msg-tag--green bg-msg-tag-green-bg text-msg-tag-green',
  orange: 'msg-tag--orange bg-msg-tag-orange-bg text-msg-tag-orange',
  pink: 'msg-tag--pink bg-msg-tag-pink-bg text-msg-tag-pink',
  violet: 'msg-tag--violet bg-msg-tag-violet-bg text-msg-tag-violet',
  blue: 'msg-tag--blue bg-msg-tag-blue-bg text-msg-tag-blue',
}

const conversations = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return messageConversations
  return messageConversations.filter(c =>
    t(c.nameKey).toLowerCase().includes(q) || t(c.previewKey).toLowerCase().includes(q))
})

const unreadTotal = computed(() =>
  messageConversations.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0))

usePageSeo(() => ({
  title: t('messages.seoTitle'),
  description: t('messages.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-msg flex min-h-screen flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="msg-main flex w-full max-w-full flex-col overflow-x-hidden pb-[var(--spacing-content-bottom)] box-border">
      <AppTopBar :back="true" back-to="/" :notifications="3" />

      <!-- Accroche -->
      <section class="msg-hero relative flex min-h-118 items-start gap-10 pb-60 box-border" aria-labelledby="messages-title">
        <div class="msg-hero-copy relative z-1 min-w-0 max-w-170 flex-1">
          <h1 id="messages-title" class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] text-text">
            {{ $t('messages.title') }}
          </h1>
          <p class="m-0 mt-8 text-xl leading-[normal] font-normal text-text">
            {{ $t('messages.intro') }}
          </p>
        </div>
        <div class="msg-hero-illus pointer-events-none absolute top-0 right-0 h-150 w-190 overflow-hidden" aria-hidden="true">
          <img src="/img/msg-hero.webp" alt="" width="211" height="167" class="block h-150 w-full max-w-full object-cover object-top">
        </div>
      </section>

      <!-- Onglets -->
      <div class="msg-tabs flex w-full items-center rounded-xl border border-border p-7 box-border" role="tablist" :aria-label="$t('messages.tabsLabel')">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'messages'"
          :class="[
            'msg-tab relative flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-xl border-0 px-8 py-12 text-xl leading-20 font-semibold',
            activeTab === 'messages' ? 'is-active bg-msg-tab-active text-white shadow-none' : 'bg-transparent text-text shadow-2xs',
          ]"
          @click="activeTab = 'messages'"
        >
          <span class="msg-tab-inner relative inline-flex items-center justify-center gap-5">
            <img src="/img/icons/ic-msg-tab-chat.svg" alt="" width="14" height="13" class="block size-14 shrink-0 object-contain">
            <span>{{ $t('messages.tabMessages') }}</span>
            <span
              v-if="unreadTotal"
              class="msg-tab-badge absolute top-1 -right-21 h-18 min-w-17 rounded-full bg-danger px-5 text-sm leading-18 font-medium text-center text-white box-border"
            >{{ unreadTotal }}</span>
          </span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'notification'"
          :class="[
            'msg-tab relative flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-xl border-0 px-8 py-12 text-xl leading-20 font-semibold',
            activeTab === 'notification' ? 'is-active bg-msg-tab-active text-white shadow-none' : 'bg-transparent text-text shadow-2xs',
          ]"
          @click="activeTab = 'notification'"
        >
          <span class="msg-tab-inner relative inline-flex items-center justify-center gap-5">
            <img src="/img/icons/ic-msg-tab-bell.svg" alt="" width="16" height="16" class="block size-16 shrink-0 object-contain">
            <span>{{ $t('messages.tabNotifications') }}</span>
          </span>
        </button>
      </div>

      <!-- Recherche et filtre -->
      <div class="msg-toolbar mt-15 mb-10 flex w-full gap-10">
        <label class="msg-search flex min-w-0 flex-1 items-center gap-12 rounded-lg border border-border bg-white px-17 py-11 box-border">
          <img src="/img/icons/ic-msg-search.svg" alt="" width="18" height="18" class="block size-18 shrink-0">
          <input
            v-model="query"
            type="search"
            autocomplete="off"
            :placeholder="$t('messages.searchPlaceholder')"
            class="min-w-0 flex-1 border-0 bg-transparent p-1 text-xl leading-20 font-normal text-text outline-0 placeholder:text-muted"
          >
        </label>
        <button type="button" class="msg-filter flex w-101 shrink-0 cursor-pointer items-center gap-12 rounded-lg border border-border bg-white px-17 py-11 text-xl leading-20 font-medium text-text box-border">
          <img src="/img/icons/ic-msg-filter.svg" alt="" width="15" height="14" class="block h-14 w-15 shrink-0">
          <span>{{ $t('messages.filter') }}</span>
        </button>
      </div>

      <!-- Conversations -->
      <div v-show="activeTab === 'messages'" class="msg-panel w-full min-w-0 max-w-full">
        <template v-if="conversations.length">
          <div class="msg-list flex w-full flex-col gap-16">
            <article
            v-for="conv in conversations"
            :key="conv.id"
            class="msg-card relative flex w-full items-start rounded-xl border border-border bg-white px-18 py-17 box-border"
            >
            <div
              :class="[
                'msg-avatar relative size-48 shrink-0 rounded-full',
                conv.avatar.kind === 'icon' ? `msg-avatar--icon flex items-center justify-center overflow-hidden ${conv.avatar.tint}` : '',
                conv.avatar.kind === 'illus' ? 'msg-avatar--support overflow-visible bg-transparent' : '',
              ]"
            >
              <img
                v-if="conv.avatar.kind === 'photo'"
                :src="conv.avatar.src"
                alt=""
                width="48"
                height="48"
                class="block size-full rounded-full object-cover"
              >
              <QIcon v-else :name="conv.avatar.icon" :size="conv.avatar.kind === 'icon' ? 24 : 48" />

              <span
                v-if="conv.online"
                class="msg-online absolute right-0 bottom-0 flex size-14 items-center justify-center rounded-full border-2 border-white bg-msg-online box-border"
                aria-hidden="true"
              >
                <img src="/img/icons/ic-msg-online.svg" alt="" width="6" height="6" class="block size-6">
              </span>
            </div>

            <div class="msg-body min-w-0 flex-1 pr-10 pl-16">
              <div class="msg-identity flex w-full min-w-0 items-center">
                <h2 class="msg-name m-0 truncate text-xl leading-20 font-semibold text-text">{{ $t(conv.nameKey) }}</h2>
                <span :class="['msg-tag ml-6 shrink-0 rounded-md px-6 py-2 text-xs leading-[13.5px] font-bold whitespace-nowrap', tagClass[conv.tagTone]]">
                  {{ $t(conv.tagKey) }}
                </span>
              </div>
              <p class="msg-preview m-0 mt-6 line-clamp-2 text-md leading-[19.5px] font-normal text-msg-preview">
                {{ $t(conv.previewKey) }}
              </p>
            </div>

            <div class="msg-aside ml-auto flex shrink-0 min-w-52 flex-col items-end justify-start gap-10 pt-2">
              <time class="msg-time shrink-0 text-sm leading-15 font-medium text-right whitespace-nowrap text-msg-time">{{ conv.time }}</time>
              <span
                v-if="conv.unread > 0"
                class="msg-unread msg-unread--count flex size-20 shrink-0 items-center justify-center rounded-full bg-msg-unread text-sm leading-15 font-bold text-white"
                :aria-label="$t('messages.unreadCount', { count: conv.unread })"
              >{{ conv.unread }}</span>
              <span v-else class="msg-unread size-10 shrink-0 rounded-full bg-msg-unread" :aria-label="$t('messages.unread')" />
            </div>
            </article>
          </div>
          <!-- Frère de la liste, comme dans la maquette : dans la liste, il
               héritait du `gap: 16px` et allongeait le bloc de 60px. -->
          <QPager v-model:page="page" :total="totalPages" :aria-label="$t('messages.pagerLabel')" class="mt-8 mb-4" />
        </template>

        <div v-else class="msg-empty w-full max-w-full rounded-xl border border-border bg-white px-16 py-28 text-center box-border">
          <p class="msg-empty-title m-0 text-xl leading-[normal] font-semibold text-text">{{ $t('messages.noResultTitle') }}</p>
          <p class="msg-empty-desc m-0 mt-6 text-base leading-[normal] text-muted-2">{{ $t('messages.noResultDesc') }}</p>
        </div>
      </div>

      <!-- Notifications : vide dans la maquette -->
      <div v-show="activeTab === 'notification'" class="msg-panel w-full min-w-0 max-w-full">
        <div class="msg-empty w-full max-w-full rounded-xl border border-border bg-white px-16 py-28 text-center box-border">
          <p class="msg-empty-title m-0 text-xl leading-[normal] font-semibold text-text">{{ $t('messages.emptyTitle') }}</p>
          <p class="msg-empty-desc m-0 mt-6 text-base leading-[normal] text-muted-2">{{ $t('messages.emptyDesc') }}</p>
        </div>
      </div>

      <!-- Échanges sécurisés -->
      <aside class="msg-secure mt-16 flex min-h-86 w-full max-w-full items-center justify-between gap-8 overflow-hidden rounded-xl bg-surface-2 px-9 py-8 box-border">
        <div class="msg-secure-left flex min-w-0 flex-1 items-start gap-11">
          <span class="msg-secure-icon size-44 shrink-0 overflow-hidden">
            <QIcon name="ic-msg-shield" :size="44" />
          </span>
          <div class="msg-secure-copy min-w-0 flex-1">
            <p class="msg-secure-title m-0 text-base leading-20 font-bold text-text">{{ $t('messages.secureTitle') }}</p>
            <p class="msg-secure-desc m-0 mt-4 text-sm leading-16 font-normal text-text">{{ $t('messages.secureDesc') }}</p>
          </div>
        </div>
        <img src="/img/msg-secure-lock.webp" alt="" width="116" height="78" class="msg-secure-illus block h-78 w-116 shrink-0 object-contain">
      </aside>
    </div>
  </div>
</template>
