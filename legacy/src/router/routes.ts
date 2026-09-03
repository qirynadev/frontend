import type { RouteRecordRaw } from "vue-router";
import { p } from "./routePaths";

/**
 * Build all main application routes for a given locale.
 * Routes are defined once; only the path segments and name prefixes change per locale.
 */
export function buildRoutes(locale: string): RouteRecordRaw[] {
  return [
    /* Order Success */
    {
      path: p(locale, "order-success"),
      name: `${locale}.order-success`,
      component: () => import("@/pages/Payment/Success.vue"),
    },
    /* Order Canceled */
    {
      path: p(locale, "order-canceled"),
      name: `${locale}.order-canceled`,
      component: () => import("@/pages/Payment/Canceled.vue"),
    },
    /* Payment Email Confirmation */
    {
      path: p(locale, "email-confirmation"),
      name: `${locale}.email-confirmation`,
      component: () => import("@/pages/Payment/EmailConfirmation.vue"),
    },
    /* Data Collection via email link */
    {
      path: `${p(locale, "data-collection")}/:token`,
      name: `${locale}.data-collection`,
      component: () => import("@/pages/DataCollection/Index.vue"),
    },
    /* CGU */
    {
      path: p(locale, "cgu"),
      name: `${locale}.cgu`,
      component: () => import("@/pages/Static/cgu.vue"),
    },
    /* FAQ */
    {
      path: p(locale, "faq"),
      name: `${locale}.faq`,
      component: () => import("@/pages/Static/faq.vue"),
    },
    /* Legals (menu "Mentions légales" -> CGU/Confidentialité/Cookies/Informations légales) */
    {
      path: p(locale, "legals"),
      name: `${locale}.legals`,
      component: () => import("@/pages/Static/legals.vue"),
    },
    /* Legal notice (ancien contenu CMS "legals", déplacé pour laisser la place au menu ci-dessus) */
    {
      path: p(locale, "legal-notice"),
      name: `${locale}.legal-notice`,
      component: () => import("@/pages/Static/legalNotice.vue"),
    },
    /* Privacy / Confidentialité */
    {
      path: p(locale, "privacy"),
      name: `${locale}.privacy`,
      component: () => import("@/pages/Static/privacy.vue"),
    },
    /* Cookies */
    {
      path: p(locale, "cookies"),
      name: `${locale}.cookies`,
      component: () => import("@/pages/Static/cookies.vue"),
    },
    /* Contact */
    {
      path: p(locale, "contact"),
      name: `${locale}.contact`,
      component: () => import("@/pages/Static/contact.vue"),
    },
    /* Newsletter confirmation */
    {
      path: p(locale, "newsletter-confirmation"),
      name: `${locale}.newsletter-confirmation`,
      component: () => import("@/pages/Static/newsletter.vue"),
    },
    /* Home */
    {
      path: "",
      name: `${locale}.home`,
      component: () => import("@/pages/Home/Index.vue"),
    },
    /* Static Pages */
    {
      path: `${p(locale, "page")}/:slug`,
      name: `${locale}.static`,
      component: () => import("@/pages/Static/index.vue"),
    },
    /* Grouped child routes */
    {
      path: "",
      children: [
        ...buildAuthenticationRoutes(locale),
        ...buildCourseRoutes(locale),
        ...buildSchoolRoutes(locale),
        ...buildLivingRoutes(locale),
        ...buildMbaRoutes(locale),
        ...buildProfilingRoutes(locale),
        ...buildCoachingRoutes(locale),
        ...buildDashboardRoutes(locale),
        ...buildZoomRoutes(locale),
      ],
    },
  ];
}

/* ─── Authentication ─── */
function buildAuthenticationRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "signup"),
      name: `${locale}.signup`,
      component: () => import("@/pages/Register/Index.vue"),
      meta: { hideFooter: true, hideNav: true },
    },
    {
      path: p(locale, "signin"),
      name: `${locale}.signin`,
      component: () => import("@/pages/Login/Index.vue"),
      meta: { hideFooter: true, hideNav: true },
    },
    {
      path: p(locale, "password-forgot"),
      name: `${locale}.password-forgot`,
      component: () => import("@/pages/ForgotPassword/Index.vue"),
      meta: { hideFooter: true, hideNav: true },
    },
    {
      path: p(locale, "reset-password"),
      name: `${locale}.reset-password`,
      component: () => import("@/pages/ForgotPassword/ResetPassword.vue"),
    },
  ];
}

/* ─── Courses ─── */
function buildCourseRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "choose-language"),
      name: `${locale}.choose-language`,
      component: () => import("@/pages/Course/LanguageChoice.vue"),
      meta: { hideFooter: true, hideNav: true },
    },
    {
      path: `${p(locale, "courses")}/:slug`,
      children: [
        {
          path: "",
          name: `${locale}.courses`,
          component: () => import("@/pages/Course/Index.vue"),
        },
        {
          path: p(locale, "objectives"),
          name: `${locale}.courses-objectives`,
          component: () => import("@/pages/Course/Objectives.vue"),
          meta: { hideFooter: true, hideNav: true },
        },
        {
          // « Choix du niveau » et « CoursePresentation » fusionnés dans la page niveau :
          // les anciens liens /cours/:slug/:level redirigent vers l'étape 1 du wizard.
          path: ":level",
          redirect: (to) => ({ name: `${locale}.courses`, params: { slug: to.params.slug } }),
        },
        {
          path: p(locale, "formulas"),
          name: `${locale}.courses-formulas`,
          component: () => import("@/pages/Course/Formulas.vue"),
        },
        {
          path: p(locale, "finalize"),
          name: `${locale}.courses-finalize`,
          component: () => import("@/pages/Course/TeacherPresentation.vue"),
        },
        {
          path: p(locale, "teachers"),
          children: [
            {
              path: "",
              name: `${locale}.teachers`,
              component: () => import("@/pages/Course/Teachers.vue"),
            },
            {
              path: ":teacherslug",
              name: `${locale}.teacher-presentation`,
              component: () => import("@/pages/Course/TeacherPresentation.vue"),
            },
          ],
        },
      ],
    },
  ];
}

/* ─── Schools / Studies ─── */
function buildSchoolRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "studies"),
      children: [
        {
          path: p(locale, "choose-destination"),
          name: `${locale}.choose-destination`,
          component: () => import("@/pages/School/DestinationChoice.vue"),
          meta: { hideFooter: true, hideNav: true },
        },
        {
          path: `${p(locale, "support")}/:areaslug`,
          name: `${locale}.area-formula`,
          component: () => import("@/pages/School/AreaFormula.vue"),
        },
        {
          path: ":slug",
          children: [
            {
              path: "",
              name: `${locale}.destinations`,
              component: () => import("@/pages/School/Index.vue"),
            },
            {
              path: ":areaslug",
              children: [
                {
                  path: "",
                  name: `${locale}.schools`,
                  component: () => import("@/pages/School/AreasSchools.vue"),
                },
                {
                  path: `${p(locale, "mentors")}`,
                  name: `${locale}.area-mentors`,
                  component: () => import("@/pages/School/AreaMentors.vue"),
                },
                {
                  path: `${p(locale, "mentors")}/:mentorslug`,
                  name: `${locale}.mentor-presentation`,
                  component: () => import("@/pages/School/MentorPresentation.vue"),
                },
                {
                  path: ":schoolslug",
                  name: `${locale}.school-presentation`,
                  component: () => import("@/pages/School/SchoolPresentation.vue"),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

/* ─── Living / Cost of Living ─── */
function buildLivingRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "cost-of-living"),
      name: `${locale}.living-choose-destination`,
      component: () => import("@/pages/Living/ChooseDestination.vue"),
    },
    {
      path: `${p(locale, "cost-of-living")}/:slug`,
      name: `${locale}.living`,
      component: () => import("@/pages/Living/Index.vue"),
    },
    {
      path: `${p(locale, "cost-of-living")}/:slug/:expenseslug`,
      name: `${locale}.living-detail`,
      component: () => import("@/pages/Living/LivingPresentation.vue"),
    },
    {
      path: `${p(locale, "cost-of-living")}/${p(locale, "formulas")}`,
      name: `${locale}.living-formulas`,
      component: () => import("@/pages/Living/Formulas.vue"),
    },
  ];
}

/* ─── MBA ─── */
function buildMbaRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: `${p(locale, "mba")}/:slug`,
      children: [
        {
          path: p(locale, "schools"),
          children: [
            {
              path: "",
              name: `${locale}.mba`,
              component: () => import("@/pages/Mba/Index.vue"),
            },
            {
              path: ":schoolslug",
              name: `${locale}.mba-school-presentation`,
              component: () => import("@/pages/Mba/SchoolPresentation.vue"),
            },
          ],
        },
        {
          path: p(locale, "formula"),
          name: `${locale}.mba-formula`,
          component: () => import("@/pages/Mba/Formula.vue"),
        },
        {
          path: p(locale, "mentors"),
          children: [
            {
              path: "",
              name: `${locale}.mba-mentors`,
              component: () => import("@/pages/Mba/Mentors.vue"),
            },
            {
              path: ":mentorslug",
              name: `${locale}.mba-mentor-presentation`,
              component: () => import("@/pages/Mba/MentorPresentation.vue"),
            },
          ],
        },
      ],
    },
  ];
}

/* ─── Profiling ─── */
function buildProfilingRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "profiling"),
      children: [
        {
          path: "",
          name: `${locale}.profilage`,
          component: () => import("@/pages/Profiling/Index.vue"),
        },
        {
          path: p(locale, "presentation"),
          name: `${locale}.profilage-landing`,
          component: () => import("@/pages/Profiling/Landing.vue"),
        },
        {
          path: `${p(locale, "detail")}/:slug`,
          name: `${locale}.profilage-detail`,
          component: () => import("@/pages/Profiling/ProfilagePresentation.vue"),
        },
        {
          path: p(locale, "packages"),
          name: `${locale}.profilage-formulas`,
          component: () => import("@/pages/Profiling/Formulas.vue"),
        },
        {
          path: p(locale, "tracking"),
          name: `${locale}.profilage-project`,
          component: () => import("@/pages/Profiling/ProjectDetail.vue"),
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
  ];
}

/* ─── Coaching ─── */
function buildCoachingRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "coaching"),
      name: `${locale}.coaching`,
      component: () => import("@/pages/Coaching/Index.vue"),
    },
  ];
}

/* ─── Dashboard ─── */
function buildDashboardRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "dashboard"),
      redirect: { name: `${locale}.user-orders` },
      children: [
        {
          path: p(locale, "my-account"),
          name: `${locale}.user-settings`,
          component: () => import("@/pages/Dashboard/Profile/Index.vue"),
        },
        {
          path: `${p(locale, "my-account")}/${p(locale, "notifications")}`,
          name: `${locale}.user-settings-notifications`,
          component: () => import("@/pages/Dashboard/Profile/Notifications.vue"),
          meta: { hideFooter: true, hideNav: true },
        },
        {
          path: `${p(locale, "my-account")}/${p(locale, "theme")}`,
          name: `${locale}.user-settings-theme`,
          component: () => import("@/pages/Dashboard/Profile/Theme.vue"),
          meta: { hideFooter: true, hideNav: true },
        },
        {
          path: p(locale, "orders-history"),
          name: `${locale}.user-orders`,
          component: () => import("@/pages/Dashboard/Orders.vue"),
        },
        {
          path: p(locale, "my-project"),
          name: `${locale}.user-project`,
          component: () => import("@/pages/Dashboard/Project.vue"),
        },
        {
          path: `${p(locale, "my-project")}/${p(locale, "cost-of-living")}`,
          name: `${locale}.user-project-living`,
          component: () => import("@/pages/Living/Project.vue"),
        },
        {
          path: p(locale, "my-courses"),
          redirect: `${p(locale, "dashboard")}/${p(locale, "my-courses")}/${p(locale, "planned")}`,
          children: [
            {
              path: p(locale, "planned"),
              name: `${locale}.user-courses-planned`,
              component: () => import("@/pages/Dashboard/Courses/PlannedCourses.vue"),
            },
            {
              path: p(locale, "unplanned"),
              name: `${locale}.user-courses-unplanned`,
              component: () => import("@/pages/Dashboard/Courses/UnplannedCourses.vue"),
            },
            {
              path: p(locale, "timetable"),
              name: `${locale}.user-time-spent`,
              component: () => import("@/pages/Dashboard/Courses/TimeSpent.vue"),
            },
            {
              path: `${p(locale, "planning")}/:id`,
              name: `${locale}.user-courses-planning`,
              component: () => import("@/pages/Dashboard/Courses/Planning.vue"),
            },
            {
              path: `${p(locale, "finalize")}/:orderId`,
              name: `${locale}.user-course-finalize`,
              component: () => import("@/pages/Course/TeacherPresentation.vue"),
            },
            {
              path: p(locale, "teachers"),
              children: [
                {
                  path: "",
                  name: `${locale}.user-courses-teachers`,
                  component: () => import("@/pages/Dashboard/Courses/Teachers/Index.vue"),
                },
                {
                  path: ":teacherslug",
                  name: `${locale}.user-courses-teacher-detail`,
                  component: () => import("@/pages/Dashboard/Courses/Teachers/Detail.vue"),
                },
              ],
            },
          ],
        },
        {
          path: p(locale, "messages"),
          name: `${locale}.user-messages`,
          component: () => import("@/pages/Dashboard/Messages.vue"),
        },
        {
          path: p(locale, "notifications"),
          name: `${locale}.user-notifications`,
          component: () => import("@/pages/Dashboard/Notifications.vue"),
        },
        {
          path: p(locale, "my-evaluations"),
          name: `${locale}.user-evaluations`,
          component: () => import("@/pages/Dashboard/Evaluations.vue"),
        },
      ],
      meta: {
        requiresAuth: true,
      },
    },
  ];
}

/* ─── Zoom / Meeting ─── */
function buildZoomRoutes(locale: string): RouteRecordRaw[] {
  return [
    {
      path: p(locale, "meeting"),
      name: `${locale}.meeting-call`,
      component: () => import("@/pages/Dashboard/Meeting/Call.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ];
}
