<script setup lang="ts">
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import type { MessageType } from "@/constants/constant.type";
import { useAuthStore } from "@/stores";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { computed, onBeforeMount, ref } from "vue";
import MessageItem from "@/components/molecules/MessageItem.vue";
import { storeToRefs } from "pinia";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import { useSeo } from "@/composables/useSeo";
import { useI18n } from "vue-i18n";
import router from "@/router";
import { i18nRoute } from "@/utils";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import mobileIconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import mobileIconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import mobileHeroIllustration from "@/assets/images/messages-mobile/hero-illustration.jpg";
import mobileSecurityIllustration from "@/assets/images/messages-mobile/security-illustration.png";
import mobileIconMessagesTab from "@/assets/images/messages-mobile/icon-messages-tab.svg";
import mobileIconNotificationTab from "@/assets/images/messages-mobile/icon-notification-tab.svg";
import mobileIconSearch from "@/assets/images/messages-mobile/icon-search.svg";
import mobileIconFilter from "@/assets/images/messages-mobile/icon-filter.svg";
import mobileIconSecurity from "@/assets/images/messages-mobile/icon-security.svg";
import mobileIconDefaultAvatar from "@/assets/images/messages-mobile/icon-default-avatar.svg";
import dayjs from "dayjs";
import { counterpartOf, roleBadgeFor } from "@/utils/messageCounterpart";

const { t } = useI18n();
const authStore = useAuthStore();
useSeo({ title: () => t("message.inbox-label") });

const counterpart = (message: MessageType) => counterpartOf(message, authStore.user?.id);
const roleBadge = (message: MessageType) => roleBadgeFor(counterpart(message)?.role);

const relativeTimestamp = (message: MessageType) => {
  const [day, month, year] = (message.created_date ?? "").split("/").map(Number);
  if (!day || !month || !year) return message.created_time || message.created_date || "";
  const date = dayjs(new Date(year, month - 1, day));
  if (date.isSame(dayjs(), "day")) return message.created_time;
  if (date.isSame(dayjs().subtract(1, "day"), "day")) return t("messages-mobile-yesterday");
  return message.created_date;
};

const { receivedMessageList, sentMessageList, unreadMessageCount } = storeToRefs(authStore);

const showEmoji = ref<boolean>(false);
const isFetching = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const filterValue = ref<string>("");
const activeTab = ref<string>("received");
const selectedMessage = ref<MessageType | null>(null);
const selectedPerson = ref<any>(null);
const mobileView = ref<"list" | "conversation">("list");

const messageForm = ref<{
  text: string;
  image: any;
  attachment: any;
}>({
  text: "",
  image: null,
  attachment: null,
});

const selectedImage = computed(() => {
  return messageForm.value.image
    ? isUrl(messageForm.value.image)
      ? messageForm.value.image
      : messageForm.value.image
    : "https://placehold.co/128x128";
});

const setImage = (e: any) => {
  if (!e.target.files) return;
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (e: any) => {
    messageForm.value.image = e.target.result;
  };
};

const setAttachment = (e: any) => {
  if (!e.target.files) return;
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (e: any) => {
    messageForm.value.attachment = e.target.result;
  };
};

const isUrl = (value: any) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i",
  );
  return pattern.test(value);
};

const filteredReceived = computed<any>(() => {
  return receivedMessageList.value?.filter((message: MessageType) =>
    message.text.toLowerCase().includes(filterValue.value.toLowerCase()),
  );
});

const filteredSent = computed<any>(() => {
  return sentMessageList.value?.filter((message: MessageType) =>
    message.text.toLowerCase().includes(filterValue.value.toLowerCase()),
  );
});

const onSelectEmoji = (emoji: any) => {
  messageForm.value.text += emoji.i;
  showEmoji.value = !showEmoji.value;
};

// ── Bloc mobile (Figma node 497-10 "Mes messages") ──────────────────────
// Le store n'expose que des messages individuels (received/sent), sans notion
// de "conversation" ni de statut lu/non lu — on regroupe donc par interlocuteur
// réel (sender/receiver, cf. utils/messageCounterpart) pour obtenir une liste
// façon Figma, en gardant le message le plus récent par contact. Toute la
// messagerie routant aujourd'hui vers un seul compte admin, cette liste ne
// contiendra en pratique qu'une seule ligne — honnête vis-à-vis du modèle de
// données actuel. Statut "en ligne" et avatars par conseiller distincts
// omis (aucun champ réel correspondant, pas de vrai système multi-fils).
type MobileTab = "message" | "notification";
const mobileTab = ref<MobileTab>("message");

const mobileConversations = computed<MessageType[]>(() => {
  const byContact = new Map<string, MessageType>();
  for (const message of receivedMessageList.value ?? []) {
    if (message.type !== mobileTab.value) continue;
    const key = counterpart(message)?.id ?? message.id;
    const existing = byContact.get(key);
    const stamp = `${message.created_date ?? ""} ${message.created_time ?? ""}`;
    const existingStamp = existing ? `${existing.created_date ?? ""} ${existing.created_time ?? ""}` : "";
    if (!existing || stamp > existingStamp) byContact.set(key, message);
  }
  return Array.from(byContact.values()).filter(
    (m) =>
      (counterpart(m)?.name ?? "").toLowerCase().includes(filterValue.value.toLowerCase()) ||
      m.text.toLowerCase().includes(filterValue.value.toLowerCase()),
  );
});

const mobileMessageCount = computed(
  () => receivedMessageList.value?.filter((m: MessageType) => m.type === "message").length ?? 0,
);
const mobileNotificationCount = computed(
  () => receivedMessageList.value?.filter((m: MessageType) => m.type === "notification").length ?? 0,
);

const setSelected = (message: MessageType) => {
  selectedMessage.value = message;
  mobileView.value = "conversation";
};

const goBackToList = () => {
  mobileView.value = "list";
  selectedMessage.value = null;
};

const sendMessage = async () => {
  isLoading.value = true;
  const res = await authStore.sendMessage(messageForm.value);
  isLoading.value = false;

  if (res) {
    messageForm.value.text = "";
    messageForm.value.image = null;
    messageForm.value.attachment = null;
    activeTab.value = "sent";
  }
};

onBeforeMount(async () => {
  isFetching.value = true;
  await authStore.fetchUserMessages();
  isFetching.value = false;
  await authStore.markMessagesAsRead();
});
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — écran "Mes messages" (< lg)
       Corrigé via get_design_context (node Figma 497-10).
  ═══════════════════════════════════════════ -->
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <!-- ── Liste des conversations ── -->
    <div v-if="mobileView === 'list'" class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="mobileIconBack" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-messages' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="unreadMessageCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ unreadMessageCount }}
          </span>
        </RouterLink>
      </div>

      <!-- Hero -->
      <div class="flex w-full items-start gap-2 pb-6">
        <div class="min-w-0 flex-1">
          <p class="text-xl font-semibold tracking-[-0.02rem] text-ink">
            {{ $t("messages-mobile-title") }}
          </p>
          <p class="pt-2 text-sm leading-[1.25rem] text-ink">{{ $t("messages-mobile-subtitle") }}</p>
        </div>
        <img :src="mobileHeroIllustration" class="h-[7.5rem] w-[7.6875rem] flex-none object-contain" alt="" />
      </div>

      <!-- Tabs Messages / Notification -->
      <div class="flex w-full items-center gap-[0.4375rem] rounded-[0.625rem] border border-[#e6e5f2] p-[0.4375rem]">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-[0.3125rem] rounded-[0.625rem] py-3"
          :class="mobileTab === 'message' ? 'bg-[#3b2cf2] text-white' : 'text-ink'"
          @click="mobileTab = 'message'"
        >
          <img :src="mobileIconMessagesTab" class="size-[0.8125rem]" alt="" />
          <span class="text-sm font-semibold">{{ $t("messages-mobile-tab-messages") }}</span>
          <span
            v-if="mobileMessageCount"
            class="flex size-[1.0625rem] items-center justify-center rounded-full bg-[#ee163e] text-[0.625rem] font-medium text-white"
          >
            {{ mobileMessageCount }}
          </span>
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-[0.3125rem] rounded-[0.625rem] py-3"
          :class="mobileTab === 'notification' ? 'bg-[#3b2cf2] text-white' : 'text-ink'"
          @click="mobileTab = 'notification'"
        >
          <img :src="mobileIconNotificationTab" class="size-4" alt="" />
          <span class="text-sm font-semibold">{{ $t("messages-mobile-tab-notification") }}</span>
          <span
            v-if="mobileNotificationCount"
            class="flex size-[1.0625rem] items-center justify-center rounded-full bg-[#ee163e] text-[0.625rem] font-medium text-white"
          >
            {{ mobileNotificationCount }}
          </span>
        </button>
      </div>

      <!-- Search + filter -->
      <div class="flex w-full items-center gap-2 pb-[0.625rem] pt-[0.9375rem]">
        <div class="flex flex-1 items-center gap-3 rounded-lg border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.6875rem]">
          <img :src="mobileIconSearch" class="size-[1.125rem] flex-none" alt="" />
          <input
            v-model="filterValue"
            type="text"
            class="w-full min-w-0 border-none text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
            :placeholder="$t('messages-mobile-search-placeholder')"
          />
        </div>
        <!-- Décoratif : pas de dimension de filtre réelle à appliquer sur cette liste -->
        <button
          type="button"
          class="flex flex-none items-center gap-3 rounded-lg border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.6875rem]"
        >
          <img :src="mobileIconFilter" class="size-[0.875rem]" alt="" />
          <span class="text-sm font-medium text-ink">{{ $t("messages-mobile-filter") }}</span>
        </button>
      </div>

      <!-- Conversations -->
      <div class="flex w-full flex-col gap-4">
        <p v-if="!mobileConversations.length" class="py-8 text-center text-sm text-ink-muted">
          {{ $t("messages-mobile-empty") }}
        </p>
        <button
          v-for="message in mobileConversations"
          :key="message.id"
          type="button"
          class="flex w-full items-start gap-4 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.125rem] py-[1.0625rem] text-left"
          @click="setSelected(message)"
        >
          <div class="relative flex-none">
            <img
              :src="counterpart(message)?.avatar || mobileIconDefaultAvatar"
              class="size-12 rounded-full object-cover"
              alt=""
            />
            <span
              v-if="counterpart(message)?.is_online"
              class="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-[#22c55e]"
            ></span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-1.5">
                <p class="truncate text-sm font-semibold text-ink">{{ counterpart(message)?.name }}</p>
                <span
                  v-if="roleBadge(message)"
                  class="flex-none rounded px-1.5 py-0.5 text-[0.5625rem] font-extrabold"
                  :style="{ backgroundColor: roleBadge(message)!.bg, color: roleBadge(message)!.fg }"
                >
                  {{ roleBadge(message)!.label }}
                </span>
              </div>
              <span class="flex-none text-[0.625rem] font-medium text-ink-muted">{{ relativeTimestamp(message) }}</span>
            </div>
            <p class="line-clamp-2 pt-[0.375rem] text-[0.6875rem] leading-[1.21875rem] text-ink-muted">
              {{ message.text }}
            </p>
          </div>
        </button>
      </div>

      <!-- Security card -->
      <div class="mt-6 flex w-full items-center justify-between rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-5">
        <div class="flex min-w-0 flex-1 items-start gap-[0.6875rem]">
          <img :src="mobileIconSecurity" class="size-11 flex-none" alt="" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-ink">{{ $t("messages-mobile-security-title") }}</p>
            <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("messages-mobile-security-text") }}</p>
          </div>
        </div>
        <img :src="mobileSecurityIllustration" class="h-[4.875rem] w-[7.25rem] flex-none object-contain" alt="" />
      </div>
    </div>

    <!-- ── Conversation (fonctionnel, non issu de ce node Figma) ── -->
    <div v-else class="flex w-full flex-1 flex-col">
      <div class="flex items-center gap-3 border-b border-[#e6e5f2] px-4 py-3">
        <button type="button" class="flex size-8 flex-none items-center justify-center" aria-label="Retour" @click="goBackToList">
          <ArrowLeftIcon class="size-5 text-ink" />
        </button>
        <div class="relative flex-none">
          <img
            :src="(selectedMessage && counterpart(selectedMessage)?.avatar) || mobileIconDefaultAvatar"
            class="size-10 rounded-full object-cover"
            alt=""
          />
          <span
            v-if="selectedMessage && counterpart(selectedMessage)?.is_online"
            class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#22c55e]"
          ></span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-ink">{{ selectedMessage && counterpart(selectedMessage)?.name }}</p>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-4 py-4">
        <div v-if="selectedMessage" class="flex flex-col gap-3">
          <p class="text-center text-xs text-ink-muted">{{ selectedMessage.created_date }} {{ selectedMessage.created_time }}</p>
          <img v-if="selectedMessage.image" :src="selectedMessage.image" class="max-w-[70%] rounded-lg" alt="" />
          <a
            v-if="selectedMessage.attachment"
            :href="selectedMessage.attachment"
            download
            target="_blank"
            class="inline-flex items-center gap-1 text-sm font-medium text-[#582cfd] underline"
          >
            <DocumentTextIcon class="size-4" />
            {{ $t("message.action-label") }}
          </a>
          <p class="text-sm leading-6 text-ink">{{ selectedMessage.text }}</p>
        </div>
      </div>
      <div class="border-t border-[#e6e5f2] p-3">
        <textarea
          v-model="messageForm.text"
          :placeholder="$t('message.write-message-placeholder')"
          class="h-20 w-full resize-none rounded-md bg-[#f9f8fe] p-3 text-sm text-ink outline-none"
        ></textarea>
        <button
          type="button"
          class="mt-2 w-full rounded-[0.625rem] bg-[#4309fc] py-3 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="messageForm.text === ''"
          @click.prevent="sendMessage"
        >
          {{ $t("message.action-label") }}
        </button>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="messages" />
  </div>

  <!-- ═══════════════════════════════════════════
       DESKTOP — page existante (≥ lg)
  ═══════════════════════════════════════════ -->
  <div class="global-container hidden lg:block">
    <div class="container-inner">
      <div class="left-part">
        <div class="h-[calc(100vh-60px)] lg:h-[600px] lg:max-h-[750px] overflow-hidden lg:border lg:rounded-lg">
          <div class="flex items-start lg:divide-x gap-0 h-full relative overflow-y-auto">
            <!-- Liste des messages -->
            <div
              class="chats-part h-full"
              :class="mobileView === 'list' ? 'w-full lg:w-1/2' : 'hidden lg:block lg:w-1/2'"
            >
              <div class="border-b h-[50px] text-[18px] font-bold mb-[15px] p-3">
                {{ $t("message.inbox-label") }}
              </div>
              <div class="flex flex-col h-full">
                <div class="relative mb-[20px] mx-3">
                  <input
                    class="bg-surface-alt rounded-md p-3 ps-10 w-full border focus:border-red-500 outline-none focus:ring-2 ring-red-200"
                    type="text"
                    :placeholder="$t('message.search-label')"
                    v-model="filterValue"
                  />
                  <MagnifyingGlassIcon class="h-5 w-5 absolute left-2 top-1/2 -translate-y-1/2" />
                </div>

                <div class="flex text-sm">
                  <button
                    class="border-b-2 w-full text-center py-2 cursor-pointer"
                    :class="
                      activeTab === 'received' ? 'border-red-500 text-[#ff3942]' : 'border-transparent text-ink-muted'
                    "
                    @click="activeTab = 'received'"
                  >
                    {{ $t("message.received-label") }}
                  </button>
                  <button
                    class="border-b-2 w-full text-center py-2 cursor-pointer"
                    :class="
                      activeTab === 'sent' ? 'border-[#ff3942] text-[#ff3942]' : 'border-transparent text-ink-muted'
                    "
                    @click="activeTab = 'sent'"
                  >
                    {{ $t("message.sent-label") }}
                  </button>
                </div>

                <div class="h-[calc(100%-160px)]">
                  <!-- Reçus -->
                  <ul class="flex flex-col h-full overflow-y-auto" v-show="activeTab === 'received'">
                    <li v-if="filteredReceived?.length === 0" class="text-center text-ink-muted text-sm py-8">
                      {{ $t("message.search-label") }}
                    </li>
                    <template v-for="message in filteredReceived" :key="message.id">
                      <MessageItem :message="message" :counterpart="counterpart(message)" @selected="setSelected" />
                    </template>
                  </ul>

                  <!-- Envoyés -->
                  <ul class="flex flex-col h-full overflow-y-auto" v-show="activeTab === 'sent'">
                    <li v-if="filteredSent?.length === 0" class="text-center text-ink-muted text-sm py-8">
                      {{ $t("message.search-label") }}
                    </li>
                    <template v-for="message in filteredSent" :key="message.id">
                      <MessageItem
                        :message="message"
                        :counterpart="counterpart(message)"
                        @selected="setSelected"
                        :active="selectedMessage?.id == message.id"
                      />
                    </template>
                  </ul>
                </div>
              </div>
            </div>
            <!-- Détail du message / Conversation -->
            <div
              class="message-part h-full flex flex-col"
              :class="
                mobileView === 'conversation'
                  ? 'w-full lg:w-1/2 lg:absolute lg:right-0 lg:top-0'
                  : 'hidden lg:flex lg:w-1/2 lg:absolute lg:right-0 lg:top-0'
              "
            >
              <div class="border-b h-[50px] text-[18px] font-bold mb-[15px] px-3">
                <div class="flex items-center mt-1" v-if="selectedMessage">
                  <!-- Bouton retour mobile -->
                  <button class="lg:hidden mr-2 p-1 rounded-full hover:bg-surface-alt" @click="goBackToList">
                    <ArrowLeftIcon class="size-5" />
                  </button>
                  <div class="w-1/5 lg:w-1/5 relative block rounded-full">
                    <img :src="counterpart(selectedMessage)?.avatar" alt="" class="size-10 rounded-full" />
                    <span
                      v-if="counterpart(selectedMessage)?.is_online"
                      class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#22c55e]"
                    ></span>
                  </div>
                  <div class="flex flex-col justify-center w-full -ms-3">
                    <p class="font-semibold text-[16px] -mb-1">
                      {{ counterpart(selectedMessage)?.name }}
                    </p>
                  </div>
                </div>
                <!-- État vide mobile avec bouton retour -->
                <div v-else class="flex items-center mt-1 lg:hidden">
                  <button class="mr-2 p-1 rounded-full hover:bg-surface-alt" @click="goBackToList">
                    <ArrowLeftIcon class="size-5" />
                  </button>
                  <span class="text-ink-muted text-[16px]">{{ $t("message.inbox-label") }}</span>
                </div>
              </div>
              <div class="flex flex-col grow">
                <div class="flex-1 grow p-3">
                  <div v-if="selectedMessage">
                    <div class="flex items-center mb-3">
                      <hr class="grow border-t border-border-default" />
                      <span class="px-3 text-ink-muted text-sm whitespace-nowrap">
                        {{ selectedMessage?.created_date + " " + selectedMessage?.created_time }}
                      </span>
                      <hr class="grow border-t border-border-default" />
                    </div>
                    <div class="h-max overflow-y-auto">
                      <a
                        v-if="selectedMessage?.attachment"
                        :href="selectedMessage?.attachment"
                        download
                        target="_blank"
                        class="flex items-end justify-center w-max mx-auto rounded-full px-4 py-1"
                      >
                        <DocumentTextIcon class="size-6" />
                      </a>
                      <img v-if="selectedMessage?.image" :src="selectedMessage?.image" class="h-full w-full" />
                      <div class="">
                        {{ selectedMessage?.text }}
                      </div>
                    </div>
                  </div>
                  <!-- État vide desktop -->
                  <div v-else class="hidden lg:flex items-center justify-center h-full text-ink-muted">
                    {{ $t("message.search-label") }}
                  </div>
                </div>
                <div class="h-max border-t-2 focus-within:border-red-500">
                  <div class="p-3 relative">
                    <div class="flex items-center justify-center gap-2">
                      <div v-if="messageForm.image" class="size-14 rounded relative mb-1">
                        <button
                          class="absolute -top-2 -right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                          @click="messageForm.image = null"
                        >
                          <XMarkIcon class="size-5" />
                        </button>
                        <img :src="selectedImage" class="h-full w-full rounded-full object-cover border" />
                      </div>
                      <div v-if="messageForm.attachment" class="size-14 rounded relative mb-1">
                        <button
                          class="absolute -top-2 -right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                          @click="messageForm.attachment = null"
                        >
                          <XMarkIcon class="size-5" />
                        </button>
                        <div class="flex items-center justify-center h-full w-full rounded-full bg-surface-alt border">
                          <PaperClipIcon class="size-5" />
                        </div>
                      </div>
                    </div>
                    <textarea
                      class="w-full h-[80px] p-4 bg-surface-alt outline-none rounded-md resize-none"
                      :placeholder="$t('message.write-message-placeholder')"
                      v-model="messageForm.text"
                    ></textarea>
                    <EmojiPicker :native="true" @select="onSelectEmoji" v-if="showEmoji" />
                  </div>
                  <div class="flex items-center justify-between border-t border-border-default">
                    <div class="flex gap-2 w-full px-2 py-1">
                      <label for="image" class="size-6 cursor-pointer">
                        <input
                          type="file"
                          id="image"
                          accept=".jpg,.jpeg,.png,.webp,.tiff,.bmp"
                          class="hidden"
                          @input="setImage"
                        />
                        <PhotoIcon class="h-full w-full" />
                      </label>
                      <label for="attachment" class="size-6 cursor-pointer">
                        <input
                          type="file"
                          id="attachment"
                          accept=".pdf,.doc,.docx,.odt,.ppt,.xls,.xlsx"
                          class="hidden"
                          @input="setAttachment"
                        />
                        <PaperClipIcon class="h-full w-full" />
                      </label>
                      <button class="size-6" @click="showEmoji = !showEmoji">
                        <FaceSmileIcon class="h-full w-full" />
                      </button>
                    </div>
                    <div class="flex gap-2 p-2">
                      <button
                        class="bg-gray-200 text-gray-800 rounded-full px-3 py-1 whitespace-nowrap"
                        :class="`${messageForm.text === '' && messageForm.attachment == null && messageForm.image == null ? 'opacity-50' : ''}`"
                        :disabled="messageForm.text === ''"
                        @click.prevent="sendMessage"
                      >
                        {{ $t("message.action-label") }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-part hidden lg:block">
        <BannerRotator class="pub" />
      </div>
    </div>
  </div>
</template>
