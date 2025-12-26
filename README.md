# TravelStory

AI 기반 여행 기록 및 스토리북 생성 앱

## 프로젝트 소개

**TravelStory**는 여행의 추억을 일기와 사진으로 기록하고, Google Gemini AI를 활용하여 감성적인 스토리북으로 자동 생성해주는 React Native 모바일 애플리케이션입니다.

### 주요 기능

- **여행 기록 관리**: 여행별로 일기와 사진을 체계적으로 관리
- **일기 작성**: 제목, 내용, 사진(최대 3장)을 포함한 일기 작성
- **AI 스토리북 생성**: Gemini AI가 여행 기록을 바탕으로 감성적인 이야기를 자동 생성
- **Google 로그인**: Google 계정 또는 익명으로 간편하게 로그인
- **실시간 동기화**: Firebase를 통한 실시간 데이터 동기화
- **사진 갤러리**: 여행 사진을 아름답게 보여주는 갤러리 뷰

## 기술 스택

### 프레임워크 및 언어
- **React Native** 0.83.1
- **TypeScript** 5.8.3
- **React** 19.2.0

### 백엔드 및 데이터
- **Firebase** 12.7.0
  - Authentication (Google 로그인, 익명 로그인)
  - Firestore (실시간 데이터베이스)
  - Storage
- **Google Gemini AI** (2.0 Flash) - 스토리북 생성

### 주요 라이브러리
- **Navigation**: React Navigation 7.x (Native Stack, Bottom Tabs)
- **이미지**: react-native-image-picker 8.2.1
- **날짜**: date-fns 4.1.0
- **환경변수**: react-native-dotenv 3.4.11

## 시작하기

### 필수 요구사항

- Node.js >= 20
- React Native 개발 환경 설정 완료
- Android Studio (Android) 또는 Xcode (iOS)

### 설치 방법

1. 저장소 클론
```bash
git clone <https://github.com/BaePro-source/TravelStory.git>
cd TravelStory
```

2. 의존성 설치
```bash
npm install
```

3. Android 설정

`android/app` 디렉토리에 `google-services.json` 파일을 추가하세요.

### 실행 방법

#### Metro 번들러 시작
```bash
npm start
```

#### Android 실행
```bash
npm run android
```

## 프로젝트 구조

```
TravelStory/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── config/             # Firebase 설정
│   ├── navigation/         # 네비게이션 구조
│   ├── screens/            # 화면 컴포넌트
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DiaryWriteScreen.tsx
│   │   ├── DiaryListScreen.tsx
│   │   ├── StoryBookScreen.tsx
│   │   └── StorybookViewScreen.tsx
│   ├── services/           # 외부 서비스 (AI)
│   ├── styles/             # 테마 및 스타일
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── android/                # Android 네이티브 코드
├── ios/                    # iOS 네이티브 코드
├── .env                    # 환경 변수 (Git 제외)
└── App.tsx                 # 앱 진입점
```

## 주요 화면

### 1. 로그인 화면 (LoginScreen)
- Google 계정으로 로그인
- 익명으로 둘러보기

### 2. 홈 화면 (HomeScreen)
- 여행 목록 확인
- 새 여행 만들기
- 여행 삭제
- 로그아웃

### 3. 일기 작성 화면 (DiaryWriteScreen)
- 일기 제목 및 내용 작성
- 사진 업로드 (최대 3장)
- 이전 일기 기록 확인
- AI 스토리북 생성

### 4. 스토리북 화면 (StoryBookScreen)
- 생성된 스토리북 목록
- 스토리북 보기 및 삭제

### 5. 스토리북 보기 (StorybookViewScreen)
- 사진 갤러리
- AI가 생성한 감성적인 여행 이야기

## AI 스토리북 생성

Google Gemini 2.0 Flash API를 사용하여 여행 일기를 감성적인 이야기로 변환합니다.

### 생성 과정
1. 모든 일기 내용과 사진 개수를 AI에 전달
2. AI가 여행의 분위기와 감정을 파악
3. 감성적인 제목과 2-3개의 문단으로 구성된 이야기 생성
4. 사진에 담긴 순간들을 묘사
5. 여행의 의미를 담은 마무리 문장 추가

### 특징
- 사실보다 감정과 분위기에 집중
- 빛, 공기, 느낌 등 감각적인 표현 사용
- 사진을 고려한 시각적 묘사 포함

## 보안

모든 API 키와 민감한 정보는 `.env` 파일에 저장되며, Git에는 업로드되지 않습니다.

### 환경 변수 관리
- `.env` 파일: 로컬 개발용
- `.gitignore`에 포함되어 Git 추적 제외
- `react-native-dotenv`를 통해 안전하게 로드

## 개발 스크립트

```bash
# 개발 서버 시작
npm start

# Android 빌드 및 실행
npm run android

# iOS 빌드 및 실행
npm run ios

# 린트 검사
npm run lint

# 테스트 실행
npm test
```

## 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

## 기여

이 프로젝트는 현재 개인 프로젝트입니다.

## 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
