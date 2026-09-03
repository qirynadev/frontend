<script setup lang="ts">
import { RouterLink } from "vue-router";
import { i18nRoute } from "@/utils";

const goHome = () => {
  window.location.href = "/";
};
</script>

<template>
  <section class="page_404 container h-100">
    <div class="four_zero_four_bg">
      <h1 class="text-center">404</h1>
    </div>

    <div class="contant_box_404 flex items-center justify-center flex-col">
      <h3 class="h2">Vous avez l'air perdu</h3>

      <p>la page que vous recherchez n'est pas disponible !</p>

      <RouterLink :to="i18nRoute({ name: 'home' })" class="link_404 rounded-3">{{ $t("back-to-home") }}</RouterLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.page_404 {
  background: var(--color-surface);
  font-family: "Arvo", serif;

  img {
    width: 100%;
  }
}
.four_zero_four_bg {
  background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);
  height: 600px;
  background-position: center;

  h1 {
    font-size: 80px;
  }

  h3 {
    font-size: 80px;
  }
}
.link_404 {
  color: #fff !important;
  padding: 10px 20px;
  background: #ff3942;
  margin: 20px 0;
  display: inline-block;
}
.contant_box_404 {
  margin-top: -50px;
}
</style>
