import type { MenuType } from "@/constants/constant.type";
import { defineStore } from "pinia";
import { applyTheme, type ThemeMode } from "@/utils/theme";

export const useSettingStore = defineStore("settingStore", {
  state: (): {
    pagination: {
      pageSize: number;
      currentPageNumb: number;
      totalData: number;
      customPageSizesConfig: number[];
    };
    tags: {
      libelle: string;
      slud?: string;
      id: string;
      image: string;
    };
    alert: {
      visible: boolean;
      message: string;
      type: string;
      place: string;
    };
    registerConfig: {
      type: string;
      data: any;
    };
    sideBarConfig: {
      show: boolean;
      activeItem: any;
    };
    menu: any | null;
    locale: string;
    theme: ThemeMode;
  } => {
    return {
      pagination: {
        pageSize: 10,
        currentPageNumb: 1,
        totalData: 0,
        customPageSizesConfig: [10, 20, 30, 40, 50, 100],
      },
      tags: {
        libelle: "",
        id: "",
        image: "",
        slud: "",
      },
      alert: {
        visible: false,
        message: "",
        type: "",
        place: "",
      },
      registerConfig: {
        type: "REGISTER",
        data: null,
      },
      sideBarConfig: {
        show: false,
        activeItem: {
          code: "",
          label: "",
          imgURI: "",
          children: [],
        },
      },
      menu: null,
      locale: import.meta.env.VITE_DEFAULT_LOCALE ?? "fr",
      theme: "light",
    };
  },
  getters: {
    getSelectedTag(): {
      libelle: string;
      slud?: string;
      id: string;
      image: string;
    } {
      return this.tags;
    },
    getLocale(): string {
      return this.locale;
    },
    getTheme(): ThemeMode {
      return this.theme;
    },
    getAlert(): {
      visible: boolean;
      message: string;
      type: string;
      place: string;
    } {
      return this.alert;
    },
    getRegisterConfig(): {
      type: string;
      data: any;
    } {
      return this.registerConfig;
    },
    getSidebarState(): {
      show: boolean;
      activeItem: any;
    } {
      return this.sideBarConfig;
    },
    getMenuSelected(): MenuType | null {
      return this.menu;
    },
  },

  actions: {
    setTag(tag: any) {
      this.tags = tag;
    },
    setLocale(locale: string) {
      this.locale = locale;
    },
    setTheme(theme: ThemeMode) {
      applyTheme(theme);
      this.theme = theme;
    },
    setAlertParam({
      visible,
      message,
      type,
      place,
    }: {
      visible: boolean;
      message?: string;
      type?: string;
      place: string;
    }) {
      this.alert.visible = visible ?? false;
      this.alert.message = message ?? "";
      this.alert.type = type ?? "";
      this.alert.place = place ?? "";
    },

    setRegisterConfig(type: string = "REGISTER", data?: any) {
      this.registerConfig.data = data;
      this.registerConfig.type = type;
    },
    setSidebarState(state: boolean) {
      this.sideBarConfig.show = state;
    },
    setSidebarItem(item?: MenuType) {
      item && (this.sideBarConfig.activeItem = item);
    },
    setMenu(menu: MenuType | null) {
      this.menu = menu;
    },
  },
  persist: true,
});
