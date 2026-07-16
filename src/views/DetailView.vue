<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router.js'
import {
  getLocationDetail,
  getReviewList,
  postReview,
  updateReview,
  deleteReview,
  checkReviewPassword,
} from '../../api/index.js'
import StatusLottie from '@/components/StatusLottie.vue'
import { shareLocationToKakao, buildShareUrl } from '@/kakaoShare.js'

const route = useRoute()
const locationId = route.params.id

// ---------- 상태 ----------
const location = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const reviews = ref([])
const reviewTotal = ref(0)
const page = ref(1)
const size = 10

// ---- 날씨 정보 (Open-Meteo, API 키 불필요) ----
const weather = ref(null)
const weatherLoading = ref(false)
const weatherError = ref('')

const passwordModal = reactive({
  open: false,
  mode: 'edit',
  reviewId: null,
  value: '',
  error: '',
  loading: false,
})
const formModal = reactive({
  open: false,
  mode: 'create',
  reviewId: null,
  title: '',
  content: '',
  rating: 5,
  password: '',
  verifiedPassword: '',
  error: '',
  loading: false,
})

const totalPages = computed(() => Math.max(1, Math.ceil(reviewTotal.value / size)))

const distributionRows = computed(() => {
  const dist = location.value?.distribution ?? []
  const total = dist.reduce((sum, d) => sum + d.count, 0)
  return [5, 4, 3, 2, 1].map((r) => {
    const found = dist.find((d) => d.rating === r)
    const count = found?.count ?? 0
    return { rating: r, count, percent: total ? Math.round((count / total) * 100) : 0 }
  })
})

// ---------- API ----------
async function fetchLocation() {
  try {
    location.value = await getLocationDetail(locationId)
    // 장소에 위도/경도가 있으면 바로 날씨를 가져옵니다.
    if (location.value?.latitude && location.value?.longitude) {
      fetchWeather(location.value.latitude, location.value.longitude)
      return
    }
    // 위/경도가 없지만 주소가 있으면 지오코딩으로 좌표를 얻어 날씨를 가져옵니다.
    if (location.value?.address) {
      try {
        const g = await geocodeAddress(location.value.address)
        if (g) {
          fetchWeather(g.latitude, g.longitude)
        }
      } catch (e) {
        // 지오코딩 실패는 무시하고 날씨 영역에 에러 표시
        weatherError.value = '주소 기반 위치를 확인하지 못했습니다.'
      }
    }
  } catch (e) {
    loadError.value =
      e.code === 'LOCATION_NOT_FOUND'
        ? '장소를 찾을 수 없습니다.'
        : '장소 정보를 불러오지 못했습니다.'
  }
}

async function fetchReviews() {
  try {
    const data = await getReviewList(locationId, { page: page.value, size })
    reviews.value = data.items || []
    reviewTotal.value = data.total || 0
  } catch (e) {
    /* 목록 로드 실패 시 빈 상태 유지 */
  }
}

function changePage(p) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  fetchReviews()
}

/** 최초 진입/재시도 시 전체 로드 (로딩 Lottie 표시) */
async function loadPage() {
  isLoading.value = true
  loadError.value = ''
  // 위치를 먼저 가져온 뒤 리뷰와 날씨를 병렬로 로드합니다.
  await fetchLocation()
  await Promise.all([fetchReviews()])
  isLoading.value = false
}

async function fetchWeather() {
  // 함수 호출 시 좌표 전달 가능 (fetchWeather(lat, lon)).
  const latArg = arguments.length > 0 ? arguments[0] : null
  const lonArg = arguments.length > 1 ? arguments[1] : null
  const lat = latArg ?? location.value?.latitude
  const lon = lonArg ?? location.value?.longitude
  if (!lat || !lon) return
  weatherLoading.value = true
  weatherError.value = ''
  weather.value = null
  try {
    const latEnc = encodeURIComponent(lat)
    const lonEnc = encodeURIComponent(lon)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latEnc}&longitude=${lonEnc}&current_weather=true&timezone=Asia%2FSeoul`
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    // Open-Meteo의 current_weather를 그대로 저장
    weather.value = data.current_weather || null
  } catch (e) {
    weatherError.value = '날씨 정보를 불러오지 못했습니다.'
  } finally {
    weatherLoading.value = false
  }
}

async function geocodeAddress(address) {
  if (!address) return null
  try {
    const q = encodeURIComponent(address)
    // Open-Meteo geocoding API — API 키 불필요
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=ko`
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    const first = data.results && data.results.length ? data.results[0] : null
    if (!first) return null
    return { latitude: first.latitude, longitude: first.longitude }
  } catch (e) {
    return null
  }
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

function getWeatherIcon(code) {
  // Open-Meteo weathercode 매핑 (대략적인 아이콘)
  const c = Number(code)
  if (c === 0) return '☀️'
  if (c === 1 || c === 2) return '🌤️'
  if (c === 3) return '☁️'
  if (c === 45 || c === 48) return '🌫️'
  if ([51, 53, 55, 80, 81, 82].includes(c)) return '🌦️'
  if ([61, 63, 65].includes(c)) return '🌧️'
  if ([66, 67].includes(c)) return '🧊🌧️'
  if ([71, 73, 75, 85, 86].includes(c)) return '🌨️'
  if (c === 77) return '❄️'
  if (c === 95) return '⛈️'
  if (c === 96 || c === 99) return '🌩️'
  return '☁️'
}

// ---------- 리뷰 작성 ----------
function openWriteModal() {
  // 이동하여 작성 페이지에서 장소가 자동 선택되도록 쿼리 전달
  router.push({
    path: '/review/write',
    query: { location_id: String(locationId), name: location.value?.name || '' },
  })
}

// ---------- 수정/삭제: 비밀번호 확인 → 실행 ----------
function startEdit(review) {
  Object.assign(passwordModal, {
    open: true,
    mode: 'edit',
    reviewId: review.id,
    value: '',
    error: '',
  })
}
function startDelete(review) {
  Object.assign(passwordModal, {
    open: true,
    mode: 'delete',
    reviewId: review.id,
    value: '',
    error: '',
  })
}

async function confirmPassword() {
  if (!passwordModal.value) {
    passwordModal.error = '비밀번호를 입력해주세요.'
    return
  }
  // 프론트엔드에서 비밀번호 길이 검증(백엔드 제약: 4~20자)
  if (passwordModal.value.length < 4 || passwordModal.value.length > 20) {
    passwordModal.error = '비밀번호는 4~20자로 입력해주세요.'
    return
  }
  passwordModal.loading = true
  passwordModal.error = ''
  try {
    if (passwordModal.mode === 'delete') {
      // DELETE는 body의 password로 바로 검증·삭제
      await deleteReview(passwordModal.reviewId, passwordModal.value)
      closePasswordModal()
      // 마지막 페이지의 유일한 항목을 지웠으면 이전 페이지로
      if (reviews.value.length === 1 && page.value > 1) page.value -= 1
      await Promise.all([fetchReviews(), fetchLocation()])
    } else {
      // 수정은 verify로 사전 확인 후 수정 페이지로 라우팅
      const verify = await checkReviewPassword(passwordModal.reviewId, passwordModal.value)
      // 일부 백엔드가 200 + { verified: false }를 반환할 수 있으므로 검사합니다.
      if (!verify || verify.verified !== true) {
        passwordModal.error = '비밀번호가 일치하지 않습니다.'
        return
      }
      console.log('verify ok', verify)
      const target = reviews.value.find((r) => r.id === passwordModal.reviewId)
      const payload = {
        reviewId: passwordModal.reviewId,
        selectedPlace: {
          id: Number(locationId),
          name: location.value?.name,
          category: location.value?.category,
        },
        title: target?.title ?? '',
        content: target?.content ?? '',
        rating: target?.rating ?? 5,
        verifiedPassword: passwordModal.value,
      }
      try {
        sessionStorage.setItem(`review_edit_${passwordModal.reviewId}`, JSON.stringify(payload))
      } catch {}
      closePasswordModal()
      router.push(`/review/edit/${passwordModal.reviewId}`)
    }
  } catch (e) {
    // 에러는 모달 내부에만 표시합니다.
    const msg = e?.message || '오류가 발생했습니다.'
    if (e.code === 'PASSWORD_MISMATCH' || e.status === 401) {
      passwordModal.error = '비밀번호가 일치하지 않습니다.'
    } else {
      passwordModal.error = msg
    }
  } finally {
    passwordModal.loading = false
  }
}

function closePasswordModal() {
  passwordModal.open = false
  passwordModal.value = ''
  passwordModal.error = ''
}

// ---------- 작성/수정 제출 ----------
async function submitForm() {
  formModal.error = ''
  if (!formModal.title.trim()) return (formModal.error = '제목을 입력해주세요.')
  if (!formModal.content.trim()) return (formModal.error = '내용을 입력해주세요.')
  if (
    formModal.mode === 'create' &&
    (formModal.password.length < 4 || formModal.password.length > 20)
  ) {
    return (formModal.error = '비밀번호는 4~20자로 입력해주세요.')
  }

  formModal.loading = true
  try {
    if (formModal.mode === 'create') {
      await postReview(locationId, {
        title: formModal.title.trim(),
        content: formModal.content.trim(),
        rating: formModal.rating,
        password: formModal.password,
      })
      page.value = 1
    } else {
      await updateReview(formModal.reviewId, {
        title: formModal.title.trim(),
        content: formModal.content.trim(),
        rating: formModal.rating,
        password: formModal.verifiedPassword,
      })
    }
    closeFormModal()
    await Promise.all([fetchReviews(), fetchLocation()])
  } catch (e) {
    formModal.error = e.message
  } finally {
    formModal.loading = false
  }
}

function closeFormModal() {
  formModal.open = false
  formModal.error = ''
}

// ---------- 공유 ----------
const copied = ref(false)

function shareKakao() {
  try {
    shareLocationToKakao(location.value)
  } catch (e) {
    alert(e.message)
  }
}

async function copyLink() {
  try {
    // 카카오 공유와 동일하게 배포 주소 기준 링크 복사 (로컬에서도 localhost가 아닌 서비스 링크)
    await navigator.clipboard.writeText(buildShareUrl())
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    alert('링크 복사에 실패했습니다.')
  }
}

// ---------- 유틸 ----------
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

onMounted(loadPage)
</script>

<template>
  <!-- 로딩 중 -->
  <StatusLottie v-if="isLoading" type="loading" message="지역 정보를 불러오는 중이에요" />

  <!-- 로드 실패 -->
  <StatusLottie
    v-else-if="loadError || !location"
    type="error"
    :message="loadError || '데이터를 불러오지 못했습니다.'"
    @retry="loadPage"
  />

  <!-- 정상 -->
  <main v-else class="page">
    <!-- ===== 장소 상세 (헤더 카드) ===== -->
    <section class="detail-card">
      <div class="detail-layout">
        <!-- 대표 이미지 -->
        <div class="detail-image">
          <img v-if="location.image_url" :src="location.image_url" :alt="location.name" />
          <div v-else class="image-placeholder">이미지 없음</div>
        </div>

        <!-- 헤더 정보 -->
        <div class="detail-info">
          <div>
            <div class="detail-meta">
              <span class="chip">#{{ location.category }}</span>
              <span v-if="location.address" class="meta-address">
                <svg class="icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
                  />
                </svg>
                {{ location.address }}
              </span>
            </div>
            <div class="title-row">
              <h1 class="detail-title">{{ location.name }}</h1>
              <div class="share-actions">
                <button class="btn btn-kakao" @click="shareKakao" aria-label="카카오톡으로 공유">
                  카카오 공유
                </button>
                <button class="btn btn-ghost" @click="copyLink" aria-label="링크 복사">
                  {{ copied ? '복사됨 ✓' : '링크 복사' }}
                </button>
              </div>
            </div>
            <p class="detail-desc">{{ location.description }}</p>
          
            <!-- 날씨 정보 -->
            <div class="weather-wrapper">
              <div class="weather-box" v-if="weather">
                <div class="weather-main">
                  <div class="weather-icon" :title="weather.weathercode">
                    {{ getWeatherIcon(weather.weathercode) }}
                  </div>
                  <div class="weather-info">
                    <div class="weather-temp">{{ weather.temperature }}°C</div>
                    <div class="weather-desc">풍속 {{ weather.windspeed }} m/s · 방향 {{ weather.winddirection }}°</div>
                  </div>
                </div>
                <div class="weather-meta">갱신: {{ formatDateTime(weather.time) }}</div>
              </div>

              <div
                v-else-if="weatherLoading || (!weather && !weatherError)"
                class="weather-skeleton"
                aria-hidden="true"
              >
                <div class="skeleton-icon-col">
                  <div class="skeleton-icon shimmer"></div>
                  <div class="skeleton-line skeleton-line-meta shimmer meta-under-icon"></div>
                </div>
                <div class="skeleton-lines">
                  <div class="skeleton-line skeleton-line-lg shimmer"></div>
                  <div class="skeleton-line skeleton-line-sm shimmer"></div>
                </div>
              </div>

              <p v-if="weatherError" class="weather-error">{{ weatherError }}</p>
            </div>
          </div>

          <!-- 평점 요약 + 분포 -->
          <div class="rating-summary">
            <div class="rating-score">
              <div class="score-number">{{ location.avg_rating?.toFixed(1) ?? '0.0' }}</div>
              <div class="stars" aria-hidden="true">
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="['star', { filled: n <= Math.round(location.avg_rating || 0) }]"
                  >★</span
                >
              </div>
              <div class="score-count">총 {{ location.review_count }}개의 리뷰</div>
            </div>
            <div class="rating-bars">
              <div v-for="row in distributionRows" :key="row.rating" class="bar-row">
                <span class="bar-label">{{ row.rating }}점</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: row.percent + '%' }"></div>
                </div>
                <span class="bar-count">{{ row.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 리뷰 목록 ===== -->
    <section class="review-section">
      <div class="review-header">
        <h2 class="section-title">
          방문자 리뷰 <span class="accent">{{ reviewTotal }}</span>
        </h2>
        <button class="btn btn-primary" @click="openWriteModal">✎ 리뷰 작성</button>
      </div>

      <p v-if="reviews.length === 0" class="empty-text">
        아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요.
      </p>

      <div class="review-grid">
        <article v-for="review in reviews" :key="review.id" class="review-card">
          <div>
            <div class="review-top">
              <div class="review-author">
                <div class="avatar">익</div>
                <div>
                  <div class="review-title">{{ review.title }}</div>
                  <div class="review-date">
                    {{ formatDate(review.created_at) }}
                    <span v-if="review.updated_at"> (수정됨)</span>
                  </div>
                </div>
              </div>
              <div class="stars small" aria-label="`별점 ${review.rating}점`">
                <span v-for="n in 5" :key="n" :class="['star', { filled: n <= review.rating }]"
                  >★</span
                >
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
          <div class="review-actions">
            <button class="btn btn-ghost" @click="startEdit(review)">수정</button>
            <button class="btn btn-ghost danger" @click="startDelete(review)">삭제</button>
          </div>
        </article>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">&lt;</button>
        <button
          v-for="p in totalPages"
          :key="p"
          :class="['page-btn', { active: p === page }]"
          @click="changePage(p)"
        >
          {{ p }}
        </button>
        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">
          &gt;
        </button>
      </div>
    </section>

    <!-- ===== 비밀번호 확인 모달 (수정/삭제 진입) ===== -->
    <div v-if="passwordModal.open" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal">
        <div class="modal-header">
          <h3>비밀번호 확인</h3>
          <button class="modal-close" @click="closePasswordModal">✕</button>
        </div>
        <p class="modal-desc">
          리뷰를 {{ passwordModal.mode === 'delete' ? '삭제' : '수정' }}하려면 작성 시 설정한
          비밀번호를 입력해주세요.
        </p>
        <input
          v-model="passwordModal.value"
          type="password"
          class="input"
          placeholder="비밀번호"
          @keyup.enter="confirmPassword"
        />
        <p v-if="passwordModal.error" class="error-text">{{ passwordModal.error }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closePasswordModal">취소</button>
          <button
            class="btn btn-primary"
            :disabled="passwordModal.loading"
            @click="confirmPassword"
          >
            {{ passwordModal.loading ? '확인 중…' : '확인' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 리뷰 작성/수정 모달 ===== -->
    <div v-if="formModal.open" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ formModal.mode === 'edit' ? '리뷰 수정' : '리뷰 작성' }}</h3>
          <button class="modal-close" @click="closeFormModal">✕</button>
        </div>

        <label class="field-label">별점</label>
        <div class="stars pick">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            :class="['star', { filled: n <= formModal.rating }]"
            @click="formModal.rating = n"
          >
            ★
          </button>
        </div>

        <label class="field-label" for="review-title">제목</label>
        <input
          id="review-title"
          v-model="formModal.title"
          class="input"
          maxlength="100"
          placeholder="제목 (1~100자)"
        />

        <label class="field-label" for="review-content">내용</label>
        <textarea
          id="review-content"
          v-model="formModal.content"
          class="input textarea"
          maxlength="2000"
          placeholder="내용 (1~2000자)"
        ></textarea>

        <template v-if="formModal.mode === 'create'">
          <label class="field-label" for="review-password">수정용 비밀번호</label>
          <input
            id="review-password"
            v-model="formModal.password"
            type="password"
            class="input"
            minlength="4"
            maxlength="20"
            placeholder="4~20자 (수정·삭제 시 사용)"
          />
        </template>

        <p v-if="formModal.error" class="error-text">{{ formModal.error }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeFormModal">취소</button>
          <button class="btn btn-primary" :disabled="formModal.loading" @click="submitForm">
            {{ formModal.loading ? '저장 중…' : formModal.mode === 'edit' ? '수정 완료' : '등록' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ===== 디자인 토큰 (시안 기준) ===== */
.page {
  --primary: #004ac6;
  --primary-container: #2563eb;
  --secondary: #505f76;
  --secondary-container: #d0e1fb;
  --on-secondary-container: #54647a;
  --surface: #f8f9fa;
  --surface-lowest: #ffffff;
  --surface-container: #edeeef;
  --surface-variant: #e1e3e4;
  --on-surface: #191c1d;
  --on-surface-variant: #434655;
  --outline: #737686;
  --outline-variant: #c3c6d7;
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --amber: #fbbf24;

  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  color: var(--on-surface);
  font-size: 16px;
  line-height: 1.5;
}

/* ===== 상세 카드 ===== */
.detail-card {
  background: var(--surface-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  padding: 32px;
}
.detail-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
@media (min-width: 768px) {
  .detail-layout {
    flex-direction: row;
  }
}

.detail-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  background: var(--surface-container);
  overflow: hidden;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .detail-image {
    width: 33%;
  }
}
.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--outline);
  font-size: 13px;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.chip {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.meta-address {
  color: var(--secondary);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.icon {
  width: 16px;
  height: 16px;
}

/* ===== 공유 버튼 ===== */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.share-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
/* 공유 영역 버튼은 알약형으로 통일 (리뷰 카드의 .btn-ghost에는 영향 없음) */
.share-actions .btn {
  border-radius: 999px;
}
.btn-kakao {
  background: #fee500; /* 카카오 브랜드 컬러 (버튼 가이드) */
  color: #191919;
  padding: 4px 12px;
}
.btn-kakao:hover {
  opacity: 0.85;
}

.detail-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
}
.detail-desc {
  color: var(--on-surface-variant);
  margin: 0;
}

/* ===== 평점 요약 ===== */
.rating-summary {
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-top: 1px solid var(--outline-variant);
  padding-top: 16px;
  margin-top: 16px;
}
@media (min-width: 768px) {
  .rating-summary {
    flex-direction: row;
    align-items: flex-start;
  }
}

.rating-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.score-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}
.score-count {
  color: var(--outline);
  font-size: 13px;
}

.stars {
  display: flex;
  margin: 8px 0;
}
.star {
  color: var(--surface-variant);
  font-size: 20px;
  line-height: 1;
}
.star.filled {
  color: var(--amber);
}
.stars.small .star {
  font-size: 16px;
}
.stars.pick .star {
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
}

.rating-bars {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-label {
  font-size: 13px;
  color: var(--on-surface-variant);
  width: 28px;
  flex-shrink: 0;
}
.bar-track {
  flex: 1;
  height: 8px;
  background: var(--surface-container);
  border-radius: 12px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--primary-container);
}
.bar-count {
  font-size: 13px;
  color: var(--outline);
  width: 32px;
  text-align: right;
}

/* ===== 리뷰 섹션 ===== */
.review-section {
  margin-top: 32px;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.accent {
  color: var(--primary);
  font-weight: 700;
}
.empty-text {
  color: var(--outline);
  text-align: center;
  padding: 32px 0;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .review-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.review-card {
  background: var(--surface-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}
.review-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.review-author {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.review-title {
  font-weight: 700;
  font-size: 14px;
}
.review-date {
  color: var(--outline);
  font-size: 12px;
}
.review-content {
  color: var(--on-surface-variant);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--outline-variant);
  padding-top: 12px;
}

/* ===== 버튼 ===== */
.btn {
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  border-radius: 4px;
  padding: 8px 16px;
  transition:
    opacity 0.15s,
    background 0.15s;
}
.btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.btn-primary {
  background: var(--primary);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-secondary {
  background: var(--surface-variant);
  color: var(--on-surface-variant);
}
.btn-secondary:hover {
  background: var(--outline-variant);
}
.btn-ghost {
  background: var(--surface-variant);
  color: var(--on-surface-variant);
  padding: 4px 12px;
  border-radius: 12px;
}
.btn-ghost:hover {
  background: var(--outline-variant);
}
.btn-ghost.danger:hover {
  background: var(--error-container);
  color: var(--error);
}

/* ===== 페이지네이션 ===== */
.pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
}
.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--outline-variant);
  border-radius: 4px;
  background: var(--surface-lowest);
  color: var(--on-surface-variant);
  cursor: pointer;
  font-size: 13px;
}
.page-btn.active {
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 700;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ===== 모달 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal {
  background: var(--surface-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  color: var(--outline);
  cursor: pointer;
  font-size: 16px;
}
.modal-close:hover {
  color: var(--on-surface);
}
.modal-desc {
  color: var(--on-surface-variant);
  margin: 0 0 16px;
}
.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
.modal-actions .btn {
  flex: 1;
  padding: 12px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--on-surface-variant);
  margin: 12px 0 4px;
}
.input {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--outline-variant);
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--on-surface);
}
.input:focus {
  outline: none;
  border-color: var(--primary);
}
.input::placeholder {
  color: var(--outline);
}
.textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.error-text {
  color: var(--error);
  font-size: 13px;
  margin: 8px 0 0;
}

/* ===== 날씨 카드 ===== */
.weather-box {
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #f3f7ff, #ffffff);
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.weather-wrapper {
  margin-top: 12px;
  min-height: 88px;
}
.weather-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.weather-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  flex-shrink: 0;
}
.weather-info {
  display: flex;
  flex-direction: column;
}
.weather-temp {
  font-size: 20px;
  font-weight: 700;
}
.weather-desc {
  color: var(--on-surface-variant);
  font-size: 13px;
}
.weather-meta {
  color: var(--outline);
  font-size: 12px;
}
.weather-loading,
.weather-error {
  margin-top: 8px;
  color: var(--outline);
  font-size: 13px;
}

/* ===== 스켈레톤 (shimmer) ===== */
.weather-skeleton {
  margin-top: 12px;
  /* match .weather-box visual */
  padding: 12px 16px;
  background: linear-gradient(90deg, #f3f7ff, #ffffff);
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-sizing: border-box;
}
/* ensure skeleton vertical size matches real card */
.weather-skeleton {
  min-height: 88px;
  padding-top: 14px;
  padding-bottom: 14px;
}
.skeleton-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #e9edf6;
  flex-shrink: 0;
}
.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: #eceff6;
}
.skeleton-line-lg {
  width: 48%;
  height: 18px;
}
.skeleton-line-sm {
  width: 36%;
  height: 14px;
}
.skeleton-line-meta {
  width: 28%;
  height: 12px;
  border-radius: 6px;
}

.skeleton-icon-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 56px;
  flex-shrink: 0;
}
.meta-under-icon {
  width: 36px;
  height: 12px;
}
.shimmer {
  background: linear-gradient(90deg, #eceff6 0%, #f7f9ff 50%, #eceff6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
