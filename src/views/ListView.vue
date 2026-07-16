<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLocationList } from '../../api'
import StatusLottie from '@/components/StatusLottie.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('전체')
const currentPage = ref(1)
const pageSize = 12

const places = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const errorMessage = ref('')

const categoryOptions = [
  '전체',
  '관광지',
  '문화시설',
  '축제공연행사',
  '여행코스',
  '레포츠',
  '숙박',
  '쇼핑',
]

const featuredPlaces = computed(() => places.value.slice(0, 3))

function mapLocationItem(item) {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    address: item.address,
    rating: Number(item.avg_rating ?? item.rating ?? 0),
    date: item.created_at
      ? new Date(item.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : item.date || '',
    summary: item.description ?? item.summary ?? '',
    image:
      item.image_url ||
      item.image ||
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  }
}

watch(
  () => route.query.category,
  (category) => {
    selectedCategory.value = category || '전체'
    currentPage.value = 1
    void loadPlaces()
  },
  { immediate: true },
)

watch(searchQuery, () => {
  currentPage.value = 1
})

async function loadPlaces() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 필터링·검색·페이지네이션은 전부 서버(API)가 처리
    // category 미전달 시 전체 조회, 전달 시 해당 카테고리만 응답
    const response = await getLocationList({
      category: selectedCategory.value === '전체' ? undefined : selectedCategory.value,
      q: searchQuery.value.trim() || undefined,
      page: currentPage.value,
      size: pageSize,
    })

    places.value = (response?.items || []).map(mapLocationItem)
    totalItems.value = Number(response?.total || places.value.length || 0)
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / pageSize))
  } catch (error) {
    places.value = []
    totalItems.value = 0
    totalPages.value = 1
    errorMessage.value = error?.message || '목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const pagedPlaces = computed(() => places.value)

// 필터링·페이지네이션이 반영된 목록상의 순번 (1부터 시작)
function rowNumber(index) {
  return String((currentPage.value - 1) * pageSize + index + 1).padStart(2, '0')
}

const PAGE_BLOCK = 10

// 현재 페이지가 속한 10개 블록만 표시 (1~10, 11~20, ...)
const pageNumbers = computed(() => {
  const start = Math.floor((currentPage.value - 1) / PAGE_BLOCK) * PAGE_BLOCK + 1
  const end = Math.min(start + PAGE_BLOCK - 1, totalPages.value)
  const pages = []
  for (let i = start; i <= end; i += 1) {
    pages.push(i)
  }
  return pages
})

function selectCategory(category) {
  if (selectedCategory.value === category) return // 동일 카테고리 재클릭 무시

  // 쿼리 변경 → route.query.category watch가 상태 갱신 + loadPlaces 수행
  if (category === '전체') {
    router.replace({ path: '/list' })
  } else {
    router.replace({ path: '/list', query: { category } })
  }
}

function onSearch() {
  currentPage.value = 1
  void loadPlaces()
}

function goDetail(id) {
  router.push(`/detail/${id}`)
}

function goToReview(place) {
  router.push({
    path: '/review/write',
    query: {
      locationId: String(place.id),
    },
  })
}

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  void loadPlaces()
}
</script>

<template>
  <section class="list-page">
    <div class="container list-shell">
      <div class="search-panel">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="장소, 주소, 카테고리로 검색"
            @keyup.enter="onSearch"
          />
          <button type="button" class="search-button" @click="onSearch">검색</button>
        </div>

        <div class="chip-row">
          <button
            v-for="category in categoryOptions"
            :key="category"
            type="button"
            class="chip"
            :class="{ active: selectedCategory === category }"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="content-grid">
        <aside class="feature-panel">
          <div
            v-for="place in featuredPlaces"
            :key="place.id"
            class="feature-card"
            @click="goDetail(place.id)"
          >
            <div class="feature-card-overlay">
              <p class="feature-card-tag">이달의 추천</p>
              <h4 class="feature-card-title">{{ place.name }}</h4>
              <p class="feature-card-summary">{{ place.summary }}</p>
            </div>
            <img :src="place.image" :alt="place.name" class="feature-card-image" />
          </div>
        </aside>
        <div class="table-panel">
          <StatusLottie v-if="isLoading" type="loading" message="목록을 불러오는 중입니다..." />
          <p v-else-if="errorMessage" class="table-state error">{{ errorMessage }}</p>
          <p v-else-if="places.length === 0" class="table-state">표시할 장소가 없습니다.</p>

          <template v-else>
            <div class="table-wrapper pc-only">
              <table>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>카테고리</th>
                    <th>장소명</th>
                    <th>주소</th>
                    <th>평균별점</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(place, index) in pagedPlaces"
                    :key="place.id"
                    @click="goDetail(place.id)"
                  >
                    <td>{{ rowNumber(index) }}</td>
                    <td>
                      <span class="pill">{{ place.category }}</span>
                    </td>
                    <td class="name-cell">{{ place.name }}</td>
                    <td>{{ place.address }}</td>
                    <td>
                      <span class="rating">
                        <span class="material-symbols-outlined">star</span>
                        {{ place.rating.toFixed(1) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="list-cards mobile-only">
              <article
                v-for="(place, index) in pagedPlaces"
                :key="place.id"
                class="list-card"
                @click="goDetail(place.id)"
              >
                <div class="card-left">
                  <div class="card-number">{{ rowNumber(index) }}</div>
                </div>
                <div class="card-main">
                  <span class="pill small">{{ place.category }}</span>
                  <div class="card-title">{{ place.name }}</div>
                  <div class="card-address">{{ place.address }}</div>
                </div>
                <div class="card-right">
                  <div class="card-rating">
                    <span class="material-symbols-outlined">star</span>
                    {{ place.rating.toFixed(1) }}
                  </div>
                </div>
              </article>
            </div>
          </template>

          <div class="pagination">
            <button type="button" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              type="button"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="goPage(currentPage + 1)"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list-page {
  padding: 24px 0 40px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 28%),
    linear-gradient(135deg, #f7f9ff 0%, #eef4ff 48%, #fdfdff 100%);
}

.list-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  padding: 24px 26px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(37, 99, 235, 0.14);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.08);
  backdrop-filter: blur(12px);
}

.hero-copy {
  flex: 1;
}

.eyebrow {
  margin-bottom: 8px;
  color: #2563eb;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.list-description {
  margin-top: 8px;
  color: #4b5563;
  max-width: 640px;
}

.hero-stat {
  min-width: 140px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  text-align: center;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
}

.hero-stat-value {
  display: block;
  font-size: 1.7rem;
  font-weight: 800;
}

.hero-stat-label {
  font-size: 0.9rem;
  opacity: 0.92;
}

.search-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f8fbff;
  border: 1px solid #dbeafe;
}
.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  color: #111827;
}

.search-icon {
  color: #64748b;
}

.search-button {
  border: 0;
  border-radius: 999px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid #dbeafe;
  border-radius: 999px;
  padding: 6px 12px;
  background: #f8fbff;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.content-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: minmax(250px, 300px) 1fr;
  }
}

.table-panel {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
}

.feature-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
}

.panel-title-row,
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.table-sub {
  color: #64748b;
}

.table-count {
  color: #2563eb;
  font-weight: 700;
}

.feature-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  height: 256px;
  border: 1px solid #c3c6d7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-card:hover {
  opacity: 0.9;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.feature-card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  z-index: 1;
}

.feature-card:hover .feature-card-image {
  transform: scale(1.05);
}

.feature-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.feature-card-tag {
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  opacity: 0.9;
}

.feature-card-title {
  color: #ffffff;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature-card-summary {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin: 0;
}

.table-panel {
  padding: 0;
}

.table-wrapper {
  overflow-x: auto;
  padding: 18px 18px 0;
  border-radius: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table-state {
  padding: 24px 0;
  color: #64748b;
  text-align: center;
}

.table-state.error {
  color: #b91c1c;
}

th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: middle;
}

th {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
}

tbody tr {
  cursor: pointer;
  transition: background-color 0.16s ease;
}

tbody tr:hover {
  background: #f8fbff;
}

.name-cell {
  font-weight: 700;
  color: #111827;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  color: #1d4ed8;
  font-size: 0.82rem;
  white-space: nowrap;
  line-height: 1.2;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  font-weight: 700;
}

.rating .material-symbols-outlined {
  color: #f59e0b;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 18px;
  margin-top: 0;
  flex-wrap: wrap;
}

.pagination button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 0;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
  background: #f8fbff;
  color: #334155;
  cursor: pointer;
  font: inherit;
  line-height: 1;
}

.pagination .page-number {
  width: auto;
  min-width: 40px;
  padding: 0 12px;
}

.pagination .material-symbols-outlined {
  font-size: 20px;
}

.pagination button.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .search-box {
    padding: 8px;
    gap: 8px;
  }
  .search-box input {
    min-width: 0;
    font-size: 14px;
  }
  .search-button {
    padding: 6px 10px;
    font-size: 14px;
  }
  .search-icon { display: none; }
}

/* ===== 모바일 <-> PC 분기 필터 ===== */
.mobile-only {
  display: none !important;
}

@media (max-width: 767px) {
  .pc-only {
    display: none !important;
  }
  .mobile-only {
    display: flex !important;
  }
}

/* ===== 모바일 카드 목록 레이아웃 ===== */
.list-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(37, 99, 235, 0.08);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.list-card:active {
  transform: scale(0.98);
}

.card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-right: 14px;
  flex-shrink: 0;
}

.card-number {
  font-size: 0.85rem;
  font-weight: 800;
  color: #2563eb;
}

.pill.small {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.card-main {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.card-main .pill.small {
  display: inline-block;
  margin-bottom: 6px;
}

.card-title {
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
  margin-bottom: 4px;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.card-address {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.card-right {
  flex-shrink: 0;
}

.card-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  color: #2563eb;
  font-size: 0.9rem;
}

.card-rating .material-symbols-outlined {
  color: #f59e0b;
  font-size: 18px;
}
</style>
