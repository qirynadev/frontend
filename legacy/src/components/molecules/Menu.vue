<script lang="ts" setup>
import { useAppStore, usePaymentStore } from "@/stores";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { i18nRoute } from "@/utils";

const appStore = useAppStore();
const paymentStore = usePaymentStore();

const handleSelectMenu = (item: any) => {
  appStore.setSelectedMenuSlug(item?.slug);
  paymentStore.orderData = null;
  paymentStore.order = null;
  paymentStore.redirectUrl = null;
};

const menuList = computed<any>(() => appStore.getMenuData);

const hasSubMenus = (item: any) => {
  return item?.sub_menus !== undefined;
};

// slug → code ISO (alpha-2), dérivé des fiches école qui portent le pays.
const slugToIso = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const sheet of appStore.schoolSheetList ?? []) {
    const iso = sheet?.country?.iso_alpha_2;
    if (sheet?.slug && iso) map[sheet.slug] = iso.toLowerCase();
  }
  return map;
});

// Langues étrangères : pas de pays dans les données → mapping slug de langue → ISO
// pour réutiliser les mêmes drapeaux SVG locaux (FR + EN).
const langToIso: Record<string, string> = {
  anglais: "gb", english: "gb",
  francais: "fr", french: "fr",
  espagnol: "es", spanish: "es",
  allemand: "de", german: "de",
  italien: "it", italian: "it",
  portugais: "pt", portuguese: "pt",
  chinois: "cn", chinese: "cn", mandarin: "cn",
  japonais: "jp", japanese: "jp",
  arabe: "sa", arabic: "sa",
  russe: "ru", russian: "ru",
};

const normalize = (s?: string) => (s ?? "").toLowerCase().trim();

// Drapeau : pays (fiches école/hébergement via ISO) OU langue (via slug OU titre), SVG local.
const flagFor = (submenu?: any) => {
  if (!submenu) return "";
  const slug = submenu.slug;
  const iso =
    (slug ? slugToIso.value[slug] : "") ||
    langToIso[normalize(slug)] ||
    langToIso[normalize(submenu.title)];
  return iso ? `/images/flags/${iso}.svg` : "";
};

// Si le drapeau n'est pas (encore) bundlé, on masque l'icône proprement
const onFlagError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = "none";
};
</script>

<template>
  <div class="menu h-full flex gap-x-[18px] items-center">
    <div
      class="menu-item h-full"
      v-for="(menu, index) in menuList"
      :key="index"
    >
      <template v-if="hasSubMenus(menu)">
        <a
          class="px-[10px] pt-[30px] pb-[26px] menu-link has-submenu relative whitespace-nowrap cursor-pointer"
        >
          {{ menu?.menu }}
          <ul class="submenu h-max">
            <li v-for="submenu in menu?.sub_menus" class="submenu-item">
              <router-link
                :to="
                  i18nRoute({
                    name: index,
                    params: { slug: submenu?.slug ?? '' },
                  })
                "
                @click="handleSelectMenu(submenu)"
              >
                <img
                  v-if="flagFor(submenu)"
                  class="submenu-flag"
                  :src="flagFor(submenu)"
                  :alt="submenu.title"
                  loading="lazy"
                  @error="onFlagError"
                />
                {{ submenu.title }}
              </router-link>
            </li>
          </ul>
        </a>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-link {
  font-family: Jost, sans-serif !important;
  font-size: 15px;
  font-weight: 500;
  color: #3f4254;
}

.menu {
  .menu-item {
    .menu-link {
      .submenu {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        top: 100%;
        -webkit-box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.4);
        box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.4);
        padding: 3px 0;
        margin-top: 10px;
        margin-left: 0px;
        background: var(--color-surface);
        -webkit-transition: 0.5s 0s;
        -o-transition: 0.5s 0s;
        transition: 0.5s 0s;
        border-radius: 0px 0px 6px 6px;
        width: 160px;
        outline-style: none;
        border-color: transparent;

        &::before {
          content: "";
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          height: 4px;
          border-radius: 5px;
          transform: scale(0);
          transition: 0.5s transform;
          background: #ff3942;
        }

        &:hover {
          &::before {
            transform: scaleX(1);
            transform-origin: center;
          }
        }

        .submenu-item {
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 200px;

          a {
            padding: 9px 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            outline-style: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
            text-transform: none;
            letter-spacing: normal;
            transition: 0.5s 0s;
            color: var(--color-ink) !important;
            font-size: 14px;

            .submenu-flag {
              width: 20px;
              height: 20px;
              flex: 0 0 20px;
              border-radius: 50%;
              object-fit: cover;
              box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
            }

            &:hover {
              background: #f8f9fa;
              font-weight: 700;
            }
          }
        }
      }

      &::after {
        content: "";
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        border-radius: 5px;
        transform: scale(0);
        transition: 0.5s transform;
        background: #ff3942;
      }

      &:hover {
        &:not(*:has(:hover)) {
          &::after {
            transform: scaleX(1);
            transform-origin: center;
          }
        }

        .submenu {
          opacity: 1;
          visibility: visible;
          margin-top: 0;
          transition: 0.5s 0s;
        }
      }
    }
  }
}

@media only screen and (max-width: 1024px) {
  .menu {
    .menu-item {
      padding: 0 8px;
    }
  }
}
</style>
