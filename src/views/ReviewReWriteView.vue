<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReviewForm from '@/components/review/ReviewForm.vue'

const route = useRoute()
const router = useRouter()
const initialReview = ref(null)

onMounted(() => {
  const id = route.params.id
  try {
    const raw = sessionStorage.getItem(`review_edit_${id}`)
    if (!raw) {
      // no prefilled data — redirect back
      router.replace('/')
      return
    }
    initialReview.value = JSON.parse(raw)
  } catch (e) {
    router.replace('/')
  }
})
</script>

<template>
  <ReviewForm v-if="initialReview" :initialReview="initialReview" />
</template>