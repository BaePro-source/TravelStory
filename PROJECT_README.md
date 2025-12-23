# Travel Story - 여행 일기 & 스토리북 앱

React Native로 구현한 여행 일기 및 스토리북 생성 애플리케이션입니다.

## 주요 기능

### 1. 여행 일기 작성
- 여행지별로 일기를 작성할 수 있습니다
- 제목과 내용을 자유롭게 기록할 수 있습니다
- 날짜별로 기록이 저장됩니다

### 2. 사진 업로드
- 갤러리에서 여러 장의 사진을 선택하여 업로드할 수 있습니다
- 각 여행마다 사진을 저장하고 관리할 수 있습니다

### 3. 스토리북 생성
- 일기 내용과 사진을 기반으로 자동으로 스토리북을 생성합니다
- 생성된 스토리북은 깔끔한 레이아웃으로 볼 수 있습니다

## 프로젝트 구조

```
TravelStory/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx     # 네비게이션 설정
│   ├── screens/
│   │   ├── HomeScreen.tsx       # 홈 화면 (여행 목록)
│   │   ├── DiaryWriteScreen.tsx # 일기 작성 화면
│   │   └── StorybookViewScreen.tsx # 스토리북 뷰어
│   └── types/
│       └── index.ts             # TypeScript 타입 정의
└── App.tsx                      # 앱 진입점
```

## 실행 방법

### Android
```bash
cd TravelStory
npm install
npx react-native run-android
```

### iOS
```bash
cd TravelStory
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

## 사용된 주요 라이브러리

- **@react-navigation/native** - 화면 네비게이션
- **@react-navigation/native-stack** - 스택 네비게이션
- **@react-navigation/bottom-tabs** - 하단 탭 네비게이션
- **react-native-image-picker** - 이미지 선택 및 카메라
- **@react-native-async-storage/async-storage** - 로컬 데이터 저장

## UI/UX 특징

- 깔끔한 베이지/화이트 톤의 색상 구성
- 카드 형식의 직관적인 레이아웃
- 부드러운 그림자와 둥근 모서리
- 사용자 친화적인 인터랙션

## 향후 개선 사항

- AI API 연동을 통한 스토리북 자동 생성 개선
- 사진 편집 기능
- 소셜 공유 기능
- 클라우드 백업 기능
- 다국어 지원
