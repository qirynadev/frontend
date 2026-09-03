/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_BASE_URL: string;
    readonly VITE_DEFAULT_LOCALE: string;
    readonly VITE_SUPPORTED_LOCALES: string;
    /** Identifiant de mesure Google Analytics 4, ex: "G-XXXXXXXXXX" (optionnel) */
    readonly VITE_GA_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module "element-plus";
declare module "element-plus/dist/locale/fr.mjs";
declare module "bootstrap";
declare module "vue3-emoji-picker";
declare module "vue-stripe-js";
declare module "vue3-linkedin-login";