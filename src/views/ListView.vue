<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('전체')
const currentPage = ref(1)
const pageSize = 12

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
    },
    {
      id: 11,
      category: '축제·행사',
      name: '서울라이트 뮤직 페스티벌',
      address: '서울특별시 송파구 올림픽로 424',
      rating: 4.4,
      date: '2024.04.08',
      summary: '도심 속 야간 음악 축제',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 12,
      category: '맛집',
      name: '이태원 퓨전 음식거리',
      address: '서울특별시 용산구 이태원로 217',
      rating: 4.6,
      date: '2024.04.05',
      summary: '다양한 맛의 밤거리',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 13,
      category: '전시/미술',
      name: '국립현대미술관',
      address: '서울특별시 종로구 삼청로 30',
      rating: 4.7,
      date: '2024.03.30',
      summary: '현대 미술의 감각을 만나다',
      image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 14,
      category: '관광지',
      name: '창덕궁',
      address: '서울특별시 종로구 율곡로 99',
      rating: 4.8,
      date: '2024.03.28',
      summary: '자연과 궁궐의 조화',
      image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 15,
      category: '공원',
      name: '북서울꿈의숲',
      address: '서울특별시 강북구 월계로 173',
      rating: 4.5,
      date: '2024.03.24',
      summary: '산책과 힐링의 공간',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 16,
      category: '문화유산',
      name: '석촌호수 문화공원',
      address: '서울특별시 송파구 석촌호수로 188',
      rating: 4.4,
      date: '2024.03.20',
      summary: '호수와 문화의 공존',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 17,
      category: '쇼핑/전통',
      name: '이수재래시장',
      address: '서울특별시 동작구 이수로 123',
      rating: 4.2,
      date: '2024.03.18',
      summary: '전통시장과 로컬 먹거리',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 18,
      category: '축제·행사',
      name: '서울문화재단 야간행사',
      address: '서울특별시 중구 세종대로 110',
      rating: 4.3,
      date: '2024.03.15',
      summary: '밤을 즐기는 문화 이벤트',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 19,
      category: '랜드마크',
      name: '청계천 산책로',
      address: '서울특별시 종로구 청계천로 1',
      rating: 4.6,
      date: '2024.03.12',
      summary: '도심 속 산책과 휴식',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 20,
      category: '관광지',
      name: '덕수궁',
      address: '서울특별시 중구 세종대로 99',
      rating: 4.7,
      date: '2024.03.10',
      summary: '서울의 역사와 풍경',
      image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 21,
      category: '맛집',
      name: '망원동 맛집 스트리트',
      address: '서울특별시 마포구 망원로 1',
      rating: 4.5,
      date: '2024.03.08',
      summary: '로컬 맛집과 브런치',
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 22,
      category: '전시/미술',
      name: '서울시립미술관',
      address: '서울특별시 성동구 왕십리로 136',
      rating: 4.4,
      date: '2024.03.05',
      summary: '작품과 함께하는 여유',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 23,
      category: '공원',
      name: '월드컵공원',
      address: '서울특별시 마포구 성산동 400',
      rating: 4.8,
      date: '2024.03.02',
      summary: '넓은 공원과 산책 코스',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 24,
      category: '관광지',
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
      rating: 4.7,
      date: '2024.02.29',
      summary: '도심 속 녹지와 산책',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 25,
      category: '축제·행사',
      name: '한강 밤도깨비 야시장',
      address: '서울특별시 영등포구 여의동로 330',
      rating: 4.6,
      date: '2024.02.25',
      summary: '밤의 야시장과 먹거리',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
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
          <div v-for="place in featuredPlaces" :key="place.id" class="feature-card" @click="goDetail(place.id)">
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
