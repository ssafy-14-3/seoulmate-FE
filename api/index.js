// 설계문서(DB/API 설계서) 기준 API 모듈 — 추가 패키지 없이 fetch 사용
// 배포 시 .env 에 VITE_API_BASE_URL=https://<render-url> 지정

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, { method = 'GET', params, body } = {}) {
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
export const fetchLocations = (params) => request('/api/locations', { params })
export const fetchLocation = (id) => request(`/api/locations/${id}`)

// ── 리뷰 ──────────────────────────────────────────
export const fetchReviews = (locationId, params) =>
  request(`/api/locations/${locationId}/reviews`, { params })

export const createReview = (locationId, body) =>
  request(`/api/locations/${locationId}/reviews`, { method: 'POST', body })

export const updateReview = (reviewId, body) =>
  request(`/api/reviews/${reviewId}`, { method: 'PUT', body })

export const deleteReview = (reviewId, password) =>
  request(`/api/reviews/${reviewId}`, { method: 'DELETE', body: { password } })

export const verifyReviewPassword = (reviewId, password) =>
  request(`/api/reviews/${reviewId}/verify`, { method: 'POST', body: { password } })

// ── 챗봇 ──────────────────────────────────────────
export const sendChat = (message, history = []) =>
  request('/api/chat', { method: 'POST', body: { message, history } })
