const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

/**
 * 공유용 페이지 URL 생성
 * - VITE_PUBLIC_BASE_URL이 설정되어 있으면 그 도메인(배포 주소) 기준으로 생성
 *   → 로컬 개발 중에 공유해도 localhost가 아닌 실제 서비스 링크가 나감
 * - 없으면 현재 origin 사용 (폴백)
 */
export function buildShareUrl(path = window.location.pathname) {
  const base = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin
  return `${base.replace(/\/$/, '')}${path}`
}

/** SDK 로드·초기화 상태를 보장. 문제 시 사용자에게 보여줄 메시지로 throw */
function ensureInitialized() {
  if (!window.Kakao) {
    throw new Error('카카오 SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.')
  }
  if (!window.Kakao.isInitialized()) {
    if (!KAKAO_JS_KEY) {
      throw new Error('카카오 공유 설정이 완료되지 않았습니다. (VITE_KAKAO_JS_KEY 누락)')
    }
    window.Kakao.init(KAKAO_JS_KEY)
  }
}

/** 카드 설명 문구 조합: "#관광지 · ★ 4.5 · 리뷰 12개" */
function buildDescription(location) {
  return [
    location.category ? `#${location.category}` : '',
    location.avg_rating ? `★ ${location.avg_rating.toFixed(1)}` : '',
    location.review_count ? `리뷰 ${location.review_count}개` : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * 장소 상세를 카카오톡으로 공유
 * 템플릿 선택: 주소+이미지 → location / 이미지만 → feed / 이미지 없음 → text
 * @param {object} location - GET /api/locations/{id} 응답 객체
 * @param {string} [url] - 공유 링크 (기본: 배포 주소 기준 현재 페이지 경로)
 */
export function shareLocationToKakao(location, url = buildShareUrl()) {
  ensureInitialized()

  const link = { webUrl: url, mobileWebUrl: url }
  const description = buildDescription(location)
  const detailButton = { title: '자세히 보기', link }

  // 1) 위치 템플릿: '위치 보기' 버튼이 자동 추가되어 카카오맵으로 연결됨
  if (location.address && location.image_url) {
    window.Kakao.Share.sendDefault({
      objectType: 'location',
      address: location.address, // 주소 텍스트 → 카카오맵 핀 위치
      addressTitle: location.name, // 지도 핀에 표시될 이름
      content: {
        title: location.name,
        description,
        imageUrl: location.image_url,
        link,
      },
      social: {
        commentCount: location.review_count ?? 0, // 카드에 리뷰 수 표시
      },
      buttons: [detailButton], // location 템플릿은 커스텀 버튼 1개까지
    })
    return
  }

  // 2) 주소가 없고 이미지는 있는 장소 → 일반 카드형(feed)
  if (location.image_url) {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: location.name,
        description,
        imageUrl: location.image_url,
        link,
      },
      buttons: [detailButton],
    })
    return
  }

  // 3) 이미지 없는 장소 → 텍스트 템플릿 (feed/location은 imageUrl 필수)
  window.Kakao.Share.sendDefault({
    objectType: 'text',
    text: `${location.name}\n${description}${location.address ? `\n${location.address}` : ''}`,
    link,
    buttonTitle: '자세히 보기',
  })
}
