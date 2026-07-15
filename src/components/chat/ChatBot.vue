<script setup>
import { ref } from 'vue'
import { sendChat } from '../../../api/index.js'

const isOpen = ref(false)
const input = ref('')
const messages = ref([
  {
    id: 1,
    role: 'bot',
    content: '안녕하세요! 서울메이트 챗봇입니다. 무엇을 도와드릴까요?',
  },
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text) return

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text,
  })

  input.value = ''

  try {
    const history = messages.value.map((message) => ({
      role: message.role === 'bot' ? 'assistant' : 'user',
      content: message.content,
    }))

    const response = await sendChat(text, history)

    messages.value.push({
      id: Date.now() + 1,
      role: 'bot',
      content: response?.answer || response?.content || '죄송해요. 답변을 가져오지 못했어요.',
    })
  } catch (error) {
    console.error('챗봇 API 호출 중 오류 발생:', error)
    messages.value.push({
      id: Date.now() + 1,
      role: 'bot',
      content: '챗봇 응답을 가져오지 못했어요. 다시 시도해주세요.',
    })
  }
}
</script>

<template>
  <div class="chatbot-widget">
    <Transition name="panel">
      <div
        v-if="isOpen"
        class="chat-panel"
        role="dialog"
        aria-modal="true"
        aria-label="챗봇 대화창"
      >
        <div class="chat-panel__header">
          <div>
            <p class="chat-panel__title">서울메이트 챗봇</p>
            <p class="chat-panel__subtitle">궁금한 것을 물어보세요</p>
          </div>
          <button class="icon-button" type="button" @click="toggleChat" aria-label="챗봇 닫기">
            ✕
          </button>
        </div>

        <div class="chat-panel__body">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['bubble', message.role === 'user' ? 'bubble--user' : 'bubble--bot']"
          >
            {{ message.content }}
          </div>
        </div>

        <form class="chat-panel__footer" @submit.prevent="sendMessage">
          <input v-model="input" type="text" placeholder="메시지를 입력하세요" />
          <button type="submit">전송</button>
        </form>
      </div>
    </Transition>

    <button
      class="chat-fab"
      type="button"
      @click="toggleChat"
      :aria-expanded="isOpen"
      aria-label="챗봇 열기"
    >
      <span v-if="!isOpen">💬</span>
      <span v-else>✕</span>
    </button>
  </div>
</template>

<style scoped>
.chatbot-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1100;
  font-family: Inter, 'Apple SD Gothic Neo', sans-serif;
}

.chat-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 12px 24px rgba(0, 74, 198, 0.25);
}

.chat-panel {
  position: absolute;
  right: 0;
  bottom: 72px;
  width: min(92vw, 360px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.16);
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.chat-panel__title {
  font-size: 15px;
  font-weight: 700;
}

.chat-panel__subtitle {
  font-size: 12px;
  opacity: 0.85;
}

.icon-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-primary);
}

.chat-panel__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  height: 320px;
  overflow-y: auto;
  background: var(--color-surface);
}

.bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
}

.bubble--bot {
  align-self: flex-start;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
}

.bubble--user {
  align-self: flex-end;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.chat-panel__footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-lowest);
}

.chat-panel__footer input {
  flex: 1;
  border: none;
  border-radius: 999px;
  padding: 10px 12px;
  background: var(--color-surface);
  outline: none;
}

.chat-panel__footer button {
  padding: 0 12px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
