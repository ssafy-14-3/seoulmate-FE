# Seoulmate Frontend

Seoulmate는 서울의 관광지, 여행 코스, 축제·행사 정보를 한눈에 확인하고, 사용자 리뷰를 공유할 수 있는 Vue 3 기반 커뮤니티 웹앱입니다.

## 주요 기능

- 카테고리별 장소 탐색
- 장소 검색 및 상세 정보 조회
- 사용자 리뷰 작성/수정/삭제
- 최근 리뷰 확인 및 상세 페이지 이동
- 챗봇 기반 질문 응답

## 기술 스택

- Vue 3
- Vite
- Vue Router
- Lottie Web
- Fetch 기반 API 연동

## 팀원 소개

| 🖥️ Web FE                                                 | ⚙️ Web BE                                                | 🖥️ Web FE                                                |
| --------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| <img src="https://github.com/maark1106.png" width="200"/> | <img src="https://github.com/medAndro.png" width="200"/> | <img src="https://github.com/dannysir.png" width="200"/> |
| [황준영](https://github.com/maark1106)                    | [장지형](https://github.com/medAndro)                    | [서산](https://github.com/dannysir)                      |

## 시작하기

### 1) 환경 준비

- Node.js 22.x 이상 권장
- 패키지 설치

```bash
npm install
```

### 2) 환경 변수 설정

프로젝트 루트에 .env 파일을 생성하고, 백엔드 API 주소를 설정합니다.

```env
VITE_BASE_URL=BE_URL //백엔드 주소 직접 입력
VITE_KAKAO_JS_KEY=KAKAO_KEY // 카카오 JS 키 값 입력
VITE_PUBLIC_BASE_URL=FE_URL // 배포된 FE 주소 입력
```

### 3) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속할 수 있습니다.

## 빌드

```bash
npm run build
```

## 프로젝트 구조

```text
src/
  assets/       스타일 및 애니메이션 리소스
  components/   공통 컴포넌트
  views/        페이지 단위 뷰
  router.js     라우팅 설정
api/            API 요청 모듈
```

## 기타

- 코드 포맷팅: `npm run format`
- 자세한 API 연동은 [api/index.js](api/index.js) 를 참고하세요.
