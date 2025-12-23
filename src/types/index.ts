export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location?: string;
}

export interface Photo {
  id: string;
  uri: string;
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
}
