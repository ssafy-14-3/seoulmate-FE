// 설계문서(DB/API 설계서) 기준 API 모듈 — 추가 패키지 없이 fetch 사용
// 배포 시 .env 에 VITE_API_BASE_URL=https://<render-url> 지정

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const request = async (path, { method = 'GET', params, body } = {}) => {
  const url = new URL(BASE_URL + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    // 공통 오류 형식: { detail: { code, message } }
    const err = await res.json().catch(() => ({}))
    const e = new Error(err?.detail?.message || `HTTP ${res.status}`)
    e.status = res.status
    e.code = err?.detail?.code
    throw e
  }

  if (res.status === 204) return null
  return res.json()
}

// ── 장소 ──────────────────────────────────────────
export const getLocationList = ({ category, q, page = 1, size = 10 } = {}) => {
  const safePage = Number(page) || 1
  const safeSize = Math.min(Number(size) || 10, 50)

  return request('/api/locations', {
    params: {
      category: category || undefined,
      q: q || undefined,
      page: safePage,
      size: safeSize,
    },
  })
}

export const getLocationDetail = (id) => request(`/api/locations/${id}`)

// ── 리뷰 ──────────────────────────────────────────

export const getReviewList = (locationId, params) => {
  request(`/api/locations/${locationId}/reviews`, { params })
}

/**
 * 리뷰를 작성합니다.
 * @param {number} locationId
 * @param {Object} body
 *  body: {
 *   title: string, (1 ~ 100 characters)
 *   content: string, (1 ~2000 characters)
 *   rating: number (1 ~ 5),
 *   password: string (4 ~ 20 characters)
 * }
 */
export const postReview = (locationId, body) => {
  request(`/api/locations/${locationId}/reviews`, { method: 'POST', body })
}

/**
 * 리뷰를 업데이트합니다.
 * @param {number} reviewId
 * @param {Object} body
 * body: {
 *   title: string, (1 ~ 100 characters)
 *   content: string, (1 ~2000 characters)
 *   rating: number (1 ~ 5),
 *   password: string (4 ~ 20 characters)
 * }
 */
export const updateReview = (reviewId, body) => {
  request(`/api/reviews/${reviewId}`, { method: 'PUT', body })
}

/**
 * 리뷰를 삭제합니다.
 * @param {number} reviewId
 * @param {number} password
 */
export const deleteReview = (reviewId, password) => {
  request(`/api/reviews/${reviewId}`, { method: 'DELETE', body: { password } })
}

/**
 * 리뷰 비밀번호를 검증합니다.
 * @param {number} reviewId
 * @param {number} password
 */
export const checkReviewPassword = (reviewId, password) => {
  request(`/api/reviews/${reviewId}/verify`, { method: 'POST', body: { password } })
}

// ── 챗봇 ──────────────────────────────────────────
/**
 * 챗봇에게 메시지를 전송합니다.
 * @param {string} message
 * @param {Array} history
 * history: [
 *   { role: 'user' | 'assistant', content: string },
 *   ...
 * ]
 */
export const sendChat = (message, history = []) => {
  request('/api/chat', { method: 'POST', body: { message, history } })
}
