/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ── Typography ─────────────────────────────
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      // 정보 위계는 색이 아니라 size/weight/spacing 으로 표현
      fontSize: {
        // 공통 스케일
        caption: ["13px", { lineHeight: "18px", letterSpacing: "-0.01em" }],
        body: ["15px", { lineHeight: "22px", letterSpacing: "-0.01em" }],
        "body-lg": ["17px", { lineHeight: "26px", letterSpacing: "-0.01em" }],
        "card-title": ["18px", { lineHeight: "26px", letterSpacing: "-0.02em" }],
        "page-title": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        display: ["28px", { lineHeight: "36px", letterSpacing: "-0.03em" }],
        // 데이터 숫자 (가장 크게)
        "data-lg": ["40px", { lineHeight: "46px", letterSpacing: "-0.03em" }],
        "data-xl": ["52px", { lineHeight: "56px", letterSpacing: "-0.03em" }],
        // 시니어(부모) 전용 확대 스케일
        "senior-body": ["20px", { lineHeight: "30px", letterSpacing: "-0.01em" }],
        "senior-title": ["26px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "senior-btn": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
      },

      // ── Color System ───────────────────────────
      colors: {
        // Primary : Blue (Toss 계열)
        primary: {
          50: "#EBF3FE",
          100: "#D3E5FD",
          200: "#A8CCFB",
          300: "#7DB2F9",
          400: "#5299F7",
          500: "#3182F6", // DEFAULT
          600: "#2272EB",
          700: "#1B5FCB",
          800: "#184FA5",
          900: "#173F80",
          DEFAULT: "#3182F6",
        },
        // Secondary : Gray Scale (중립 배경/텍스트)
        gray: {
          50: "#F9FAFB",
          100: "#F2F4F6",
          200: "#E5E8EB",
          300: "#D1D6DB",
          400: "#B0B8C1",
          500: "#8B95A1",
          600: "#6B7684",
          700: "#4E5968",
          800: "#333D4B",
          900: "#191F28",
        },
        // 상태 컬러 (건강 카드/차트에만 제한적으로 사용)
        success: { light: "#E7F7EF", DEFAULT: "#15B76E", dark: "#0F9D5C" }, // 정상 Green
        warning: { light: "#FFF4E5", DEFAULT: "#FF8A00", dark: "#E67A00" }, // 주의 Orange
        danger: { light: "#FEECEC", DEFAULT: "#F04452", dark: "#D63847" }, // 위험 Red
        // Chat Bubble
        "bubble-user": "#FEF6C7", // 부모 메시지 : 밝은 노란색
        "bubble-ai": "#E8F3FF", // AI 메시지 : 연한 파란색
        // 앱 전체 배경 (화이트 기반 미니멀 — 아주 옅은 쿨 그레이)
        canvas: "#F5F7FA",
        // Accent 토큰 — 블루-모노 통일. 카드는 흰색, 강조/아이콘 배경만 옅은 블루.
        // (키는 하위호환용으로 유지하되 모두 동일한 블루 톤으로 수렴)
        accent: {
          pink: "#EBF3FE",
          purple: "#EBF3FE",
          sky: "#EBF3FE",
          mint: "#EBF3FE",
          yellow: "#EBF3FE",
          blue: "#EBF3FE",
          rose: "#EBF3FE",
          peach: "#EBF3FE",
        },
      },

      // ── Radius ─────────────────────────────────
      borderRadius: {
        input: "16px",
        button: "18px",
        card: "20px",
        sheet: "24px",
      },

      // ── Shadow (아주 은은하게, 종이 겹침 느낌) ──
      boxShadow: {
        card: "0 1px 3px rgba(0, 27, 55, 0.04), 0 1px 2px rgba(0, 27, 55, 0.03)",
        "card-hover": "0 4px 12px rgba(0, 27, 55, 0.06), 0 2px 4px rgba(0, 27, 55, 0.04)",
        // 프리미엄 · 매우 은은한 부드러운 그림자
        soft: "0 6px 24px -10px rgba(30, 34, 45, 0.10), 0 2px 8px -4px rgba(30, 34, 45, 0.04)",
        sheet: "0 -4px 16px rgba(0, 27, 55, 0.08)",
        fab: "0 4px 16px rgba(49, 130, 246, 0.24)",
      },

      // ── Motion (Micro Interaction, 150~250ms) ──
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "250ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 250ms cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        "sheet-up": "sheet-up 250ms cubic-bezier(0.22, 1, 0.36, 1)",
      },

      // 모바일 퍼스트 컨테이너 (앱 화면 폭)
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
