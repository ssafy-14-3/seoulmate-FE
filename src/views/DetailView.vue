<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  getLocationDetail,
  getReviewList,
  postReview,
  updateReview,
  deleteReview,
  checkReviewPassword,
} from '../../api/index.js'

const route = useRoute()
const locationId = route.params.id

// ---------- 상태 ----------
const location = ref(null)
const loadError = ref('')
const reviews = ref([])
const reviewTotal = ref(0)
const page = ref(1)
const size = 10

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
    reviews.value = data.items
    reviewTotal.value = data.total
  } catch {
    /* 목록 로드 실패 시 빈 상태 유지 */
  }
}

function changePage(p) {
  page.value = p
  fetchReviews()
}

// ---------- 리뷰 작성 ----------
function openWriteModal() {
  Object.assign(formModal, {
    open: true,
    mode: 'create',
    reviewId: null,
    title: '',
    content: '',
    rating: 5,
    password: '',
    verifiedPassword: '',
    error: '',
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
      // 수정은 verify로 사전 확인 후 수정 모달 진입
      await checkReviewPassword(passwordModal.reviewId, passwordModal.value)
      const target = reviews.value.find((r) => r.id === passwordModal.reviewId)
      Object.assign(formModal, {
        open: true,
        mode: 'edit',
        reviewId: passwordModal.reviewId,
        title: target?.title ?? '',
        content: target?.content ?? '',
        rating: target?.rating ?? 5,
        password: '',
        verifiedPassword: passwordModal.value,
        error: '',
      })
      closePasswordModal()
    }
  } catch (e) {
    passwordModal.error =
      e.code === 'PASSWORD_MISMATCH' ? '비밀번호가 일치하지 않습니다.' : e.message
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

// ---------- 유틸 ----------
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

onMounted(() => {
  fetchLocation()
  fetchReviews()
})
</script>

<template>
  <main class="page" v-if="location">
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
            <h1 class="detail-title">{{ location.name }}</h1>
            <p class="detail-desc">{{ location.description }}</p>
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

  <main v-else class="page">
    <p class="empty-text">{{ loadError || '불러오는 중…' }}</p>
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
</style>
