<script setup>
import router from '@/router.js'

const navItems = [
  { label: '관광지', category: '관광지' },
  { label: '맛집', category: '맛집' },
  { label: '축제', category: '축제·행사' },
]

function goCategory(category) {
  router.push({ path: '/list', query: { category } })
}
</script>

<template>
  <header class="header">
    <div class="header-inner container">
      <a href="/" class="logo headline-md">서울메이트</a>

      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.category"
          class="nav-link label-sm"
          @click="goCategory(item.category)"
        >
          {{ item.label }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-outline-variant);
}

.header-inner {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 700;
  color: var(--color-primary);
}

.nav {
  display: none;
}

@media (min-width: 768px) {
  .nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }
}

.nav-link {
  color: var(--color-on-surface-variant);
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}
</style>
