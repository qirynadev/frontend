import type { SchoolType, PaginatedData, OfferType, MentorType, AreaType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { defineStore, storeToRefs } from "pinia";
import { useAppStore } from "../app";
import { ref } from "vue";

const http = new HttpService();

export const useMbaStore = defineStore(
  "mbaStore",
  () => {
    const selectedSchool = ref<SchoolType | null>(null);
    const selectedFormula = ref<OfferType | null>(null);
    const selectedArea = ref<AreaType | null>(null);
    const selectedMentor = ref<MentorType | null>(null);
    const schoolList = ref<SchoolType[]>([]);
    const schoolSeed = ref<number | null>(null);
    const paginatedMentors = ref<PaginatedData>({
      current_page: 1,
      data: [],
      first_page_url: "",
      from: 1,
      last_page: 1,
      last_page_url: "",
      links: [],
      next_page_url: "",
      path: "",
      per_page: 1,
      prev_page_url: "",
      to: 1,
      total: 0,
    });
    const paginatedSchools = ref<PaginatedData>({
      current_page: 1,
      data: [],
      first_page_url: "",
      from: 1,
      last_page: 1,
      last_page_url: "",
      links: [],
      next_page_url: "",
      path: "",
      per_page: 1,
      prev_page_url: "",
      to: 1,
      total: 0,
    });

    async function fetchSchoolListByRegion(url: string | null = null) {
      const appStore = useAppStore();
      const slug = appStore.getSelectedMenuSlug;
      if (!schoolSeed.value) {
        schoolSeed.value = Math.floor(Math.random() * 1000000);
      }
      const { data } = await http.get(url ?? `/mba/schools?region=${slug}&seed=${schoolSeed.value}`);
      paginatedSchools.value = data;
    }
    async function fetchAreaById(id: string) {
      const { data } = await http.get(`/areas-of-studies/${id}`);
      selectedArea.value = data;
      return data;
    }
    async function fetchMbaArea() {
      const { data } = await http.get(`/mba/area`);
      setSelectedArea(data);
    }
    async function fetchSchoolById(id: string) {
      const { data } = await http.get(`/mba/school?schoolId=${id}`);
      setSelectedSchool(data);
    }
    async function fetchMentorById(id: string) {
      const { data } = await http.get(`/mentors/${id}`);
      setSelectedMentor(data);
      return data;
    }
    async function fetchOtherSchools() {
      const appStore = useAppStore();
      const { data } = await http.get(
        `/mba/other-schools?region=${appStore.getSelectedMenuSlug}&excludeId=${selectedSchool.value?.id}`,
      );
      schoolList.value = data;
    }
    async function fetchPaginatedMentorsByArea(url: string | null = null) {
      const { getSelectedMenuSlug } = storeToRefs(useAppStore());
      const { data } = await http.get(
        url ?? `/mba/${getSelectedMenuSlug.value}/${selectedFormula.value?.area?.id}/mentors`,
      );
      paginatedMentors.value = data;
    }
    async function fetchFormula() {
      const { data } = await http.get(`/mba/formula`);
      selectedFormula.value = data;
    }
    function setSelectedSchool(school: SchoolType) {
      selectedSchool.value = school;
    }
    function setSelectedMentor(mentor: MentorType) {
      selectedMentor.value = mentor;
    }
    function setSelectedArea(area: AreaType): void {
      selectedArea.value = area;
    }

    return {
      selectedSchool,
      selectedFormula,
      selectedArea,
      selectedMentor,
      schoolList,
      schoolSeed,
      paginatedMentors,
      paginatedSchools,
      fetchSchoolListByRegion,
      fetchAreaById,
      fetchSchoolById,
      fetchOtherSchools,
      fetchPaginatedMentorsByArea,
      fetchFormula,
      setSelectedMentor,
      setSelectedArea,
      fetchMbaArea,
      fetchMentorById,
    };
  },
  { persist: true },
);

/* export const useMbaStore = defineStore("mbaStore", {


    state: (): {
        selectedSchool: SchoolType | null;
        selectedFormula: OfferType | null;
        selectedArea: AreaType | null;
        selectedMentor: MentorType | null;
        schoolList: SchoolType[];
        paginatedMentors: PaginatedData;
        paginatedSchools: PaginatedData;
    } => {
        return {
            selectedSchool: null,
            selectedFormula: null,
            selectedArea: null,
            selectedMentor: null,
            schoolList: [],
            paginatedMentors: {
                current_page: 1,
                data: [],
                first_page_url: "",
                from: 1,
                last_page: 1,
                last_page_url: "",
                links: [],
                next_page_url: "",
                path: "",
                per_page: 1,
                prev_page_url: "",
                to: 1,
                total: 0,
            },
            paginatedSchools: {
                current_page: 1,
                data: [],
                first_page_url: "",
                from: 1,
                last_page: 1,
                last_page_url: "",
                links: [],
                next_page_url: "",
                path: "",
                per_page: 1,
                prev_page_url: "",
                to: 1,
                total: 0,
            },
        }
    },
    getters: {
        getSelectedSchool(): SchoolType | null {
            return this.selectedSchool;
        },
        getSchoolList(): SchoolType[] {
            return this.schoolList;
        },
        getSelectedFormula(): OfferType | null {
            return this.selectedFormula;
        },
        getSelectedArea(): AreaType | null {
            return this.selectedArea;
        },
        getSelectedMentor(): MentorType | null {
            return this.selectedMentor;
        },
        getPaginatedSchools(): PaginatedData {
            return this.paginatedSchools;
        },
        getPaginatedMentors(): PaginatedData {
            return this.paginatedMentors;
        },
    },

    actions: {

    },
    persist: true,
}); */
