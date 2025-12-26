export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location?: string;
}

// Diary 타입 추가 (Firebase용)
export interface Diary {
  id: string;
  userId: string;
  travelId?: string;
  title: string;
  content: string;
  date: string;
  location?: string;
  photos?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Photo {
  id: string;
  uri: string;
  base64?: string;
  date: string;
}

export interface Travel {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  diaries: DiaryEntry[];
  photos: Photo[];
}

export interface Storybook {
  id: string;
  travelId: string;
  title: string;
  content: string;
  createdAt: string;
  coverImage?: string;
  photos?: string[];
}


// 네비게이션 타입
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  DiaryList: undefined;
  DiaryWrite: { travelId?: string; diaryId?: string };
  StorybookView: { storybookId: string };
  StoryBook: undefined;
};

export interface StorybookPage {
  page: number;
  title: string;
  caption: string;
  layout: 'full';
  photoIndex: number[];
}

export interface StorybookRequest {
  tripTitle: string;
  tripDate: string;
  notes: string;
  places: string[];
  people: string[];
  photoUrls: string[];
}

export interface StorybookResponse {
  summary: string;
  storybook: StorybookPage[];
}