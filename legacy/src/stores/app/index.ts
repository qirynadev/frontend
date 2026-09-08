import type {
  AreaType,
  BannerType,
  CoachType,
  CourseType,
  OfferType,
  HomDataType,
  LivingType,
  MentorType,
  PageType,
  PartnerType,
  TeacherType,
  SchoolSheetType,
  ForeinLanguageType,
  CostOfLivingType,
  SchoolType,
  MenuChildType,
  PaginatedData,
  MenuType,
} from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { ElNotification } from "element-plus";
import { defineStore } from "pinia";

const http = new HttpService();

export const useAppStore = defineStore("appStore", {
  state: (): {
    isFetching: boolean;
    isDataFetched: boolean;
    isAccessRestricted: boolean;
    fetchedLocale: string | null;
    selectedMenuIndex: string | null;
    selectedMenuSlug: string | null;
    selectedArea: AreaType | null;
    selectedFormula: OfferType | null;
    selectedMentor: MentorType | null;
    selectedTeacher: TeacherType | null;
    selectedSchool: SchoolType | null;
    courseFormulaList: OfferType[];
    livingFormulaList: OfferType[];
    offerList: OfferType[];
    coachList: CoachType[];
    mentorList: MentorType[];
    teacherList: TeacherType[];
    courseList: CourseType[];
    areaList: AreaType[];
    schoolList: SchoolType[];
    livingList: LivingType[];
    partnersList: PartnerType[];
    menuData: MenuType;
    homeData: HomDataType | null;
    bannerList: BannerType[];
    pageList: PageType[];
    staticPageList: PageType[];
    schoolSheetList: SchoolSheetType[];
    foreignLanguageList: ForeinLanguageType[];
    costOfLivingList: CostOfLivingType[];
    paginatedSchools: PaginatedData;
    paginatedMentors: PaginatedData;
    settings: any;
  } => {
    return {
      isFetching: false,
      isDataFetched: false,
      isAccessRestricted: false,
      fetchedLocale: null,
      bannerList: [],
      selectedMenuIndex: null,
      selectedMenuSlug: null,
      selectedArea: null,
      selectedMentor: null,
      selectedFormula: null,
      selectedTeacher: null,
      selectedSchool: null,
      courseFormulaList: [],
      livingFormulaList: [],
      offerList: [],
      coachList: [],
      mentorList: [],
      teacherList: [],
      courseList: [],
      areaList: [],
      schoolList: [],
      livingList: [],
      partnersList: [],
      menuData: null as any,
      homeData: null,
      pageList: [],
      staticPageList: [],
      schoolSheetList: [],
      foreignLanguageList: [],
      costOfLivingList: [],
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
      settings: [],
    };
  },
  getters: {
    getSelectedMenu(): string | null {
      return this.selectedMenuIndex;
    },
    getSelectedMenuSlug(): string | null {
      return this.selectedMenuSlug;
    },
    getSelectedMenuIndex(): string | null {
      return this.selectedMenuIndex;
    },
    getSelectedFormula(): OfferType | null {
      return this.selectedFormula;
    },
    getSelectedMentor(): MentorType | null {
      return this.selectedMentor;
    },
    getSelectedArea(): AreaType | null {
      return this.selectedArea;
    },
    getSelectedTeacher(): TeacherType | null {
      return this.selectedTeacher;
    },
    getSelectedSchool(): SchoolType | null {
      return this.selectedSchool;
    },
    getFormulas(): OfferType[] {
      return this.offerList;
    },
    getCoachList(): CoachType[] {
      return this.coachList;
    },
    getMentorList(): MentorType[] {
      return this.mentorList;
    },
    getPaginatedMentors(): PaginatedData {
      return this.paginatedMentors;
    },
    getTeacherList(): TeacherType[] {
      return this.teacherList;
    },
    getCourseList(): CourseType[] {
      return this.courseList;
    },
    getAreaList(): AreaType[] {
      return this.areaList;
    },
    getSchoolList(): SchoolType[] {
      return this.schoolList;
    },
    getPaginatedSchools(): PaginatedData {
      return this.paginatedSchools;
    },
    getLivingList(): LivingType[] {
      return this.livingList;
    },
    getMenuData(): MenuType {
      return this.menuData;
    },
    getBannerList(): BannerType[] {
      return this.bannerList;
    },
    getPageList(): PageType[] {
      return this.pageList;
    },
    getStaticPageList(): PageType[] {
      return this.staticPageList;
    },
    getHomeData(): HomDataType | null {
      return this.homeData;
    },
    getPartnersList(): {
      created_at: string;
      description: string;
      id: string;
      logo: string;
      name: string;
      url: string;
    }[] {
      return this.partnersList;
    },
    getSettings(): any {
      return this.settings;
    },
  },

  actions: {
    getSchoolSheetBySlug(slug: string) {
      const index = this.schoolSheetList.findIndex((item) => item.slug === slug);
      return this.schoolSheetList[index];
    },
    getSchoolListByArea(area: AreaType) {
      const index = this.schoolList.findIndex((item) => item.id === area.id);
      return this.schoolList[index];
    },
    async getSchoolSheetByID(id: string) {
      const index = this.schoolSheetList.findIndex((item) => item.id === id);
      return this.schoolSheetList[index];
    },
    async fetchAreasOfStudies(slug: string) {
      const schoolSheet = this.getSchoolSheetBySlug(slug);
      const { data } = await http.get(`/areas-of-studies/${schoolSheet.id}`);
      this.areaList = data;
    },
    async fetchAreaById(id: string) {
      const { data } = await http.get(`/areas-of-studies/${id}`);
      return data;
    },
    async fetchSchools() {
      const { data } = await http.get(`/schools`);
      this.schoolList = data;
    },
    async fetchSchoolById(id: string) {
      const { data } = await http.get(`/schools/${id}`);
      this.setSelectedSchool(data);
    },
    async fetchMentorById(id: string) {
      const { data } = await http.get(`/mentors/${id}`);
      this.setSelectedMentor(data);
      return data;
    },
    async fetchPaginatedSchoolsByArea(url: string | null = null) {
      const { data } = await http.get(url ?? `/areas-of-studies/${this.selectedArea?.id}/schools`);
      this.paginatedSchools = data;
    },
    async fetchPaginatedMentorsByArea(url: string | null = null) {
      const { data } = await http.get(url ?? `/areas-of-studies/${this.selectedArea?.id}/mentors`);
      this.paginatedMentors = data;
    },
    async fetchCountries() {
      const { data } = await http.get(`/countries`);
      return data;
    },
    async refreshData(locale?: string) {
      if (this.isFetching) return;
      this.isFetching = true;
      try {
        const response = await http.get(`/all-data`);
        // Restriction d'IP active côté back-office → /all-data renvoie 403.
        // On lève un flag ; la redirection vers « Coming soon » est faite par les
        // guards du routeur (cf. routeMiddleware + beforeEach), pas ici, pour
        // éviter toute course avec la navigation en cours.
        if (response.status === 403) {
          this.isAccessRestricted = true;
          return;
        }
        this.isAccessRestricted = false;
        if (!response.success) return;
        const { data } = response;
        this.menuData = data.menu;
        this.homeData = data.homeData;
        this.pageList = data.pages;
        this.staticPageList = data.staticPages;
        this.bannerList = data.banners ?? [];
        this.partnersList = data.partners;
        this.coachList = data.coaches;
        this.mentorList = data.mentors;
        this.teacherList = data.teachers;
        this.courseFormulaList = data.courseFormulas;
        this.livingFormulaList = data.livingFormulas;
        this.offerList = data.offers;
        this.schoolSheetList = data.schoolSheets;
        this.foreignLanguageList = data.foreignLanguages;
        this.costOfLivingList = data.costOfLiving;
        this.settings = data.settings;
        this.isDataFetched = true;
        if (locale !== undefined) this.fetchedLocale = locale;
      } finally {
        this.isFetching = false;
      }
    },
    async addToNewsletter(email: string, t: any) {
      const { data, message } = await http.post(`/newsletter`, { email });

      if (!data.status) {
        ElNotification({
          type: "error",
          message,
        });

        return false;
      } else {
        ElNotification({
          type: "success",
          message,
        });
      }

      return true;
    },
    async confirmNewsletter(token: string, t: any) {
      const { data, message } = await http.get(`/newsletter-confirmation?token=${token}`);

      if (!data.status) {
        ElNotification({
          type: "error",
          message,
        });

        return false;
      }
      ElNotification({
        type: "success",
        message,
      });
      return true;
    },
    async sendContactForm(form: any, t: any) {
      const { data, message } = await http.post(`/send-email`, form);

      if (!data.status) {
        ElNotification({
          type: "error",
          message,
        });

        return false;
      } else {
        ElNotification({
          type: "success",
          message,
        });
      }

      return true;
    },
    async sendLanguageRequest(form: { email: string; language: string; message?: string }) {
      const { data, message } = await http.post(`/language-requests`, form);

      ElNotification({
        type: data?.status ? "success" : "error",
        message,
      });

      return !!data?.status;
    },
    setSelectedMenuIndex(menuIndex: string) {
      this.selectedMenuIndex = this.selectedMenuIndex === menuIndex ? null : menuIndex;
    },
    setSelectedMenuSlug(menuSlug: string) {
      this.selectedMenuSlug = menuSlug;
    },
    setSelectedFormula(formula: OfferType) {
      this.selectedFormula = formula;
    },
    setSelectedMentor(mentor: MentorType) {
      this.selectedMentor = mentor;
    },
    setSelectedArea(area: AreaType) {
      this.selectedArea = area;
    },
    setSelectedSchool(school: SchoolType) {
      this.selectedSchool = school;
    },
    async getJWT(formData: any) {
      const { data } = await http.post(`/zoom-jwt`, formData);
      return data.signature;
    },
  },
  persist: {
    afterRestore: (ctx) => {
      ctx.store.isFetching = false;
      // Toujours repartir de "non restreint" : refreshData ré-évaluera le 403.
      // Évite de rester bloqué sur /maintenance après la levée de la restriction.
      ctx.store.isAccessRestricted = false;
    },
  },
});
