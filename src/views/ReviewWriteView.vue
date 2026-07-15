<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ReviewForm from '@/components/review/ReviewForm.vue'

const route = useRoute()
const initialReview = computed(() => {
  const q = route.query
  if (!q || !q.locationId) return null
  return {
    selectedPlace: {
      id: Number(q.locationId),
      name: q.locationName ?? '',
      category: q.category ?? '',
    },
  }
})
</script>

<template>
  <ReviewForm :initialReview="initialReview" />
</template>