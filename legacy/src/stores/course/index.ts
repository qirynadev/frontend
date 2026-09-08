import type { CourseType, TeacherType, PaginatedData, FormulaType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";

const http = new HttpService();

export const useCourseStore = defineStore("courseStore", {
  state: (): {
    selectedLevel: { name: string; description: string } | null;
    selectedFormula: FormulaType | null;
    selectedTeacher: TeacherType | null;
    selectedCourse: CourseType | null;
    formulaList: FormulaType[];
    teacherList: TeacherType[];
    teachers: TeacherType[];
    courseList: CourseType[];
    paginatedTeachers: PaginatedData;
  } => {
    return {
      selectedLevel: null,
      selectedFormula: null,
      selectedTeacher: null,
      selectedCourse: null,
      formulaList: [],
      teacherList: [],
      teachers: [],
      courseList: [],
      paginatedTeachers: {
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
    };
  },
  getters: {
    getSelectedLevel(): { name: string; description: string } | null {
      return this.selectedLevel;
    },
    getSelectedFormula(): FormulaType | null {
      return this.selectedFormula;
    },
    getSelectedCourse(): CourseType | null {
      return this.selectedCourse;
    },
    getSelectedTeacher(): TeacherType | null {
      return this.selectedTeacher;
    },
    getPaginatedTeachers(): PaginatedData {
      return this.paginatedTeachers;
    },
    getTeachers(): TeacherType[] {
      return this.teachers;
    },
    getTeacherList(): TeacherType[] {
      return this.teacherList;
    },
    getCourseList(): CourseType[] {
      return this.courseList;
    },
    getFormulaList(): FormulaType[] {
      return this.formulaList;
    },
  },

  actions: {
    getCourseBySlug(slug: string) {
      const index = this.courseList.findIndex((item) => item.slug === slug);
      return this.courseList[index];
    },
    async fetchCourses() {
      const { data } = await http.get(`/courses`);
      this.courseList = data;
    },
    async fetchFormulas() {
      const { data } = await http.get(`/courses/formulas?courseId=${this.selectedCourse?.id}`);
      this.formulaList = data;
    },
    async fetchCourseByID(id: string) {
      const { data } = await http.get(`/courses/${id}`);
      return data;
    },
    async fetchTeachersByCourse() {
      const { data } = await http.get(`/courses/${this.selectedCourse?.id}/teachers`);
      this.teachers = Array.isArray(data) ? data : [];
    },
    async toggleFavorite(profileId: string): Promise<boolean | null> {
      const { data, success } = await http.post(`/user/favorites/toggle`, { profile_id: profileId });
      if (!success) return null;
      const teacher = this.teachers.find((t) => t.id === profileId);
      if (teacher) teacher.is_favorite = data.favorited;
      return data.favorited as boolean;
    },
    async fetchPaginatedTeachersByCourse(url: string | null = null) {
      const { data } = await http.get(url ?? `/courses/${this.selectedCourse?.id}/teachers`);
      this.paginatedTeachers = data;
    },
    async fetchTeacherById(id: string) {
      const { data } = await http.get(`/teachers/${id}`);
      this.setSelectedTeacher(data);
    },
    setSelectedCourse(course: CourseType) {
      this.selectedCourse = course;
    },
    setSelectedFormula(formula: FormulaType) {
      this.selectedFormula = formula;
    },
    setSelectedTeacher(teacher: TeacherType) {
      this.selectedTeacher = teacher;
    },
    setSelectedLevel(level: { name: string; description: string }) {
      this.selectedLevel = level;
    },
  },
  persist: true,
});
