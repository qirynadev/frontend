<script lang="ts" setup>
import myIcon from "@/assets/images/tv-television-svgrepo-com.svg";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";

import { useSideBar } from "@/hooks/useSetting";
import router from "@/router";
import { type Ref, ref } from "vue";
import SideBar from "./SideBar.vue";

const { handleChangeSideBarState } = useSideBar();

const showMobileNavBar: Ref<boolean> = ref(true);

function myFunction(x: any) {
  if (x.matches) {
    showMobileNavBar.value = true;
  } else {
    showMobileNavBar.value = false;
  }
}

var x = window.matchMedia("(max-width: 768px)");
myFunction(x);
x.addListener(myFunction);

const handleRedirectInside = () => router.push("/register");
</script>

<template>
  <!-- Web navbar -->
  <div class="custom_navbar d-flex align-items-center justify-content-center py-0" v-if="!showMobileNavBar">
    <div class="global-container d-flex align-items-center justify-content-between h-100">
      <div class="logo me-4 mb-3">
        <router-link to="/">
          <img src="/qiryna-logo.png" class="h-10 w-auto" alt="Qiryna" />
        </router-link>
      </div>

      <div class="others ms-5 d-flex justify-content-evenly align-items-center">
        <router-link to="/connexion" class="me-3">Se connecter</router-link>
        <ButtonGeneral
          title="S'inscrire"
          className="inside_btn"
          :withIcon="false"
          iconPosition="left"
          :iconURL="myIcon"
          :onPress="() => handleRedirectInside()"
        />
        <div class="langue ms-3 d-flex align-items-center justify-content-center">
          <img src="/src/assets/images/flag-en.svg" alt="lang flag" class="w-100 h-100" />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile navbar -->
  <div class="custom_navbar d-flex flex-row align-items-center justify-content-between" v-if="showMobileNavBar">
    <div class="burger-container" @click.prevent="handleChangeSideBarState()">
      <img src="@/assets/images/menu-black.png" alt="burger" />
    </div>

    <div class="mobile-logo me-4">
      <router-link to="/">
        <img src="@/assets/images/logo-n.png" />
      </router-link>
    </div>

    <div class="others ms-5 d-flex justify-content-evenly align-items-center">
      <router-link to="/connexion" class="me-3">Se connecter</router-link>
      <ButtonGeneral
        title="S'inscrire"
        className="inside_btn"
        :withIcon="false"
        iconPosition="left"
        :iconURL="myIcon"
      />
    </div>
  </div>

  <!-- Sidebar -->
  <SideBar />
</template>

<style lang="scss" scoped>
.custom_navbar {
  padding: 5px 12px;
  width: 100%;
  background-color: var(--color-surface);
  height: 80px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  box-shadow: 0px 2px 5px #2c2c2c63;
  z-index: 99;
}

.inside_btn {
  text-align: center;
  color: white;
  padding: 5px 15px;
  background-color: #ff3942;
  border-radius: 20px;
}

.langue,
.login {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background-color: rgb(96, 96, 96);
}

@media only screen and (max-width: 425px) {
}

@media only screen and (max-width: 425px) {
  .mobile-logo {
    width: 100px;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

@media only screen and (max-width: 320px) {
  .mobile-logo {
    margin-left: 20px;
  }
}
</style>
