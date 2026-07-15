<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLocationList } from '../../api'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('전체')
const currentPage = ref(1)
const pageSize = 12
const useMockData = ref(true)

const places = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const errorMessage = ref('')

const categoryOptions = [
  '전체',
  '관광지',
  '맛집',
  '축제·행사',
  '문화유산',
  '공원',
  '랜드마크',
  '쇼핑/전통',
  '전시/미술',
]

const featuredPlaces = computed(() => places.value.slice(0, 3))

const mockLocations = [
  {
    id: 1,
    category: '관광지',
    name: '경복궁',
    address: '서울특별시 종로구 사직로 161',
    rating: 4.8,
    date: '2024.05.12',
    summary: '고궁의 밤을 거닐다',
    image:
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    category: '관광지',
    name: 'N서울타워',
    address: '서울특별시 용산구 남산공원길 105',
    rating: 4.5,
    date: '2024.05.10',
    summary: '서울의 야경을 한눈에',
    image:
      'https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    category: '공원',
    name: '반포한강공원',
    address: '서울특별시 서초구 신반포로11길 40',
    rating: 4.9,
    date: '2024.05.08',
    summary: '한강의 풍경과 피크닉',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    category: '쇼핑/전통',
    name: '광장시장',
    address: '서울특별시 종로구 창경궁로 88',
    rating: 4.3,
    date: '2024.05.05',
    summary: '전통시장과 길거리 음식',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    category: '전시/미술',
    name: 'DDP (동대문디자인플라자)',
    address: '서울특별시 중구 을지로 281',
    rating: 4.7,
    date: '2024.05.01',
    summary: '현대 건축과 전시 공간',
    image:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
  },
]

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

onMounted(() => {
  void loadPlaces()
})

async function loadPlaces() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (useMockData.value) {
      const filtered = mockLocations.filter((item) => {
        const matchesCategory =
          selectedCategory.value === '전체' || item.category === selectedCategory.value
        const query = searchQuery.value.trim().toLowerCase()
        const searchableText =
          `${item.name} ${item.category} ${item.address} ${item.summary}`.toLowerCase()
        const matchesSearch = !query || searchableText.includes(query)
        return matchesCategory && matchesSearch
      })

      const start = (currentPage.value - 1) * pageSize
      const pageItems = filtered.slice(start, start + pageSize)

      places.value = pageItems.map(mapLocationItem)
      totalItems.value = filtered.length
      totalPages.value = Math.max(1, Math.ceil(totalItems.value / pageSize))
      return
    }

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

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i += 1) {
    pages.push(i)
  }
  return pages
})

async function selectCategory(category) {
  selectedCategory.value = category
  currentPage.value = 1

  if (category === '전체') {
    router.replace({ path: '/list' })
  } else {
    router.replace({ path: '/list', query: { category } })
  }

  await loadPlaces()
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
        <div class="mode-toggle">
          <button
            type="button"
            class="mode-button"
            :class="{ active: useMockData }"
            @click="useMockData = true"
          >
            Fixture Mock
          </button>
          <button
            type="button"
            class="mode-button"
            :class="{ active: !useMockData }"
            @click="useMockData = false"
          >
            API
          </button>
        </div>

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
          <div class="table-wrapper">
            <p v-if="isLoading" class="table-state">목록을 불러오는 중입니다...</p>
            <p v-else-if="errorMessage" class="table-state error">{{ errorMessage }}</p>
            <p v-else-if="places.length === 0" class="table-state">표시할 장소가 없습니다.</p>
            <table v-else>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>카테고리</th>
                  <th>장소명</th>
                  <th>주소</th>
                  <th>평균별점</th>
                  <th>작성일</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="place in pagedPlaces" :key="place.id" @click="goToReview(place)">
                  <td>{{ String(place.id).padStart(2, '0') }}</td>
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
                  <td>{{ place.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>

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
.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-button {
  border: 1px solid #dbeafe;
  border-radius: 999px;
  padding: 6px 12px;
  background: #f8fbff;
  color: #475569;
  cursor: pointer;
}

.mode-button.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border-color: transparent;
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
</style>
