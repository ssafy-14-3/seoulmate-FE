<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router.js'

const categories = [
  {
    label: '관광지',
    icon: 'explore',
    desc: '서울의 역사적인 고궁부터 핫한 랜드마크까지.',
    category: '관광지',
  },
  {
    label: '맛집',
    icon: 'restaurant',
    desc: '현지인이 추천하는 숨겨진 골목 식당과 카페.',
    category: '맛집',
  },
  {
    label: '축제·행사',
    icon: 'event',
    desc: '지금 이 순간, 서울에서 열리는 활기찬 축제 소식.',
    category: '축제·행사',
  },
]

const recentReviews = ref([])

onMounted(async () => {
  // TODO(백엔드): 홈 화면용 "최근 리뷰 전체" 엔드포인트 필요.
  // 설계문서에는 장소별 리뷰(GET /api/locations/{id}/reviews)만 있으므로
  // GET /api/reviews/recent 를 추가하거나 팀 결정에 맞게 수정할 것.
  //
  // 준비되면 아래 주석 해제:
  // import { ... } from '@/api' 후
  // const data = await fetchRecentReviews({ size: 4 })
  // recentReviews.value = data.items

  // 백엔드 준비 전 화면 확인용 목데이터
  recentReviews.value = [
    {
      id: 1,
      title: '경복궁 야간 개장 다녀왔어요!',
      content:
        '밤에 보는 경복궁은 정말 환상적입니다. 조명이 비친 경회루의 모습은 잊을 수 없을 정도로 아름다웠어요. 미리 예매하시는 걸 추천합니다.',
      rating: 5,
      created_at: '2026-07-12T10:00:00',
      location_id: 1,
    },
    {
      id: 2,
      title: '성수동 골목 카페 추천',
      content:
        '인더스트리얼한 분위기가 너무 멋진 곳이었어요. 시그니처 라떼가 정말 고소하고 맛있습니다. 주말엔 대기가 좀 길긴 하지만 기다릴만해요.',
      rating: 4,
      created_at: '2026-07-11T15:30:00',
      location_id: 2,
    },
    {
      id: 3,
      title: '반포 한강공원 피크닉',
      content:
        '요즘 날씨에 딱이에요! 무지개 분수 시간 맞춰서 가면 분위기 최고입니다. 돗자리 펴고 치킨 시켜 먹기 너무 좋은 장소에요.',
      rating: 5,
      created_at: '2026-07-10T18:20:00',
      location_id: 3,
    },
    {
      id: 4,
      title: '명동 칼국수 본점 방문기',
      content:
        '오랜만에 찾았는데 여전히 맛이 그대로네요. 겉절이 김치가 정말 맵지만 중독성 있습니다. 비빔 국수도 꼭 같이 드셔보시길 추천드려요.',
      rating: 4,
      created_at: '2026-07-09T12:00:00',
      location_id: 4,
    },
  ]
})

function formatDate(iso) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}


function goCategory(category) {
  router.push({ path: '/locations', query: { category } })
}

function goList() {
  router.push('/list')
}

function goWriteReview() {
  router.push('/review/write')
}

function goDetail(locationId) {
  router.push(`/locations/${locationId}`)
}
</script>

<template>
  <!-- Hero -->
  <section class="hero">
    <div class="hero-inner container">
      <span class="hero-badge label-sm">Seoul Community Hub</span>
      <h1 class="hero-title display-lg">
        지역 정보 공유 커뮤니티 <br class="desktop-br" />
        <span class="hero-accent">서울메이트</span>
      </h1>
      <p class="hero-desc body-lg">
        서울 지역의 관광, 맛집, 축제 정보를 한눈에 만나보세요. <br />
        실시간 사용자 리뷰와 숨겨진 명소를 이웃들과 함께 나눕니다.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="goList">정보 찾기</button>
        <button class="btn btn-outline" @click="goWriteReview">리뷰 작성하기</button>
      </div>
    </div>

    <!-- 배경 장식 -->
    <div class="hero-blob hero-blob-tr"></div>
    <div class="hero-blob hero-blob-bl"></div>
  </section>

  <!-- 카테고리 바로가기 -->
  <section class="categories">
    <div class="container">
      <div class="category-grid">
        <button
          v-for="cat in categories"
          :key="cat.category"
          class="category-card"
          @click="goCategory(cat.category)"
        >
          <div class="category-icon">
            <span class="material-symbols-outlined">{{ cat.icon }}</span>
          </div>
          <h3 class="headline-md">{{ cat.label }}</h3>
          <p class="category-desc body-md">{{ cat.desc }}</p>
          <span class="category-cta label-sm">
            둘러보기
            <span class="material-symbols-outlined cta-arrow">arrow_forward</span>
          </span>
        </button>
      </div>
    </div>
  </section>

  <!-- 최근 사용자 리뷰 -->
  <section class="reviews">
    <div class="container">
      <div class="reviews-header">
        <div>
          <h2 class="headline-lg reviews-title">최근 사용자 리뷰</h2>
          <p class="body-md reviews-sub">서울메이트 친구들이 공유한 생생한 후기를 확인하세요.</p>
        </div>
        <button class="reviews-more label-sm" @click="goList">
          전체보기
          <span class="material-symbols-outlined more-icon">add</span>
        </button>
      </div>

      <div class="review-grid">
        <button
          v-for="review in recentReviews"
          :key="review.id"
          class="review-card"
          @click="goDetail(review.location_id)"
        >
          <div class="review-meta">
            <div class="avatar">
              <span class="material-symbols-outlined avatar-icon">person</span>
            </div>
            <span class="label-sm review-author">익명</span>
            <span class="label-sm review-date">{{ formatDate(review.created_at) }}</span>
          </div>

          <h4 class="headline-md review-title">{{ review.title }}</h4>
          <p class="body-md review-content">{{ review.content }}</p>

          <div class="review-stars">
            <span
              v-for="n in 5"
              :key="n"
              class="material-symbols-outlined star"
              :class="{ filled: n <= review.rating, 'star-on': n <= review.rating }"
            >
              star
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  background: color-mix(in srgb, var(--color-secondary-container) 30%, transparent);
  overflow: hidden;
  padding: 64px 0 96px;
}

@media (min-width: 768px) {
  .hero {
    padding: 96px 0 128px;
  }
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 10;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  margin-bottom: 24px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.hero-title {
  margin-bottom: 24px;
}

.hero-accent {
  color: var(--color-primary);
}

.desktop-br {
  display: none;
}

@media (min-width: 768px) {
  .desktop-br {
    display: block;
  }
}

.hero-desc {
  color: var(--color-on-surface-variant);
  max-width: 42rem;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

@media (min-width: 640px) {
  .hero-actions {
    flex-direction: row;
    width: auto;
  }
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  pointer-events: none;
}

.hero-blob-tr {
  top: 0;
  right: 0;
  width: 384px;
  height: 384px;
  transform: translate(25%, -50%);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.hero-blob-bl {
  bottom: 0;
  left: 0;
  width: 256px;
  height: 256px;
  transform: translate(-25%, 50%);
  background: color-mix(in srgb, var(--color-secondary) 10%, transparent);
}

/* ---------- 카테고리 ---------- */
.categories {
  padding: var(--stack-lg) 0;
  background: var(--color-surface);
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 32px;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  transition: border-color 0.3s ease;
}

.category-card:hover {
  border-color: var(--color-primary);
}

.category-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  margin-bottom: 24px;
  transition: transform 0.3s ease;
}

.category-icon .material-symbols-outlined {
  font-size: 30px;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-card h3 {
  margin-bottom: 8px;
}

.category-desc {
  color: var(--color-on-surface-variant);
  margin-bottom: 24px;
}

.category-cta {
  margin-top: auto;
  display: flex;
  align-items: center;
  color: var(--color-primary);
  font-weight: 700;
}

.cta-arrow {
  margin-left: 8px;
  font-size: 18px;
}

/* ---------- 최근 리뷰 ---------- */
.reviews {
  padding: var(--stack-lg) 0;
  background: #fff;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  gap: 16px;
}

.reviews-title {
  margin-bottom: 8px;
}

.reviews-sub {
  color: var(--color-on-surface-variant);
}

.reviews-more {
  display: flex;
  align-items: center;
  color: var(--color-secondary);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.reviews-more:hover {
  color: var(--color-primary);
}

.more-icon {
  margin-left: 4px;
  font-size: 16px;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .review-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .review-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.review-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: box-shadow 0.15s ease;
}

.review-card:hover {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-secondary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-icon {
  color: var(--color-secondary);
  font-size: 16px;
}

.review-author {
  color: var(--color-on-surface-variant);
}

.review-date {
  margin-left: auto;
  color: var(--color-outline);
}

.review-title {
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-content {
  color: var(--color-on-surface-variant);
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-stars {
  margin-top: auto;
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: var(--color-outline-variant);
}

.star-on {
  color: var(--color-star);
}
</style>
