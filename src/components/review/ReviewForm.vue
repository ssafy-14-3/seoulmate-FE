<script setup>
import { ref, watch } from 'vue'
import router from '@/router.js'

const props = defineProps({
  initialReview: { type: Object, default: null }
})

const searchQuery = ref('')
const selectedPlace = ref(props.initialReview?.selectedPlace ?? null)

const title = ref(props.initialReview?.title ?? '')
const rating = ref(props.initialReview?.rating ?? '5')
const content = ref(props.initialReview?.content ?? '')
const password = ref(props.initialReview?.password ?? '')
const isSubmitting = ref(false)

watch(() => props.initialReview, (v) => {
  if (!v) return
  selectedPlace.value = v.selectedPlace ?? selectedPlace.value
  title.value = v.title ?? ''
  rating.value = v.rating ?? '5'
  content.value = v.content ?? ''
  password.value = v.password ?? ''
})

function searchPlace() {
  if (!searchQuery.value.trim()) {
    alert('검색어를 입력해 주세요.')
    return
  }
  if (searchQuery.value.includes('경복궁')) {
    selectedPlace.value = { id: 1, name: '경복궁', category: '관광지' }
  } else if (searchQuery.value.includes('성수')) {
    selectedPlace.value = { id: 2, name: '성수동 골목 카페', category: '맛집' }
  } else if (searchQuery.value.includes('반포') || searchQuery.value.includes('한강')) {
    selectedPlace.value = { id: 3, name: '반포 한강공원', category: '관광지' }
  } else {
    selectedPlace.value = { id: Date.now(), name: searchQuery.value, category: '기타' }
  }
  searchQuery.value = ''
}

function clearSelectedPlace() {
  selectedPlace.value = null
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
    // TODO: 백엔드 API 연동 시 아래 주석을 해제하여 사용하세요.
    /*
    const payload = {
      location_id: selectedPlace.value.id,
      title: title.value,
      rating: parseInt(rating.value),
      content: content.value,
      password: password.value
    }
    await createReview(payload)
    */

    await new Promise((resolve) => setTimeout(resolve, 800))
    alert('리뷰가 성공적으로 등록되었습니다.')
    router.push('/locations')
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
        <h2 class="headline-lg">리뷰 작성하기</h2>
        <p class="body-md text-sub">서울에서의 특별한 경험을 공유해 주세요.</p>
      </div>

      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="label-sm form-label">장소 선택</label>
            <div class="search-input-group">
              <div class="search-input-wrapper">
                <span class="material-symbols-outlined search-icon">search</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control pl-10"
                  placeholder="리뷰를 작성할 장소를 검색해 주세요"
                  @keyup.enter="searchPlace"
                />
              </div>
              <button class="btn btn-search" type="button" @click="searchPlace">
                검색
              </button>
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
/* (style omitted for brevity — keep same styles as in original view) */
.review-write-section { min-height: calc(100vh - 128px); padding: var(--stack-lg) 0; background-color: var(--color-surface); }
.container-sm { max-width: 800px; }
.page-header { margin-bottom: var(--stack-lg); }
.page-header h2 { margin-bottom: 8px; }
.text-sub { color: var(--color-on-surface-variant); }
.form-card { background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-xl); padding: var(--gutter); box-shadow: 0 1px 3px rgb(0 0 0 / 0.05); }
.form-group { display: flex; flex-direction: column; gap: var(--stack-sm); margin-bottom: 24px; }
.form-label { color: var(--color-on-surface-variant); font-weight: 500; }
.form-control { width: 100%; background-color: var(--color-surface-container-low); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-lg); padding: 12px 16px; color: var(--color-on-surface); font-size: 16px; outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.form-control:focus { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }
.pl-10 { padding-left: 40px; }
.search-input-group { display: flex; gap: 8px; }
.search-input-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; top: 50%; left: 12px; transform: translateY(-50%); color: var(--color-on-surface-variant); font-size: 20px; pointer-events: none; }
.btn-search { padding: 0 16px; background-color: var(--color-surface-container-highest); color: var(--color-on-surface); border-radius: var(--radius-lg); font-size: 14px; font-weight: 500; white-space: nowrap; transition: background-color 0.15s ease; }
.btn-search:hover { background-color: var(--color-surface-container-high); }
.selected-place-preview { margin-top: 4px; padding: 12px; background-color: var(--color-surface-container-low); border: 1px dashed var(--color-outline-variant); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; }
.place-info { display: flex; align-items: center; gap: 8px; }
.location-icon { color: var(--color-primary); font-size: 20px; }
.btn-clear { color: var(--color-secondary); display: flex; align-items: center; justify-content: center; transition: color 0.15s ease; }
.btn-clear:hover { color: var(--color-error); }
.icon-close { font-size: 20px; }
.form-row { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 768px) { .form-row { flex-direction: row; gap: var(--gutter); } .flex-3 { flex: 3; } .flex-1 { flex: 1; } }
.select-wrapper { position: relative; width: 100%; }
.select-control { appearance: none; cursor: pointer; padding-right: 40px; }
.select-arrow-icon { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); color: var(--color-on-surface-variant); pointer-events: none; display: flex; align-items: center; }
.textarea-control { resize: none; line-height: 1.6; }
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
</style>
