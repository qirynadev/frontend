<script lang="ts" setup></script>

<template>
  <div class="app">
    <main class="main-container">
      <router-view>
        <template #default="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route"></component>
          </keep-alive>
        </template>
      </router-view>
    </main>
  </div>
</template>

<style>
.app {
  position: relative;
  width: 100%;
}
</style>
