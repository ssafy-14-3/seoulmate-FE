<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router.js'
import { getLocationList, postReview, getLocationDetail, updateReview } from '../../../api'

const props = defineProps({
  initialReview: { type: Object, default: null }
})

const searchQuery = ref('')
const selectedPlace = ref(props.initialReview?.selectedPlace ?? null)

const useMockData = ref(true)
const locations = ref([])
const locLoading = ref(false)
const locError = ref('')
const hasSearched = ref(false)

const mockLocations = [
  { id: 1, name: '경복궁', category: '관광지', address: '서울특별시 종로구 사직로 161', image_url: '', avg_rating: 4.5, review_count: 12 },
  { id: 2, name: '성수동 골목 카페', category: '맛집', address: '서울특별시 성동구 성수동', image_url: '', avg_rating: 4.1, review_count: 8 },
  { id: 3, name: '반포 한강공원', category: '공원', address: '서울특별시 서초구', image_url: '', avg_rating: 4.7, review_count: 20 },
  { id: 4, name: '광장시장', category: '쇼핑/전통', address: '서울특별시 종로구', image_url: '', avg_rating: 4.0, review_count: 5 },
]

async function fetchLocations() {
  const q = searchQuery.value.trim()
  if (!q) {
    locations.value = []
    return
  }

  locLoading.value = true
  locError.value = ''

  try {
    if (useMockData.value) {
      const filtered = mockLocations.filter((it) => `${it.name} ${it.category} ${it.address}`.toLowerCase().includes(q.toLowerCase()))
      locations.value = filtered.slice(0, 10)
    } else {
      const resp = await getLocationList({ q, page: 1, size: 10 })
      locations.value = (resp?.items || []).map((it) => ({
        id: it.id,
        name: it.name,
        category: it.category,
        address: it.address,
        image_url: it.image_url,
        avg_rating: it.avg_rating,
        review_count: it.review_count,
      }))
    }
  } catch (e) {
    locError.value = e?.message || '검색 중 오류가 발생했습니다.'
    locations.value = []
  } finally {
    locLoading.value = false
  }
}

const title = ref(props.initialReview?.title ?? '')
const rating = ref(props.initialReview?.rating ?? '5')
const content = ref(props.initialReview?.content ?? '')
const password = ref(props.initialReview?.password ?? '')
const isEditMode = computed(() => !!(props.initialReview && props.initialReview.reviewId))
const isSubmitting = ref(false)

watch(() => props.initialReview, (v) => {
  if (!v) return
  selectedPlace.value = v.selectedPlace ?? selectedPlace.value
  title.value = v.title ?? ''
  rating.value = v.rating ?? '5'
  content.value = v.content ?? ''
  password.value = v.password ?? ''
})

const route = useRoute()

onMounted(async () => {
  const q = route.query
  if (q?.location_id) {
    const id = Number(q.location_id)
    // try to set name from query first, otherwise fetch detail
    const name = q.name || ''
    if (name) {
      selectedPlace.value = { id, name }
    } else {
      try {
        const detail = await getLocationDetail(id)
        selectedPlace.value = { id: detail.id, name: detail.name, category: detail.category }
      } catch (e) {
        // ignore
      }
    }
    useMockData.value = false
  }
})

function searchPlace() {
  if (!searchQuery.value.trim()) {
    alert('검색어를 입력해 주세요.')
    return
  }
  hasSearched.value = true
  void fetchLocations()
}

function selectLocation(item) {
  selectedPlace.value = { id: item.id, name: item.name, category: item.category, address: item.address }
  locations.value = []
  searchQuery.value = ''
  hasSearched.value = false
}

function clearSelectedPlace() {
  selectedPlace.value = null
  hasSearched.value = false
}

function handleCancel() {
  router.back()
}

async function handleSubmit() {
  if (!selectedPlace.value) {
    alert('리뷰를 작성할 장소를 선택해 주세요.')
    return
  }
  if (!title.value.trim()) {
    alert('리뷰 제목을 입력해 주세요.')
    return
  }
  if (!content.value.trim()) {
    alert('리뷰 내용을 입력해 주세요.')
    return
  }
  if (!password.value.trim()) {
    alert('수정용 비밀번호를 입력해 주세요.')
    return
  }

  try {
    isSubmitting.value = true
    if (useMockData.value) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      alert(isEditMode.value ? '리뷰가 성공적으로 수정되었습니다. (모드: Mock)' : '리뷰가 성공적으로 등록되었습니다. (모드: Mock)')
      // on edit, clear session storage
      if (isEditMode.value) {
        try { sessionStorage.removeItem(`review_edit_${props.initialReview.reviewId}`) } catch {}
      }
      router.push(`/detail/${selectedPlace.value.id}`)
      return
    }
    const payload = {
      title: title.value,
      content: content.value,
      rating: parseInt(rating.value, 10),
    }

    if (isEditMode.value) {
      const reviewId = props.initialReview.reviewId
      const pw = props.initialReview.verifiedPassword || password.value
      await updateReview(reviewId, { ...payload, password: pw })
      try { sessionStorage.removeItem(`review_edit_${reviewId}`) } catch {}
      alert('리뷰가 성공적으로 수정되었습니다.')
      router.push(`/detail/${selectedPlace.value.id}`)
      return
    }

    // create
    await postReview(selectedPlace.value.id, { ...payload, password: password.value })
    alert('리뷰가 성공적으로 등록되었습니다.')
    router.push(`/detail/${selectedPlace.value.id}`)
  } catch (error) {
    console.error(error)
    alert('리뷰 등록 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="review-write-section">
    <div class="container container-sm">
      <div class="page-header">
        <h2 class="headline-lg">{{ isEditMode ? '리뷰 수정하기' : '리뷰 작성하기' }}</h2>
        <p class="body-md text-sub">서울에서의 특별한 경험을 공유해 주세요.</p>
      </div>

      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="label-sm form-label">장소 선택</label>
            <div class="search-box">
              <span class="material-symbols-outlined search-icon">search</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="리뷰를 작성할 장소를 검색해 주세요"
                @keyup.enter="searchPlace"
              />
              <button type="button" class="search-button" @click="searchPlace">검색</button>
            </div>

            <div class="mode-toggle" style="margin-top:8px; display:flex; gap:8px">
              <button type="button" class="mode-button" :class="{ active: useMockData }" @click="useMockData = true">Fixture Mock</button>
              <button type="button" class="mode-button" :class="{ active: !useMockData }" @click="useMockData = false">API</button>
            </div>

            <div class="location-results" style="margin-top:8px">
              <div v-if="locLoading" class="label-sm">검색 중...</div>
              <div v-else>
                <div v-if="locError" class="label-sm" style="color: #dc2626">{{ locError }}</div>
                <ul v-if="locations.length" class="location-list">
                  <li v-for="item in locations" :key="item.id" class="location-item">
                    <div class="loc-main" @click="selectLocation(item)">
                      <div class="loc-title body-md">{{ item.name }}</div>
                      <div class="label-sm text-sub">{{ item.category }} · {{ item.address }}</div>
                    </div>
                    <button class="btn btn-outline" type="button" @click.prevent="selectLocation(item)">선택</button>
                  </li>
                </ul>
                <div v-else-if="hasSearched && !locations.length && !selectedPlace" class="label-sm text-sub">검색 결과가 없습니다.</div>
              </div>
            </div>

            <div v-if="selectedPlace" class="selected-place-preview">
              <div class="place-info">
                <span class="material-symbols-outlined location-icon">location_on</span>
                <span class="body-md font-medium">{{ selectedPlace.name || ('장소 #' + selectedPlace.id) }}</span>
                <span v-if="selectedPlace.category" class="label-sm text-sub">| #{{ selectedPlace.category }}</span>
              </div>
              <button class="btn-clear" type="button" @click="clearSelectedPlace">
                <span class="material-symbols-outlined icon-close">close</span>
              </button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-3">
              <label for="title" class="label-sm form-label">제목</label>
              <input
                id="title"
                v-model="title"
                type="text"
                class="form-control"
                placeholder="리뷰 제목을 입력해 주세요"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label for="rating" class="label-sm form-label">별점</label>
              <div class="select-wrapper">
                <select id="rating" v-model="rating" class="form-control select-control">
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
                <div class="select-arrow-icon">
                  <span class="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="content" class="label-sm form-label">내용</label>
            <textarea
              id="content"
              v-model="content"
              class="form-control textarea-control"
              placeholder="방문하신 장소는 어떠셨나요? 팁이나 추천 메뉴가 있다면 함께 적어주세요."
              rows="10"
              required
            ></textarea>
          </div>

          <div class="action-section">
              <div class="form-group pw-group">
                <label for="password" class="label-sm form-label">수정용 비밀번호</label>
                <template v-if="!isEditMode">
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    class="form-control pw-input"
                    placeholder="비밀번호 입력"
                    required
                  />
                  <p class="pw-tip">
                    ※ 게시글 수정/삭제 시 확인용으로 사용됩니다 (평문 저장)
                  </p>
                </template>
                <template v-else>
                  <div class="label-sm">비밀번호가 확인되었습니다. 내용 수정 후 저장해 주세요.</div>
                </template>
              </div>

            <div class="btn-group">
              <button class="btn btn-outline" type="button" @click="handleCancel">
                취소
              </button>
              <button 
                class="btn btn-primary" 
                type="submit" 
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '등록 중...' : '등록' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="help-cards">
        <div class="help-card card-safety">
          <div class="icon-badge">
            <span class="material-symbols-outlined icon-blue">verified_user</span>
          </div>
          <div>
            <h4 class="headline-md card-title">안전한 커뮤니티</h4>
            <p class="label-sm card-desc">
              부적절한 내용이나 광고성 게시글은 관리자에 의해 제재될 수 있습니다.
            </p>
          </div>
        </div>

        <div class="help-card card-tips">
          <div class="icon-badge">
            <span class="material-symbols-outlined icon-blue">tips_and_updates</span>
          </div>
          <div>
            <h4 class="headline-md card-title">작성 팁</h4>
            <p class="label-sm card-desc">
              상세한 후기는 다른 여행자들에게 큰 도움이 됩니다. 방문 시간대, 주변 맛집, 혹은 나만의 꿀팁을 공유해 보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.review-write-section { min-height: calc(100vh - 128px); padding: var(--stack-lg) 0; background-color: var(--color-surface); }
.container-sm { max-width: 800px; }
.page-header { margin-bottom: var(--stack-lg); }
.page-header h2 { margin-bottom: 8px; }
.text-sub { color: var(--color-on-surface-variant); }
.form-card { border-radius: 24px; background: rgba(255,255,255,0.95); border: 1px solid rgba(37,99,235,0.12); box-shadow: 0 14px 36px rgba(15,23,42,0.05); padding: var(--gutter); }
.form-group { display: flex; flex-direction: column; gap: var(--stack-sm); margin-bottom: 24px; }
.form-label { color: var(--color-on-surface-variant); font-weight: 500; }
  .form-control { width: 100%; background: transparent; border: 1px solid #dbeafe; border-radius: 12px; padding: 12px 16px; color: #111827; font-size: 16px; outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
  .form-control:focus { border-color: #2563eb; box-shadow: 0 8px 18px rgba(37,99,235,0.12); }
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f8fbff;
  border: 1px solid #dbeafe;
}
.search-box input { flex: 1; border: 0; outline: none; background: transparent; font: inherit; color: #111827; padding: 0; }
.search-icon { color: #64748b; }
.search-button { border: 0; border-radius: 999px; padding: 8px 14px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; cursor: pointer; box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2); }
.pl-10 { padding-left: 40px; }
.selected-place-preview { margin-top: 8px; padding: 10px 12px; background: #fff; border: 1px solid #eef2ff; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 14px rgba(15,23,42,0.04); }
.place-info { display: flex; align-items: center; gap: 8px; }
.location-icon { color: var(--color-primary); font-size: 20px; }
.btn-clear { color: #334155; display: flex; align-items: center; justify-content: center; transition: color 0.15s ease; background: transparent; border: 0; padding: 6px; border-radius: 8px; }
.btn-clear:hover { color: #dc2626; background: rgba(220,38,38,0.06); }
.icon-close { font-size: 18px; }
.form-row { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 768px) { .form-row { flex-direction: row; gap: var(--gutter); } .flex-3 { flex: 3; } .flex-1 { flex: 1; } }
.select-wrapper { position: relative; width: 100%; }
.select-control { appearance: none; cursor: pointer; padding-right: 40px; }
.select-arrow-icon { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); color: var(--color-on-surface-variant); pointer-events: none; display: flex; align-items: center; }
.textarea-control { resize: none; line-height: 1.6; }
.textarea-control { min-height: 160px; padding: 14px 16px; }
.btn { padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: 600; }
.btn-primary { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; border: 0; box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid #dbeafe; color: #334155; }
.pw-input { max-width: 280px; }
.action-section { padding-top: var(--stack-md); border-top: 1px solid var(--color-outline-variant); display: flex; flex-direction: column; gap: 20px; }
@media (min-width: 768px) { .action-section { flex-direction: row; align-items: flex-end; justify-content: space-between; } }
.pw-group { margin-bottom: 0; flex: 1; }
.pw-input { max-width: 100%; }
@media (min-width: 768px) { .pw-input { max-width: 280px; } }
.pw-tip { font-size: 12px; color: var(--color-secondary); margin-top: 4px; }
.btn-group { display: flex; align-items: center; justify-content: flex-end; gap: var(--stack-sm); }
.btn-group .btn { padding: 12px 24px; height: 48px; }
.help-cards { display: grid; grid-template-columns: 1fr; gap: var(--stack-md); margin-top: var(--stack-lg); }
@media (min-width: 768px) { .help-cards { grid-template-columns: 1fr 1fr; } }
.help-card { padding: var(--stack-md); border-radius: var(--radius-xl); display: flex; align-items: flex-start; gap: var(--stack-md); }
.card-safety { background-color: var(--color-secondary-container); color: var(--color-on-secondary-container); }
.card-tips { background-color: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
.icon-badge { padding: 8px; background-color: var(--color-surface-container-lowest); border-radius: var(--radius-lg); box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); display: flex; align-items: center; justify-content: center; }
.icon-blue { color: var(--color-primary); }
.card-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 13px; line-height: 1.4; }
.mode-toggle { display: flex; gap: 8px; }
.mode-button { padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; }
.mode-button.active { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; border-color: transparent; }
.location-list { list-style: none; margin: 8px 0 0; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eef2ff; background: #fff; }
.location-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
.location-item:last-child { border-bottom: 0; }
.loc-main { flex: 1; cursor: pointer; }
.loc-title { font-weight: 600; }
</style>
