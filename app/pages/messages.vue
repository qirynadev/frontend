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
 * **Données réelles** (2026-08-30) : les deux onglets appelaient jusqu'ici du
 * contenu figé (`config/messages-conversations.ts`, six conversations
 * fictives) et l'onglet « Notification » était vide dans la maquette, sans
 * aucune logique. Câblés sur `messageRepo`/`notificationRepo` :
 *
 * - **Messages** — `GET /user/messages` ne connaît pas la conversation,
 *   seulement deux tas `sent`/`received` ; `toMessageThreads`
 *   (`core/adapters/message.adapter.ts`) reconstitue un fil par
 *   interlocuteur. En pratique un seul apparaît : toute la messagerie route
 *   vers un unique compte admin (même constat côté Legacy,
 *   `messageCounterpart.ts`). Trois avatars coexistaient dans la maquette
 *   (photo/icône/illustration) pour distinguer des conseillers fictifs par
 *   métier ; l'API ne renvoie qu'un avatar généré par interlocuteur réel — un
 *   seul rendu suffit. La pagination était déjà documentée comme décorative
 *   (« l'API n'expose pas de messagerie ») : `GET /user/messages` ne pagine
 *   pas non plus, le `QPager` de cet onglet est retiré plutôt que rejoué à
 *   vide.
 * - **Notification** — `GET /user/notifications`, paginée côté API
 *   (`meta.current_page`/`last_page`) : `QPager` y a un sens réel. Achats,
 *   statuts de commande, rappels… seul un nouveau message écrit aujourd'hui
 *   dans ce flux côté back-office (`MessageController::sendMessage`) — voir
 *   `docs/directives-backend.md` pour les événements qui n'y écrivent pas
 *   encore (paiement, inscription, rappel : e-mail seulement).
 *
 * La recherche continue de filtrer uniquement l'onglet Messages, comme avant
 * — un flux de notifications se parcourt par pagination, pas par recherche
 * texte. Le bouton « Filtrer » reste inerte : la maquette ne définit aucun
 * critère.
 */
import type { NotificationItem } from '~/core/contracts/notification'
import type { MessageAuthor } from '~/core/contracts/message'
import { messageRepo, notificationRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { t, d, locale } = useI18n()
const localePath = useLocalePath()

type TabId = 'messages' | 'notification'
const activeTab = ref<TabId>(route.query.tab === 'notification' ? 'notification' : 'messages')
const query = ref('')
const notifPage = ref(1)

const {
  data: threads,
  apiError: threadsError,
  isInitialLoading: threadsLoading,
  refresh: refreshThreads,
} = await usePageData('messages-threads', () => messageRepo.list(locale.value), { watch: [locale] })

const {
  data: notifications,
  apiError: notifError,
  isInitialLoading: notifLoading,
  refresh: refreshNotifications,
} = await usePageData(
  'messages-notifications',
  () => notificationRepo.list(notifPage.value, locale.value),
  { watch: [notifPage, locale] },
)

const {
  data: unread,
  refresh: refreshUnreadCount,
} = await usePageData('messages-unread-count', () => notificationRepo.unreadCount(locale.value), { watch: [locale] })

const isInitialLoading = computed(() => threadsLoading.value || notifLoading.value)
const apiError = computed(() => threadsError.value ?? notifError.value)

function refresh() {
  return Promise.all([refreshThreads(), refreshNotifications(), refreshUnreadCount()])
}

/** `.msg-tag--*` (`app.css`). Rôle réel → étiquette/teinte ; repli sur « Équipe Qiryna ». */
const ROLE_TAGS: Record<string, { key: string, tone: 'purple' | 'green' | 'orange' | 'pink' | 'violet' | 'blue' }> = {
  conseiller: { key: 'messages.tagAdvisor', tone: 'purple' },
  coach: { key: 'messages.tagAdvisor', tone: 'purple' },
  mentor: { key: 'messages.tagAdvisor', tone: 'purple' },
}
const tagClass: Record<string, string> = {
  purple: 'msg-tag--purple bg-msg-tag-purple-bg text-msg-tag-purple',
  green: 'msg-tag--green bg-msg-tag-green-bg text-msg-tag-green',
  orange: 'msg-tag--orange bg-msg-tag-orange-bg text-msg-tag-orange',
  pink: 'msg-tag--pink bg-msg-tag-pink-bg text-msg-tag-pink',
  violet: 'msg-tag--violet bg-msg-tag-violet-bg text-msg-tag-violet',
  blue: 'msg-tag--blue bg-msg-tag-blue-bg text-msg-tag-blue',
}
function roleTag(role: string): { key: string, tone: 'purple' | 'green' | 'orange' | 'pink' | 'violet' | 'blue' } {
  return ROLE_TAGS[role] ?? { key: 'messages.tagTeam', tone: 'violet' }
}

const filteredThreads = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = threads.value ?? []
  if (!q) return list
  return list.filter(entry =>
    entry.counterpart.name.toLowerCase().includes(q) || entry.previewText.toLowerCase().includes(q))
})

const unreadTotal = computed(() => (threads.value ?? []).reduce((n, entry) => n + (entry.unreadCount > 0 ? 1 : 0), 0))
const notificationsBadge = computed(() => unread.value?.count ?? 0)

/**
 * Heure, « Hier », ou date — même convention que la maquette
 * (`messages.html` affichait ces trois formes en dur par conversation).
 */
function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return t('messages.yesterday')

  return d(date, 'short')
}

/**
 * `url` pointe tantôt vers une route interne (`/messages`, cas du nouveau
 * message), tantôt vers l'ancien tableau de bord — constaté en direct :
 * `https://stage.qiryna.com/dashboard/mes-evaluations` sur une notification
 * de commande. Cette seconde forme cible une **autre application** ; on ne
 * navigue que sur un chemin interne, jamais vers une origine externe.
 */
function isInternalPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}

/**
 * `usePageData` (donc `useAsyncData`) renvoie un `shallowRef` — muter
 * `item.read` ou `unread.value.count` en place ne déclenche aucun rendu.
 * Chaque mise à jour réassigne `.value` en entier.
 */
async function openNotification(item: NotificationItem) {
  if (!item.read) {
    try {
      const result = await notificationRepo.markRead(item.id, locale.value)
      if (notifications.value) {
        notifications.value = {
          ...notifications.value,
          items: notifications.value.items.map(entry => (entry.id === item.id ? { ...entry, read: true } : entry)),
        }
      }
      if (unread.value) unread.value = { count: result.count }
    }
    catch {
      // La navigation ne doit pas dépendre du succès du marquage.
    }
  }
  if (item.url && isInternalPath(item.url)) await navigateTo(localePath(item.url))
}

function avatarInitial(author: MessageAuthor): string {
  return author.name.trim().charAt(0).toUpperCase() || '?'
}

usePageSeo(() => ({
  title: t('messages.seoTitle'),
  description: t('messages.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-msg flex flex-1 flex-col">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="msg-main flex w-full max-w-full flex-col overflow-x-hidden box-border">
      <AppTopBar :back="true" back-to="/" :notifications="notificationsBadge" />

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
            <span
              v-if="notificationsBadge"
              class="msg-tab-badge absolute top-1 -right-21 h-18 min-w-17 rounded-full bg-danger px-5 text-sm leading-18 font-medium text-center text-white box-border"
            >{{ notificationsBadge }}</span>
          </span>
        </button>
      </div>

      <!-- Recherche et filtre — ne s'applique qu'aux messages : une notification se parcourt par pagination. -->
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

      <PageState :loading="isInitialLoading" :error="apiError" :on-retry="refresh">
        <template #loading>
          <div class="flex flex-col gap-16">
            <QSkeleton variant="rect" :height="88" />
            <QSkeleton variant="rect" :height="88" />
            <QSkeleton variant="rect" :height="88" />
          </div>
        </template>

        <!-- Panneaux empilés : hauteur stable au changement d’onglet -->
        <div class="grid w-full min-w-0 max-w-full">
          <!-- Conversations -->
          <div
            :class="[
              'msg-panel col-start-1 row-start-1 w-full min-w-0 max-w-full',
              activeTab === 'messages' ? 'visible' : 'invisible pointer-events-none',
            ]"
            :aria-hidden="activeTab !== 'messages'"
          >
            <template v-if="filteredThreads.length">
              <div class="msg-list flex w-full flex-col gap-16">
                <article
                  v-for="entry in filteredThreads"
                  :key="entry.id"
                  class="msg-card relative flex w-full items-start rounded-xl border border-border bg-white px-18 py-17 box-border"
                >
                  <div class="msg-avatar relative size-48 shrink-0 overflow-hidden rounded-full">
                    <img
                      v-if="entry.counterpart.avatar"
                      :src="entry.counterpart.avatar"
                      alt=""
                      width="48"
                      height="48"
                      class="block size-full rounded-full object-cover"
                    >
                    <span
                      v-else
                      class="flex size-full items-center justify-center rounded-full bg-msg-avatar-target text-xl font-semibold text-white"
                      aria-hidden="true"
                    >{{ avatarInitial(entry.counterpart) }}</span>

                    <span
                      v-if="entry.counterpart.online"
                      class="msg-online absolute right-0 bottom-0 flex size-14 items-center justify-center rounded-full border-2 border-white bg-msg-online box-border"
                      aria-hidden="true"
                    >
                      <img src="/img/icons/ic-msg-online.svg" alt="" width="6" height="6" class="block size-6">
                    </span>
                  </div>

                  <div class="msg-body min-w-0 flex-1 pr-10 pl-16">
                    <div class="msg-identity flex w-full min-w-0 items-center">
                      <h2 class="msg-name m-0 truncate text-xl leading-20 font-semibold text-text">{{ entry.counterpart.name }}</h2>
                      <span :class="['msg-tag ml-6 shrink-0 rounded-md px-6 py-2 text-xs leading-[13.5px] font-bold whitespace-nowrap', tagClass[roleTag(entry.counterpart.role).tone]]">
                        {{ $t(roleTag(entry.counterpart.role).key) }}
                      </span>
                    </div>
                    <p class="msg-preview m-0 mt-6 line-clamp-2 text-md leading-[19.5px] font-normal text-msg-preview">
                      {{ entry.previewText }}
                    </p>
                  </div>

                  <div class="msg-aside ml-auto flex shrink-0 min-w-52 flex-col items-end justify-start gap-10 pt-2">
                    <time class="msg-time shrink-0 text-sm leading-15 font-medium text-right whitespace-nowrap text-msg-time">{{ formatRelativeTime(entry.lastMessageAt) }}</time>
                    <span
                      v-if="entry.unreadCount > 0"
                      class="msg-unread msg-unread--count flex size-20 shrink-0 items-center justify-center rounded-full bg-msg-unread text-sm leading-15 font-bold text-white"
                      :aria-label="$t('messages.unreadCount', { count: entry.unreadCount })"
                    >{{ entry.unreadCount }}</span>
                  </div>
                </article>
              </div>
            </template>

            <div v-else class="msg-empty w-full max-w-full rounded-xl border border-border bg-white px-16 py-28 text-center box-border">
              <template v-if="query.trim() !== ''">
                <p class="msg-empty-title m-0 text-xl leading-[normal] font-semibold text-text">{{ $t('messages.noResultTitle') }}</p>
                <p class="msg-empty-desc m-0 mt-6 text-base leading-[normal] text-muted-2">{{ $t('messages.noResultDesc') }}</p>
              </template>
              <template v-else>
                <p class="msg-empty-title m-0 text-xl leading-[normal] font-semibold text-text">{{ $t('messages.noMessagesTitle') }}</p>
                <p class="msg-empty-desc m-0 mt-6 text-base leading-[normal] text-muted-2">{{ $t('messages.noMessagesDesc') }}</p>
              </template>
            </div>
          </div>

          <!-- Notifications -->
          <div
            :class="[
              'msg-panel col-start-1 row-start-1 w-full min-w-0 max-w-full',
              activeTab === 'notification' ? 'visible' : 'invisible pointer-events-none',
            ]"
            :aria-hidden="activeTab !== 'notification'"
          >
            <template v-if="notifications && notifications.items.length">
              <div class="msg-list flex w-full flex-col gap-16">
                <button
                  v-for="item in notifications.items"
                  :key="item.id"
                  type="button"
                  class="msg-card relative flex w-full cursor-pointer items-start rounded-xl border border-border bg-white px-18 py-17 text-left box-border"
                  @click="openNotification(item)"
                >
                  <span class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full bg-msg-avatar-target">
                    <QIcon name="ic-bell" :size="22" />
                  </span>

                  <div class="msg-body min-w-0 flex-1 pr-10 pl-16">
                    <h2 class="msg-name m-0 truncate text-xl leading-20 font-semibold text-text">{{ item.title }}</h2>
                    <p class="msg-preview m-0 mt-6 line-clamp-2 text-md leading-[19.5px] font-normal text-msg-preview">
                      {{ item.body }}
                    </p>
                  </div>

                  <div class="msg-aside ml-auto flex shrink-0 min-w-52 flex-col items-end justify-start gap-10 pt-2">
                    <time class="msg-time shrink-0 text-sm leading-15 font-medium text-right whitespace-nowrap text-msg-time">{{ formatRelativeTime(item.createdAt) }}</time>
                    <span
                      v-if="!item.read"
                      class="msg-unread size-10 shrink-0 rounded-full bg-msg-unread"
                      :aria-label="$t('messages.unread')"
                    />
                  </div>
                </button>
              </div>

              <QPager
                v-if="notifications.totalPages > 1"
                v-model:page="notifPage"
                :total="notifications.totalPages"
                :aria-label="$t('messages.pagerLabel')"
                class="mt-8 mb-4"
              />
            </template>

            <div v-else class="msg-empty w-full max-w-full rounded-xl border border-border bg-white px-16 py-28 text-center box-border">
              <p class="msg-empty-title m-0 text-xl leading-[normal] font-semibold text-text">{{ $t('messages.emptyTitle') }}</p>
              <p class="msg-empty-desc m-0 mt-6 text-base leading-[normal] text-muted-2">{{ $t('messages.emptyDesc') }}</p>
            </div>
          </div>
        </div>
      </PageState>

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
