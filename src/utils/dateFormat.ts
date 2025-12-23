// src/utils/dateFormat.ts
// 날짜 포맷팅 유틸리티 함수

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'M월 d일 (E)') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ko });
};

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'yyyy년 M월 d일 HH:mm');
};

export const formatShortDate = (date: string | Date) => {
  return formatDate(date, 'M/d');
};