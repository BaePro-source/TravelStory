// src/styles/theme.ts
// 포근한 힐링 테마 컬러 및 스타일 정의

export const theme = {
  colors: {
    // 메인 컬러
    primary: '#FFB4A2',      // 따뜻한 핑크 (포근함)
    secondary: '#E5CFF7',    // 연보라 (힐링)
    background: '#FFF9F5',   // 아이보리 (편안함)
    card: '#FFFFFF',         // 화이트 (깔끔함)
    
    // 텍스트 컬러
    text: '#5D4E6D',         // 부드러운 퍼플 그레이
    textLight: '#9B8AA4',    // 연한 텍스트
    textDark: '#3D2E4D',     // 진한 텍스트
    
    // 액센트 컬러
    accent: '#B8E0D2',       // 민트 (활기)
    warm: '#F7DBA7',         // 따뜻한 베이지
    
    // 상태 컬러
    success: '#A8D5BA',      // 부드러운 그린
    error: '#F4A5AE',        // 부드러운 레드
    warning: '#FFD6A5',      // 부드러운 오렌지
  },
  
  // 그림자 (부드러운 느낌)
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 5,
    },
  },
  
  // 폰트 크기
  fontSize: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  },
  
  // 간격
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // 둥근 모서리
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
  },
} as const;

export type Theme = typeof theme;

export default theme;