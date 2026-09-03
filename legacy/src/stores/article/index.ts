import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ref } from "vue";

// Authentifié : même les routes publiques /articles bénéficient du token quand présent,
// pour que `is_bookmarked` reflète l'état réel de l'utilisateur connecté.
const http = new HttpService();

export type ArticleType = {
  id: string;
  category: string;
  read_time_minutes: number;
  image: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: boolean;
  published_at: string | null;
  is_bookmarked: boolean;
  created_at: string;
};

/**
 * Articles/Blog publiés ("Nouveautés & conseils" sur Home mobile). Non persisté :
 * toujours resynchronisé depuis /articles (public) et /user/articles/*bookmark* (auth).
 */
export const useArticleStore = defineStore("articleStore", () => {
  const latestArticles = ref<ArticleType[]>([]);
  const bookmarkedArticles = ref<ArticleType[]>([]);

  async function fetchLatestArticles(perPage = 6) {
    const { data, success } = await http.get(`/articles?perPage=${perPage}`);
    latestArticles.value = success ? (data?.data ?? []) : [];
    return success;
  }

  async function fetchBookmarkedArticles() {
    const { data, success } = await http.get("/user/articles/bookmarks");
    bookmarkedArticles.value = success ? (data ?? []) : [];
    return success;
  }

  async function toggleBookmark(articleId: string): Promise<boolean | null> {
    const { data, success } = await http.post(`/user/articles/${articleId}/bookmark`, {});
    if (!success) return null;

    const bookmarked = !!data?.bookmarked;
    latestArticles.value = latestArticles.value.map((article) =>
      article.id === articleId ? { ...article, is_bookmarked: bookmarked } : article,
    );

    return bookmarked;
  }

  return {
    latestArticles,
    bookmarkedArticles,
    fetchLatestArticles,
    fetchBookmarkedArticles,
    toggleBookmark,
  };
});
