import type {
  MentorType,
  TeacherType,
  SchoolSheetType,
  PaginatedData,
  SchoolType,
  OfferType,
  AreaType,
  CoachType,
} from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAppStore } from "../app";

const http = new HttpService();

export const useSchoolStore = defineStore(
  "schoolStore",
  () => {
    const defaultPaginatedData = {
      current_page: 1,
      data: [],
      first_page_url: "",
      from: 0,
      last_page: 0,
      last_page_url: "",
      links: [],
      next_page_url: "",
      path: "",
      per_page: 0,
      prev_page_url: "",
      to: 0,
      total: 0,
    };
    const selectedSheet = ref<SchoolSheetType | null>(null);
    const selectedArea = ref<AreaType | null>(null);
    const selectedMentor = ref<MentorType | null>(null);
    const selectedOffer = ref<OfferType | null>(null);
    const selectedTeacher = ref<TeacherType | null>(null);
    const selectedSchool = ref<SchoolType | null>(null);

    const areaList = ref<AreaType[]>([]);
    const schoolList = ref<SchoolType[]>([]);
    const schoolSheetList = ref<SchoolSheetType[]>([]);
    const mentorList = ref<MentorType[]>([]);
    const coachList = ref<CoachType[]>([]);
    const offerList = ref<OfferType[]>([]);

    const paginatedSchools = ref<PaginatedData>(defaultPaginatedData);
    const paginatedMentors = ref<PaginatedData>(defaultPaginatedData);
    const schoolSeed = ref<number>(0);

    async function getSchoolSheetBySlug(slug: string) {
      const appStore = useAppStore();
      if (!appStore.isDataFetched) {
        await appStore.refreshData();
      }
      selectedSheet.value = appStore.getSchoolSheetBySlug(slug) ?? null;
      if (selectedSheet.value) {
        await fetchAreasOfStudies();
      }
    }
    function getSchoolListByArea(area: AreaType) {
      const index = schoolList.value.findIndex((item) => item.id === area.id);
      return schoolList.value[index];
    }
    async function getSchoolSheetByID(id: string) {
      const index = schoolSheetList.value.findIndex((item) => item.id === id);
      return schoolSheetList.value[index];
    }
    async function fetchAreasOfStudies() {
      const { data } = await http.get(`/areas-of-studies/by-country/${selectedSheet.value?.id}`);
      areaList.value = data;
    }
    async function fetchAreaById(id: string) {
      const { data } = await http.get(`/areas-of-studies/${id}`);
      return data;
    }
    async function fetchOffer(id: string) {
      const { data } = await http.get(`/areas-of-studies/offer/${id}`);
      selectedOffer.value = data;
    }
    async function fetchSchools() {
      const { data } = await http.get(`/schools`);
      schoolList.value = data;
    }
    async function fetchOtherSchools() {
      const { data } = await http.get(
        `/schools/other-schools?schoolId=${selectedSchool.value?.id}&areaId=${selectedArea.value?.id}`,
      );
      schoolList.value = data;

      return data;
    }
    async function fetchSchoolById(id: string) {
      const { data } = await http.get(`/schools/${id}`);
      selectedSchool.value = data;
    }
    async function fetchMentorById(id: string) {
      const { data } = await http.get(`/mentors/${id}`);
      selectedMentor.value = data;
    }

    async function fetchPaginatedSchoolsByArea(url: string | null = null) {
      // Génère un seed une seule fois par chargement initial (url === null)
      // Le seed est réutilisé pour toutes les pages suivantes → pas de doublons
      if (!url) {
        schoolSeed.value = Math.floor(Math.random() * 99999) + 1;
      }
      const baseUrl = url ?? `/schools/${selectedSheet.value?.country?.id}/${selectedArea.value?.id}`;
      const separator = baseUrl.includes("?") ? "&" : "?";
      const { data } = await http.get(`${baseUrl}${separator}seed=${schoolSeed.value}`);
      paginatedSchools.value = data;
    }

    async function fetchPaginatedMentorsByArea(url: string | null = null) {
      const { data } = await http.get(
        url ?? `/schools/${selectedSheet.value?.country?.id}/${selectedArea.value?.id}/mentors`,
      );
      paginatedMentors.value = data;
    }

    return {
      selectedSheet,
      selectedArea,
      selectedMentor,
      selectedOffer,
      selectedTeacher,
      selectedSchool,
      offerList,
      coachList,
      mentorList,
      areaList,
      schoolList,
      schoolSheetList,
      paginatedSchools,
      paginatedMentors,
      defaultPaginatedData,
      getSchoolSheetBySlug,
      getSchoolListByArea,
      getSchoolSheetByID,
      fetchAreasOfStudies,
      fetchAreaById,
      fetchSchools,
      fetchSchoolById,
      fetchMentorById,
      fetchPaginatedSchoolsByArea,
      fetchPaginatedMentorsByArea,
      fetchOtherSchools,
      fetchOffer,
    };
  },
  {
    persist: true,
  },
);
