import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useAppStore } from "@/stores";

interface SeoOptions {
  title?: string | (() => string | undefined);
  description?: string | (() => string | undefined);
  image?: string | (() => string | undefined);
  url?: string | (() => string | undefined);
  type?: string;
}

/**
 * Composable centralisé pour la gestion du SEO.
 * Chaque option accepte une valeur statique ou une fonction réactive.
 * Fallback automatique sur les paramètres globaux du site (appStore.settings?.site).
 */
export function useSeo(options: SeoOptions = {}) {
  const appStore = useAppStore();

  const site = computed(() => appStore.settings?.site);

  const resolveVal = (opt: string | (() => string | undefined) | undefined, fallback: () => string | undefined) => {
    return () => {
      const val = typeof opt === "function" ? opt() : opt;
      return (val || fallback()) as string;
    };
  };

  const finalTitle = resolveVal(options.title, () => site.value?.name);
  const finalDescription = resolveVal(options.description, () => site.value?.description);
  const finalImage = resolveVal(options.image, () => site.value?.image);
  const finalUrl = resolveVal(options.url, () => (typeof window !== "undefined" ? window.location.href : undefined));
  const ogType = options.type ?? "website";

  useHead({
    title: finalTitle,
    meta: [
      { name: "description", content: finalDescription },
      { property: "og:title", content: finalTitle },
      { property: "og:description", content: finalDescription },
      { property: "og:image", content: finalImage },
      { property: "og:url", content: finalUrl },
      { property: "og:type", content: () => ogType },
      { property: "og:site_name", content: () => site.value?.name },
      { name: "twitter:card", content: () => "summary_large_image" },
      { name: "twitter:title", content: finalTitle },
      { name: "twitter:description", content: finalDescription },
      { name: "twitter:image", content: finalImage },
    ],
  });
}
