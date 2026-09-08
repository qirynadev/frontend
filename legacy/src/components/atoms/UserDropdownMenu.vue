<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { ref } from "vue";
import {
  EnvelopeIcon,
  BookOpenIcon,
  PowerIcon,
  AdjustmentsVerticalIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/vue/24/outline";

const showSettings = ref(false);
import DropdownLink from "../molecules/DropdownLink.vue";

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push(i18nRoute({ name: "home" }));
};
</script>

<template>
  <div class="grid grid-cols-1 divide-y divide-border-default">
    <DropdownLink :to="i18nRoute({ name: 'user-messages' })" class="">
      <EnvelopeIcon class="size-5 stroke-2 mr-2" />
      <span>{{ $t("menu.account.messaging") }}</span>
    </DropdownLink>
    <DropdownLink :to="i18nRoute({ name: 'user-orders' })" class="">
      <ClockIcon class="size-5 stroke-2 mr-2" />
      <span>{{ $t("menu.account.orders") }}</span>
    </DropdownLink>
    <DropdownLink :to="i18nRoute({ name: 'user-courses-unplanned' })" class="">
      <BookOpenIcon class="size-5 stroke-2 mr-2" />
      <span>{{ $t("menu.account.courses") }}</span>
    </DropdownLink>
    <DropdownLink :to="i18nRoute({ name: 'user-evaluations' })" class="">
      <ClipboardDocumentListIcon class="size-5 stroke-2 mr-2" />
      <span>{{ $t("menu.account.evaluations") }}</span>
    </DropdownLink>
    <div>
      <div
        class="flex items-center justify-between w-full px-4 py-2 text-ink hover:bg-surface-alt cursor-pointer"
        @click.stop="showSettings = !showSettings"
      >
        <div class="flex items-center">
          <AdjustmentsVerticalIcon class="size-5 stroke-2 mr-2" />
          <span>{{ $t("menu.account.settings.title") }}</span>
        </div>
        <ChevronDownIcon class="size-4 transition-transform duration-200" :class="{ 'rotate-180': showSettings }" />
      </div>
      <div v-if="showSettings" class="bg-surface-alt divide-y divide-border-default">
        <DropdownLink :to="i18nRoute({ name: 'user-settings', hash: '#personal-informations' })" class="pl-10">
          <InformationCircleIcon class="size-5 stroke-2 mr-2" />
          <span>{{ $t("menu.account.settings.personal-informations") }}</span>
        </DropdownLink>
        <DropdownLink :to="i18nRoute({ name: 'user-settings', hash: '#security' })" class="pl-10">
          <LockClosedIcon class="size-5 stroke-2 mr-2" />
          <span>{{ $t("menu.account.settings.security") }}</span>
        </DropdownLink>
        <DropdownLink :to="i18nRoute({ name: 'user-settings', hash: '#languages' })" class="pl-10">
          <ChatBubbleLeftRightIcon class="size-5 stroke-2 mr-2" />
          <span>{{ $t("menu.account.settings.languages") }}</span>
        </DropdownLink>
      </div>
    </div>
    <DropdownLink :to="i18nRoute({ name: 'home' })" @click.prevent="logout" class="">
      <PowerIcon class="size-5 stroke-2 mr-2" />
      <span>{{ $t("menu.account.logout") }}</span>
    </DropdownLink>
  </div>
  <!-- <el-dropdown-menu class="w-[18vw]">
    <el-dropdown-item :icon="Message">
      <RouterLink
        :to="i18nRoute({ name: 'user-messages' })"
        class="block w-full"
        >Messagerie</RouterLink
      ></el-dropdown-item
    >
    <el-dropdown-item :icon="FolderOpened">
      <RouterLink
        :to="i18nRoute({ name: 'user-orders' })"
        class="block w-full"
        >Historique des achats</RouterLink
      >
    </el-dropdown-item>
    <el-dropdown-item :icon="Notebook">
      <RouterLink
        :to="i18nRoute({ name: 'user-courses-unplanned' })"
        class="block w-full"
        >Mes cours</RouterLink
      >
    </el-dropdown-item>
    <el-dropdown-item :icon="Operation">
      <el-collapse accordion class="w-full">
        <el-collapse-item title="Réglages" name="1">
          <RouterLink
            :to="
              i18nRoute({
                name: 'user-settings',
                query: { '#': 'personal-informations' },
              })
            "
            class="block w-full"
          >
            Informations personnelles
          </RouterLink>
          <RouterLink
            :to="
              i18nRoute({
                name: 'user-settings',
                query: { '#': 'security' },
              })
            "
            class="block w-full"
          >
            Mot de passe et sécurité
          </RouterLink>
          <RouterLink
            :to="
              i18nRoute({
                name: 'user-settings',
                query: { '#': 'languages' },
              })
            "
            class="block w-full"
          >
            Langues
          </RouterLink>
        </el-collapse-item>
      </el-collapse>
    </el-dropdown-item>
    <div class="footer-dropdown" role="button" @click="logout">
      <el-dropdown-item class="flex items-center">
        <SwitchButton class="size-5 stroke-2 mr-2" />
        Déconnexion
      </el-dropdown-item>
    </div>
  </el-dropdown-menu> -->
</template>

<style lang="scss" scoped>
.footer-dropdown {
  border-top: 1px solid var(--color-border);
  margin-top: 10px;
}
</style>
