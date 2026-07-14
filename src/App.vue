<script setup>
import TheHeader from '@/components/layouts/Header.vue'
import TheFooter from '@/components/layouts/Footer.vue'
import ChatbotWidget from '@/components/chat/ChatBot.vue'
import { RouterView } from 'vue-router'

</script>

<template>
  <div class="app-layout">
    <TheHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <TheFooter />
    <ChatbotWidget />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex-grow: 1;
}
</style>
