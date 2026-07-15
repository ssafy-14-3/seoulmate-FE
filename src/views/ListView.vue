<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('전체')
const currentPage = ref(1)
const pageSize = 8

const places = ref([])

const categoryOptions = [
  '전체',
  '관광지',
  '맛집',
  '축제·행사',
  '문화유산',
  '공원',
  '랜드마크',
  '쇼핑/전통',
  '전시/미술'
]

const featuredPlaces = computed(() => places.value.slice(0, 3))

watch(
  () => route.query.category,
  (category) => {
    selectedCategory.value = category || '전체'
    currentPage.value = 1
  },
  { immediate: true }
)

watch([searchQuery], () => {
  currentPage.value = 1
})

onMounted(async () => {
  await loadPlaces()
})

async function loadPlaces() {
  places.value = [
    {
      id: 1,
      category: '관광지',
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
      rating: 4.8,
      date: '2024.05.12',
      summary: '고궁의 밤을 거닐다',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 2,
      category: '관광지',
      name: 'N서울타워',
      address: '서울특별시 용산구 남산공원길 105',
      rating: 4.5,
      date: '2024.05.10',
      summary: '서울의 야경을 한눈에',
      image: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 3,
      category: '공원',
      name: '반포한강공원',
      address: '서울특별시 서초구 신반포로11길 40',
      rating: 4.9,
      date: '2024.05.08',
      summary: '한강의 풍경과 피크닉',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 4,
      category: '쇼핑/전통',
      name: '광장시장',
      address: '서울특별시 종로구 창경궁로 88',
      rating: 4.3,
      date: '2024.05.05',
      summary: '전통시장과 길거리 음식',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 5,
      category: '전시/미술',
      name: 'DDP (동대문디자인플라자)',
      address: '서울특별시 중구 을지로 281',
      rating: 4.7,
      date: '2024.05.01',
      summary: '현대 건축과 전시 공간',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 6,
      category: '문화유산',
      name: '남산골 한옥마을',
      address: '서울특별시 중구 퇴계로34길 28',
      rating: 4.6,
      date: '2024.04.28',
      summary: '한옥과 서울의 역사',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 7,
      category: '랜드마크',
      name: '코엑스 별마당 도서관',
      address: '서울특별시 강남구 영동대로 513',
      rating: 4.9,
      date: '2024.04.25',
      summary: '도서관과 예술의 조화',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 8,
      category: '맛집',
      name: '성수동 카페거리',
      address: '서울특별시 성동구 성수동2가',
      rating: 4.8,
      date: '2024.04.20',
      summary: '감성 가득한 로컬 카페',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 9,
      category: '랜드마크',
      name: '홍대 걷고싶은거리',
      address: '서울특별시 마포구 어울마당로',
      rating: 4.5,
      date: '2024.04.15',
      summary: '활기찬 거리와 문화',
      image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 10,
      category: '공원',
      name: '여의도 한강공원',
      address: '서울특별시 영등포구 여의동로 330',
      rating: 4.7,
      date: '2024.04.10',
      summary: '도심 속 자연 휴식',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
    }
  ]
}

const filteredPlaces = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return places.value.filter((item) => {
    const matchesCategory = selectedCategory.value === '전체' || item.category === selectedCategory.value
    const searchableText = `${item.name} ${item.category} ${item.address} ${item.summary}`.toLowerCase()
    const matchesSearch = !query || searchableText.includes(query)

    return matchesCategory && matchesSearch
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPlaces.value.length / pageSize)))

const pagedPlaces = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPlaces.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i += 1) {
    pages.push(i)
  }
  return pages
})

function selectCategory(category) {
  selectedCategory.value = category
  currentPage.value = 1

  if (category === '전체') {
    router.replace({ path: '/list' })
  } else {
    router.replace({ path: '/list', query: { category } })
  }
}

function onSearch() {
  currentPage.value = 1
}

function goDetail(id) {
  router.push(`/detail/${id}`)
}

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
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
          <div class="panel-title-row">
            <h2 class="headline-md">이달의 추천</h2>
          </div>

          <div v-for="place in featuredPlaces" :key="place.id" class="feature-card">
            <img :src="place.image" :alt="place.name" />
            <div class="feature-card-body">
              <p class="label-sm feature-tag">{{ place.category }}</p>
              <h3 class="headline-md">{{ place.name }}</h3>
              <p class="body-md">{{ place.summary }}</p>
            </div>
          </div>
        </aside>

        <div class="table-panel">
          <div class="table-wrapper">
            <table>
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
                <tr v-for="place in pagedPlaces" :key="place.id" @click="goDetail(place.id)">
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
            <button type="button" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
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

.feature-panel,
.table-panel {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
}

.feature-panel {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.feature-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.feature-card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-tag {
  color: #2563eb;
  font-weight: 700;
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
  padding: 4px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  color: #1d4ed8;
  font-size: 0.82rem;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  font-weight: 700;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 18px;
  margin-top: 0;
}

.pagination button {
  border: 0;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  background: #f8fbff;
  color: #334155;
  cursor: pointer;
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
