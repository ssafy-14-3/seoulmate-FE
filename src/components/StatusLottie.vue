<script setup>
// src/components/StatusLottie.vue
// 로딩/실패 상태 공용 컴포넌트
// 사전 준비: npm install lottie-web
// Lottie 파일 위치: src/assets/lottie/loading.json, notFound.json
import { ref, onMounted, onUnmounted, watch } from 'vue'
import lottie from 'lottie-web'
import loadingAnim from '@/assets/loading.json'
import notFoundAnim from '@/assets/notFound.json'

const props = defineProps({
  /** 'loading' | 'error' */
  type: { type: String, default: 'loading' },
  /** 애니메이션 아래 표시할 문구 */
  message: { type: String, default: '' },
})
const emit = defineEmits(['retry'])

const container = ref(null)
let anim = null

const animations = {
  loading: loadingAnim,
  error: notFoundAnim,
}

function render() {
  anim?.destroy() // 기존 인스턴스 정리 후 재생성
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: animations[props.type] ?? loadingAnim,
  })
}

onMounted(render)
watch(() => props.type, render) // 로딩 → 에러 전환 대응
onUnmounted(() => anim?.destroy()) // 메모리 누수 방지
</script>

<template>
  <div class="status-wrap" role="status" :aria-label="message || type">
    <div ref="container" :class="['lottie', type]"></div>
    <p v-if="message" class="status-message">{{ message }}</p>
    <button v-if="type === 'error'" class="retry-btn" @click="emit('retry')">다시 시도</button>
  </div>
</template>

<style scoped>
.status-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 32px 16px;
  text-align: center;
}
.lottie {
  width: 100%;
}
/* loading.json은 1920x1080(가로형)이라 조금 넓게 */
.lottie.loading {
  max-width: 420px;
}
/* notFound.json은 426x290 */
.lottie.error {
  max-width: 300px;
}
.status-message {
  color: #737686;
  font-size: 15px;
  margin: 16px 0 0;
}
.retry-btn {
  margin-top: 16px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  border-radius: 4px;
  padding: 10px 24px;
  background: #004ac6;
  color: #fff;
  transition: opacity 0.15s;
}
.retry-btn:hover {
  opacity: 0.9;
}
</style>
