/**
 * Centralized route path translations per locale.
 * Each key is a route segment identifier, and values are the localized URL paths.
 */
export const routePaths: Record<string, Record<string, string>> = {
  fr: {
    // Authentication
    signup: "inscription",
    signin: "connexion",
    "password-forgot": "mot-de-passe-oublie",
    "reset-password": "reinitialiser-mot-de-passe",

    // Courses
    courses: "cours",
    "choose-language": "choix-langue",
    teachers: "professeurs",
    formulas: "formules",
    finalize: "finaliser",
    objectives: "objectifs",

    // Schools / Studies
    studies: "etudes",
    support: "accompagnement",
    "choose-destination": "choix-destination",

    // Living
    "cost-of-living": "frais-de-vie",

    // MBA
    mba: "mba",
    schools: "ecoles",
    formula: "formules",
    mentors: "mentors",

    // Profiling
    profiling: "profilage",
    packages: "formules",
    detail: "detail",
    presentation: "presentation",
    tracking: "suivi",

    // Coaching
    coaching: "coaching",

    // Dashboard
    dashboard: "dashboard",
    "my-account": "mon-compte",
    "orders-history": "historique-des-achats",
    "my-project": "mon-projet",
    "my-courses": "mes-cours",
    planned: "planifies",
    unplanned: "non-planifies",
    timetable: "emploi-du-temps",
    planning: "planification",
    messages: "messagerie",
    "my-evaluations": "mes-evaluations",
    notifications: "notifications",
    theme: "theme",

    // Meeting / Zoom
    meeting: "conference",

    // Payment
    "order-success": "commande-succes",
    "order-canceled": "commande-annulee",
    "email-confirmation": "confirmation-email-paiement",

    // Data collection
    "data-collection": "collecte-informations",

    // Static pages
    cgu: "cgu",
    faq: "faq",
    legals: "mentions-legales",
    "legal-notice": "informations-legales",
    privacy: "confidentialite",
    cookies: "cookies",
    contact: "contact",
    "newsletter-confirmation": "newsletter-confirmation",
    page: "page",

    // Evaluation
    evaluation: "evaluation",
    account: "compte",
    splash: "splash",
    compose: "compose",
    finish: "fin",
  },
  en: {
    // Authentication
    signup: "signup",
    signin: "signin",
    "password-forgot": "password-forgot",
    "reset-password": "reset-password",

    // Courses
    courses: "courses",
    "choose-language": "choose-language",
    teachers: "teachers",
    formulas: "formulas",
    finalize: "finalize",
    objectives: "objectives",

    // Schools / Studies
    studies: "studies",
    support: "support",
    "choose-destination": "choose-destination",

    // Living
    "cost-of-living": "cost-of-living",

    // MBA
    mba: "mba",
    schools: "schools",
    formula: "formula",
    mentors: "mentors",

    // Profiling
    profiling: "profiling",
    packages: "packages",
    detail: "detail",
    presentation: "presentation",
    tracking: "tracking",

    // Coaching
    coaching: "coaching",

    // Dashboard
    dashboard: "dashboard",
    "my-account": "my-account",
    "orders-history": "orders-history",
    "my-project": "my-project",
    "my-courses": "my-courses",
    planned: "planned",
    unplanned: "unplanned",
    timetable: "timetable",
    planning: "planning",
    messages: "messages",
    "my-evaluations": "my-evaluations",
    notifications: "notifications",
    theme: "theme",

    // Meeting / Zoom
    meeting: "meeting",

    // Payment
    "order-success": "order-success",
    "order-canceled": "order-canceled",
    "email-confirmation": "payment-email-confirmation",

    // Data collection
    "data-collection": "information-collection",

    // Static pages
    cgu: "cgu",
    faq: "faq",
    legals: "legals",
    "legal-notice": "legal-notice",
    privacy: "privacy",
    cookies: "cookies",
    contact: "contact",
    "newsletter-confirmation": "newsletter-confirmation",
    page: "page",

    // Evaluation
    evaluation: "evaluation",
    account: "account",
    splash: "splash",
    compose: "compose",
    finish: "finish",
  },
};

/**
 * Helper to get a translated path segment for a given locale.
 */
export function p(locale: string, key: string): string {
  return routePaths[locale]?.[key] ?? key;
}
