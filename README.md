# 온기(ongi) — 프론트엔드

어르신(부모)의 건강을 자녀(보호자)가 함께 관리하는 AI 헬스케어 앱의 프론트엔드.
부모 모드(건강 체크·AI 대화)와 자녀 모드(어르신 대시보드·건강정보·AI 상담)를 하나의 앱에서 제공합니다.

## 기술 스택

| 구분 | 기술 | 버전 |
|---|---|---|
| 언어 | TypeScript | ~6.0 |
| UI 라이브러리 | React | 19.2 |
| 빌드 도구 | Vite | 8.1 |
| 라우팅 | React Router | 7.18 |
| HTTP 클라이언트 | Axios | 1.18 |
| 스타일링 | Tailwind CSS | 3.4 (+ PostCSS · Autoprefixer) |
| 린터 | oxlint | 1.71 |

### 아키텍처 특징
- **역할 기반 이원화**: 어르신용 경량 화면과 보호자용 관리 화면을 하나의 앱에서 분리 제공.
- **세션 인증**: 보호자 로그인은 세션 쿠키 기반으로 안전하게 처리.
- **API 계층 설계**: 도메인별 모듈화 + Axios 인터셉터로 공통 응답(`ApiResponse<T>`) 언랩·에러 표준화.
- **실시간 가족 연동**: 어르신이 남긴 건강 체크·대화가 보호자 대시보드에 즉시 반영.
- **AI 대화 분리 설계**: 어르신 자가보고(`/chat`)와 보호자 상담(`/consult`)을 목적별로 분리하고, 대화에서 수면·운동·복약 지표를 자동 추출해 대시보드에 시각화.

## 실행 방법

```bash
npm install       # 의존성 설치
npm run dev       # 개발 서버 (Vite)
npm run build     # 타입체크(tsc) + 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # oxlint
```

### 환경 변수
`.env`:

```
VITE_API_BASE_URL=http://localhost:8080   # 백엔드 주소 (요청은 /api 프리픽스)
```

## 폴더 구조

```
src/
├─ apis/          # 백엔드 API 모듈(도메인별) · Axios 클라이언트
├─ components/    # 공통 UI · 부모/자녀 전용 컴포넌트
├─ pages/         # 화면 (auth · parent · child)
├─ store/         # 전역 상태 (AppProvider · AuthProvider · reducer)
├─ hooks/         # useApi · useAuth · useApp 등
├─ types/         # 앱 타입 · API DTO 계약(api.ts)
├─ utils/         # 라벨·파생값 · 헬퍼
└─ data/          # 화면 초기 데이터
```
