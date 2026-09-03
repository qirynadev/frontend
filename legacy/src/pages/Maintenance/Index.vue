<script setup lang="ts">
import { computed } from "vue";

/**
 * Page « Coming soon » affichée quand la restriction d'IP est active.
 *
 * Volontairement autonome : aucune dépendance à l'API (/all-data renvoie 403
 * quand la restriction est active) ni au layout principal. Le texte est inliné
 * en FR/EN pour rester lisible même si les messages i18n ne sont pas chargés.
 */
const lang = computed(() => {
  const htmlLang = document.documentElement.getAttribute("lang");
  const guess = htmlLang || navigator.language || "fr";
  return guess.toLowerCase().startsWith("en") ? "en" : "fr";
});

const t = computed(() => {
  return lang.value === "en"
    ? {
        badge: "Access restricted",
        title: "You don't have access to this page",
        subtitle: "This page is private. Your access is not authorized.",
        contact: "A question? Contact us at",
      }
    : {
        badge: "Accès restreint",
        title: "Vous n'avez pas accès à cette page",
        subtitle: "Cette page est privée. Votre accès n'est pas autorisé.",
        contact: "Une question ? Écrivez-nous à",
      };
});
</script>

<template>
  <main class="coming-soon">
    <div class="coming-soon__card">
      <img src="/qiryna-logo.png" alt="Qiryna" class="coming-soon__logo" />

      <span class="coming-soon__badge">🔒 {{ t.badge }}</span>

      <h1 class="coming-soon__title">{{ t.title }}</h1>
      <p class="coming-soon__subtitle">{{ t.subtitle }}</p>

      <p class="coming-soon__contact">
        {{ t.contact }}
        <a href="mailto:contact@qiryna.com">contact@qiryna.com</a>
      </p>
    </div>
  </main>
</template>

<style scoped>
.coming-soon {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at 50% 0%, #14264f 0%, #0a1330 60%);
  font-family: "Poppins", "Segoe UI", system-ui, sans-serif;
}

.coming-soon__card {
  width: 100%;
  max-width: 560px;
  text-align: center;
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 32px;
  box-shadow: 0 20px 50px rgba(10, 19, 48, 0.35);
}

.coming-soon__logo {
  height: 56px;
  width: auto;
  margin: 0 auto 28px;
  object-fit: contain;
}

.coming-soon__badge {
  display: inline-block;
  background: #fef5f6;
  color: #fc1e3d;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.coming-soon__title {
  color: #0a1330;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  margin: 0 0 16px;
}

.coming-soon__subtitle {
  color: #5a6387;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 28px;
}

.coming-soon__contact {
  color: #8085a9;
  font-size: 14px;
  margin: 0;
}

.coming-soon__contact a {
  color: #fc1e3d;
  font-weight: 600;
  text-decoration: none;
}

.coming-soon__contact a:hover {
  text-decoration: underline;
}

@media (min-width: 640px) {
  .coming-soon__title {
    font-size: 34px;
  }
}
</style>
