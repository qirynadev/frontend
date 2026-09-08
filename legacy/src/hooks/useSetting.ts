import { useSettingStore } from "@/stores";
import { computed, ref } from "vue";
import type { MenuType } from "@/constants/constant.type";
import type { ComputedRef, Ref } from "vue";

export const useSideBar = (): {
  handleChangeSideBarState: Function;
  sideBarState: ComputedRef<{
    show: boolean;
    activeItem: string;
  }>;
  handleChangeSideBarItem: Function;
  handleHideSideBar: Function;
} => {
  const settingStore = useSettingStore();
  const sideBarState = computed(() => settingStore.getSidebarState);

  const handleChangeSideBarState = () => {
    settingStore.setSidebarState(!settingStore.getSidebarState.show);
  };

  const handleChangeSideBarItem = (item: MenuType) => {
    settingStore.setSidebarItem(item ?? null);
  };

  const handleHideSideBar = () => {
    settingStore.setSidebarState(false);
  };

  return {
    handleChangeSideBarState,
    sideBarState,
    handleChangeSideBarItem,
    handleHideSideBar,
  };
};

export const useTag = (): {
  handleSelectTag: Function;
} => {
  const settingStore = useSettingStore();

  const handleSelectTag = (tag: any) => {
    settingStore.setTag(tag);
  };

  return {
    handleSelectTag,
  };
};

/**
 * Cette fonction s'occupe de la pagination de tous les tableaux sur la vue
 */

export type PaginationType = {
  pageSize: number;
  currentPageNumb: number;
  totalData: number;
  customPageSizesConfig: number[];
};
export const usePagination = (): {
  handleShortData: Function;
  handleUpdatePagination: Function;
  handleUpdateSize: Function;
  pagination: PaginationType;
} => {
  const pagination: Ref<PaginationType> = ref({
    pageSize: 10,
    currentPageNumb: 1,
    totalData: 0,
    customPageSizesConfig: [10, 20, 50, 100],
  });

  /**
   * Cette fonction se charge de trier un tableau en fonction du nombre qu'on souhaite
   * @param {Array} array Le tableau à trier
   * @returns {Array} retourne le tableau trié en fonction du nombre à afficher par page
   */
  const handleShortData = (array: any[] = []): any[] => {
    // Nombre total de page
    pagination.value.totalData = array?.length;
    let start = pagination.value?.currentPageNumb - 1;
    const end = pagination.value?.pageSize * pagination.value?.currentPageNumb;
    if (pagination.value.currentPageNumb > 1) {
      start = start * pagination.value?.pageSize;
    }
    return array?.slice(start, end);
  };

  /**
   * cette fonction met à jour la page à afficher
   * @param {number} number Le nombre à ajouter
   */
  const handleUpdatePagination = (number: number) => {
    pagination.value.currentPageNumb = number;
  };

  /**
   * Cette fonction met à jour le nombre de données à afficher dans un page
   * @param {number} perPage elle prend le d'élément à afficher
   */
  const handleUpdateSize = (perPage: number = 10) => {
    pagination.value.pageSize = perPage ?? pagination.value.pageSize;
  };

  return {
    handleShortData,
    handleUpdatePagination,
    handleUpdateSize,
    pagination: pagination.value,
  };
};
