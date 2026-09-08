import type { MessageType, OrderType, TeacherType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { formatHttpErrors } from "@/utils/errors";
import { ElNotification } from "element-plus";
import { defineStore } from "pinia";
import { computed, ref, unref } from "vue";
import Tr from "@/i18n/translation";
import i18n from "@/i18n";

const httpService = new HttpService();

export const useAuthStore = defineStore(
  "authStore",
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

    const user = ref<any>(null);
    const firstTime = ref<boolean>(false);
    const token = ref<any>(null);
    const OTP = {
      isSuccess: ref<boolean>(false),
      tentative: ref<number>(0),
    };
    const logoutInProgress = ref<boolean>(false);
    const receivedMessageList = ref<MessageType[]>([]);
    const sentMessageList = ref<MessageType[]>([]);
    const unreadMessageCount = computed(
      () => receivedMessageList.value?.filter((message) => !message.read_at).length ?? 0,
    );
    const notifications = ref<any[]>([]);
    const unreadNotificationCount = ref<number>(0);
    const recentlyPlannedId = ref<string>("");
    const unplannedCourses = ref<any>([]);

    const plannedCourses = ref<any[]>([]);

    const calendarPlanned = ref<
      {
        title: string;
        start: string;
        end: string;
        color: string;
        startTime: string;
        endTime: string;
      }[]
    >([]);

    const selectedPlanning = ref<any>(null);
    const selectedTeacher = ref<TeacherType | null>(null);
    const selectedCourse = ref<any>(null);
    const selectedOrder = ref<OrderType | null>(null);

    const paginatedTeachers = ref<{
      current_page: number;
      data: any[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: {
        active: boolean;
        label: string;
        url: string;
      }[];
      next_page_url: string;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    }>(defaultPaginatedData);

    const meeting = ref<any>(null);
    const userCalendarEvents = ref<any[]>([]);
    const allTeachersList = ref<any[]>([]);

    // Login
    const login = async (formData: any, t: any): Promise<boolean> => {
      const { data, success, message } = await httpService.post("/auth/login", formData);

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      token.value = data.access_token;

      user.value = data.user;

      await Tr.switchLanguage(data.user?.settings?.language ?? i18n.global.locale.value);

      return true;
    };

    // Logout
    const logout = async (): Promise<boolean> => {
      logoutInProgress.value = true;
      const { data } = await httpService.get("/user/logout");
      logoutInProgress.value = false;

      setToken(null);
      user.value = null;

      return true;
    };

    // Register an account
    const createAccount = async (data: any): Promise<boolean> => {
      const { success, message } = await httpService.post("/auth/register", data);

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      return true;
    };

    // update user profile
    const updateProfile = async (formData: any): Promise<boolean> => {
      const { data, success, message } = await httpService.post("/user/update-profile", formData);

      if (success) {
        ElNotification({
          type: "success",
          message,
        });

        user.value = data.user;

        return true;
      }

      ElNotification({
        type: "error",
        message,
      });

      return false;
    };

    // update user password from profile page
    const updateUserPassword = async (formData: any): Promise<boolean> => {
      const { success, message } = await httpService.post("/user/update-password", formData);

      if (success) {
        ElNotification({
          type: "success",
          message,
        });

        return true;
      }

      ElNotification({
        type: "error",
        message,
      });

      return false;
    };

    // verification du compte
    const confirmAccount = async (formData: any): Promise<boolean> => {
      const { data, success, message } = await httpService.post("/auth/confirm", formData);

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      user.value = data.user;
      token.value = data.access_token;

      return true;
    };

    // recupération des informations user connecté
    const fetchUserInfo = async (): Promise<boolean> => {
      const { data, success, message } = await httpService.get("/user/me");

      if (!success) {
        // ElNotification({
        //   type: "error",
        //   message: formatHttpErrors(response.message) ?? "Le service sera en fonction une fois le problème résolu.",
        // });

        return false;
      }

      user.value = data;

      return true;
    };

    // récupération des messages
    const fetchUserMessages = async (): Promise<boolean> => {
      const { data, success } = await httpService.get("/user/messages");

      receivedMessageList.value = success ? (data?.received ?? []) : [];
      sentMessageList.value = success ? (data?.sent ?? []) : [];

      return success;
    };

    // marque les messages/notifications reçus comme lus (efface la pastille de la cloche)
    const markMessagesAsRead = async (): Promise<boolean> => {
      if (unreadMessageCount.value === 0) return true;

      const { success } = await httpService.post("/user/messages/read", {});

      if (success) {
        const now = new Date().toISOString();
        receivedMessageList.value = receivedMessageList.value.map((message) =>
          message.read_at ? message : { ...message, read_at: now },
        );
      }

      return success;
    };

    // récupération du feed de notifications (paginé, le plus récent en premier)
    const fetchNotifications = async (): Promise<boolean> => {
      const { data, success } = await httpService.get("/user/notifications");

      notifications.value = success ? (data?.data ?? []) : [];

      return success;
    };

    // récupération du seul compteur (utilisé par la cloche du header sur la plupart des pages)
    const fetchUnreadNotificationCount = async (): Promise<boolean> => {
      const { data, success } = await httpService.get("/user/notifications/unread-count");

      if (success) unreadNotificationCount.value = data?.count ?? 0;

      return success;
    };

    const markNotificationRead = async (id: string): Promise<boolean> => {
      const { data, success } = await httpService.post(`/user/notifications/${id}/read`, {});

      if (success) {
        notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read: true } : n));
        unreadNotificationCount.value = data?.count ?? 0;
      }

      return success;
    };

    const markAllNotificationsRead = async (): Promise<boolean> => {
      const { success } = await httpService.post("/user/notifications/read-all", {});

      if (success) {
        notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
        unreadNotificationCount.value = 0;
      }

      return success;
    };

    // send message
    const sendMessage = async (formData: any): Promise<boolean> => {
      const { data, message, success } = await httpService.post("/user/messages", formData);
      //console.log(success, message);

      fetchUserMessages();

      ElNotification({
        type: success ? "success" : "error",
        message: message,
      });

      return success;
    };

    // récupération des informations de la commande
    const fetchOrder = async (id: string): Promise<boolean> => {
      const { data } = await httpService.get("/user/orders/" + id);

      if (!data.status) {
        return false;
      }

      selectedOrder.value = data;

      return true;
    };

    const fetchUnplannedCourses = async (url: string | null = null): Promise<boolean> => {
      const { data } = await httpService.get(url ?? "/user/plannings/unplanned");
      if (data?.length > 0) {
        unplannedCourses.value = data;
        if (selectedCourse.value === null && data.length > 0) {
          selectedCourse.value = data[0];
        } else {
          const index = unplannedCourses.value.findIndex((course: any) => course.title === selectedCourse.value?.title);
          if (index !== -1) {
            selectedCourse.value = unplannedCourses.value[index];
          }
        }
      } else {
        unplannedCourses.value = [];
        selectedCourse.value = null;
      }
      return true;
    };

    const fetchPlannedCourses = async (): Promise<boolean> => {
      const endpoint = selectedCourse.value
        ? `/user/plannings/planned?course=${selectedCourse.value.title}`
        : `/user/plannings/planned`;
      const { data } = await httpService.get(endpoint);
      plannedCourses.value = Array.isArray(data) ? data : [];
      return true;
    };

    const fetchCalendarEvents = async (): Promise<any[]> => {
      const { data } = await httpService.get("/user/plannings/events");
      if (Array.isArray(data)) {
        userCalendarEvents.value = data;
      }
      return data ?? [];
    };

    const fetchCalendarEventsByTeacher = async (): Promise<boolean> => {
      const { data } = await httpService.get(
        `/user/plannings/events?teacher_id=${selectedPlanning.value?.teacher?.id}`,
      );
      calendarPlanned.value = data;
      return true;
    };

    const planCourse = async (formData: any): Promise<boolean> => {
      const { message, success } = await httpService.post("/user/plannings/create", formData);

      if (!success) {
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

      await fetchCalendarEventsByTeacher();
      await fetchUnplannedCourses();
      await fetchPlannedCourses();

      return true;
    };

    const deletePlanning = async (event: any): Promise<boolean> => {
      const { data, message, success } = await httpService.post(`/user/plannings/cancel`, {
        planning_id: event.id,
      });

      if (!success) {
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

      await fetchCalendarEventsByTeacher();

      return true;
    };

    const reschedulePlanning = async (data: { old_planning_id: string; new_planning_id: string }): Promise<boolean> => {
      const { message, success } = await httpService.post(`/user/plannings/reschedule`, data);

      if (!success) {
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

      await fetchCalendarEventsByTeacher();

      return true;
    };

    const setMeeting = (value: any): void => {
      meeting.value = value;
    };

    // Forgot password
    const forgotPassword = async (formData: any): Promise<boolean> => {
      const { success, message } = await httpService.post("/auth/forgot-password", formData);

      if (!success) {
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
    };

    const resetPassword = async (formData: any): Promise<boolean> => {
      const { data, message, success } = await httpService.post("/auth/new-password", formData);

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      // Connexion automatique : sauvegarder le token et l'utilisateur
      if (data?.access_token) {
        token.value = data.access_token;
        user.value = data.user;
      }

      ElNotification({
        type: "success",
        message,
      });

      return true;
    };

    const updateUserInfo = async (userId: string, data: any): Promise<boolean> => {
      const { success, message } = await httpService.post(`/user/update-profil/${userId}`, data);

      if (!success) {
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
    };

    const updatePassword = async (formData: any): Promise<boolean> => {
      const { success, message } = await httpService.post(`/auth/change-password`, formData);

      if (!success) {
        ElNotification({
          title: "Erreur",
          message,
        });
        return false;
      }

      ElNotification({
        type: "success",
        message,
      });

      return true;
    };

    const changeUserLanguage = async (language: string): Promise<boolean> => {
      const { success, message } = await httpService.post("/user/update-language", { language: language });

      if (!success) {
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
    };

    const setToken = (value: string | null): void => {
      token.value = value;
    };

    const setCurrentUser = (data: any): void => {
      user.value = data;
    };

    const resetUserData = (): void => {
      user.value = null;
      token.value = null;
      userCalendarEvents.value = [];
      calendarPlanned.value = [];
    };

    const setLogoutStatus = (state: boolean): void => {
      logoutInProgress.value = state;
    };

    const resendCode = async (email: string): Promise<boolean> => {
      const { success, message } = await httpService.post("/auth/resend-code", { email: email });

      if (!success) {
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
    };

    const fetchPaginatedTeachersByCourse = async (url: string | null = null): Promise<boolean> => {
      const courseId = selectedPlanning.value?.course_id;
      const teacherId = selectedPlanning.value?.teacher?.id;

      const { data } = await httpService.get(
        url ? `${url}&exclude=${teacherId}` : `/user/plannings/teachers/${courseId}?exclude=${teacherId}`,
      );
      paginatedTeachers.value = data;
      return true;
    };

    const fetchAllTeachersByCourse = async (): Promise<boolean> => {
      const courseId = selectedPlanning.value?.course_id;
      const teacherId = selectedPlanning.value?.teacher?.id;

      const { data } = await httpService.get(`/user/plannings/teachers/${courseId}?exclude=${teacherId}&per_page=1000`);
      allTeachersList.value = data?.data ?? [];
      return true;
    };

    const setNewTeacher = async (orderData: any, t: any): Promise<boolean> => {
      const { data, message, success } = await httpService.post("/user/plannings/new-teacher", orderData);

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      await (fetchCalendarEventsByTeacher(), fetchUnplannedCourses(), fetchPlannedCourses());

      selectedTeacher.value = null;

      return true;
    };

    const bookSlot = async (payload: {
      planning_id: string;
      order_id: string;
      title: string;
      start_at: string;
      end_at: string;
    }): Promise<{ success: boolean; message: string }> => {
      const { success, message } = await httpService.post("/user/plannings/create", payload);
      return { success, message };
    };

    /**
     * Connexion OAuth - Pour utilisateurs ayant déjà un compte lié
     * Utilise l'endpoint /auth/social/login
     */
    const loginWithSocial = async (formData: { provider: string; token: string }): Promise<boolean> => {
      const { data, success, message } = await httpService.post(`/auth/social/login`, formData);

      if (!success) {
        // Ne pas afficher de notification ici - laissons le composant gérer les erreurs avec des messages i18n
        return false;
      }

      token.value = data.access_token;
      user.value = data.user;

      await Tr.switchLanguage(data.user?.settings?.language ?? i18n.global.locale.value);

      ElNotification({
        type: "success",
        message: i18n.global.t("oauth.login-success"),
      });

      return true;
    };

    /**
     * Type de réponse pour l'inscription OAuth
     */
    interface SocialRegisterResponse {
      success: boolean;
      requiresConfirmation?: boolean;
      confirmationData?: {
        email: string;
        provider: string;
        existingProviders: string[];
      };
    }

    /**
     * Inscription/Liaison OAuth - Pour nouveaux utilisateurs ou liaison de provider
     * Utilise l'endpoint /auth/social/register avec comportement intelligent :
     * - Si email n'existe pas → Crée un nouveau compte
     * - Si email existe et confirm_link=false → Demande confirmation
     * - Si email existe et confirm_link=true → Lie le provider au compte existant
     * - Si provider déjà lié → Retourne une erreur
     */
    const registerWithSocial = async (
      formData: { provider: string; token: string },
      confirmLink: boolean = false,
    ): Promise<SocialRegisterResponse> => {
      const { data, success, message } = await httpService.post(`/auth/social/register`, {
        ...formData,
        confirm_link: confirmLink,
      });

      // Vérifier si une confirmation est requise
      if (!success && data?.requires_confirmation) {
        return {
          success: false,
          requiresConfirmation: true,
          confirmationData: {
            email: data.data?.email ?? "",
            provider: data.data?.provider ?? formData.provider,
            existingProviders: data.data?.existing_providers ?? [],
          },
        };
      }

      if (!success) {
        // Ne pas afficher de notification ici - laissons le composant gérer les erreurs avec des messages i18n
        return { success: false };
      }

      token.value = data.access_token;
      user.value = data.user;

      await Tr.switchLanguage(data.user?.settings?.language ?? i18n.global.locale.value);

      ElNotification({
        type: "success",
        message: i18n.global.t(data.account_linked ? "oauth.account-linked-success" : "oauth.register-success"),
      });

      return { success: true };
    };

    /**
     * Confirme la liaison d'un provider OAuth à un compte existant
     * Appelée après que l'utilisateur a accepté de lier son compte
     */
    const confirmSocialLink = async (formData: { provider: string; token: string }): Promise<boolean> => {
      const result = await registerWithSocial(formData, true);
      return result.success;
    };

    /**
     * Type de réponse pour l'authentification OAuth unifiée
     */
    interface SocialAuthResponse {
      success: boolean;
      requiresConfirmation?: boolean;
      confirmationData?: {
        email: string;
        provider: string;
        existingProviders: string[];
      };
    }

    /**
     * Authentification OAuth unifiée - Essaie login puis register si échec
     * Recommandé pour une expérience utilisateur fluide
     * Retourne un objet avec les informations de confirmation si nécessaire
     */
    const authenticateWithSocial = async (
      formData: { provider: string; token: string },
      isRegister: boolean = false,
    ): Promise<SocialAuthResponse> => {
      // Si c'est explicitement une inscription, utiliser directement register
      if (isRegister) {
        return await registerWithSocial(formData);
      }

      // Sinon, essayer login d'abord
      const { data, success, message } = await httpService.post(`/auth/social/login`, formData);

      // Si login échoue avec "User not found", essayer register
      if (!success && message.includes("not found")) {
        return await registerWithSocial(formData);
      }

      if (!success) {
        // Ne pas afficher de notification ici - laissons le composant gérer les erreurs avec des messages i18n
        return { success: false };
      }

      token.value = data.access_token;
      user.value = data.user;

      await Tr.switchLanguage(data.user?.settings?.language ?? i18n.global.locale.value);

      ElNotification({
        type: "success",
        message: i18n.global.t("oauth.login-success"),
      });

      return { success: true };
    };

    /**
     * LinkedIn OAuth - Endpoint spécial backend qui gère le code OAuth
     * Note: Le backend doit avoir un endpoint /auth/social/linkedin qui échange le code contre un token
     */
    const registerWithLinkedin = async (code: string, redirectUri?: string): Promise<boolean> => {
      const { data, success, message } = await httpService.post(`/auth/social/linkedin`, {
        code,
        redirect_uri: redirectUri,
      });

      if (!success) {
        // Ne pas afficher de notification ici - laissons le composant gérer les erreurs avec des messages i18n
        return false;
      }

      token.value = data.access_token;
      user.value = data.user;

      await Tr.switchLanguage(data.user?.settings?.language ?? i18n.global.locale.value);

      ElNotification({
        type: "success",
        message: i18n.global.t("oauth.auth-success"),
      });

      return true;
    };

    return {
      user,
      firstTime,
      token,
      OTP,
      logoutInProgress,
      receivedMessageList,
      sentMessageList,
      unreadMessageCount,
      notifications,
      unreadNotificationCount,
      unplannedCourses,
      plannedCourses,
      calendarPlanned,
      selectedPlanning,
      selectedOrder,
      recentlyPlannedId,
      selectedTeacher,
      paginatedTeachers,
      selectedCourse,
      defaultPaginatedData,
      meeting,
      userCalendarEvents,
      allTeachersList,
      login,
      logout,
      createAccount,
      confirmAccount,
      fetchUserInfo,
      fetchOrder,
      fetchUserMessages,
      markMessagesAsRead,
      fetchNotifications,
      fetchUnreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      fetchPlannedCourses,
      fetchCalendarEvents,
      fetchUnplannedCourses,
      fetchCalendarEventsByTeacher,
      fetchPaginatedTeachersByCourse,
      fetchAllTeachersByCourse,
      forgotPassword,
      resetPassword,
      sendMessage,
      updateUserInfo,
      updatePassword,
      setToken,
      setCurrentUser,
      resetUserData,
      setLogoutStatus,
      resendCode,
      planCourse,
      deletePlanning,
      reschedulePlanning,
      setMeeting,
      setNewTeacher,
      bookSlot,
      updateProfile,
      updateUserPassword,
      changeUserLanguage,
      loginWithSocial,
      registerWithSocial,
      authenticateWithSocial,
      confirmSocialLink,
      registerWithLinkedin,
    };
  },
  {
    persist: true,
  },
);
