// src/components/DiaryCard.tsx
// 일기 카드 컴포넌트

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Diary } from '../types';
import { theme } from '../styles/theme';
import { formatDate } from '../utils/dateFormat';

interface DiaryCardProps {
  diary: Diary;
  onPress: () => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({ diary, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.date}>
          {formatDate(diary.date)}
        </Text>
        {diary.location && (
          <Text style={styles.location}>📍 {diary.location}</Text>
        )}
      </View>
      
      <Text style={styles.title} numberOfLines={1}>
        {diary.title}
      </Text>
      
      <Text style={styles.content} numberOfLines={3}>
        {diary.content}
      </Text>
      
      {diary.photos && diary.photos.length > 0 && (
        <View style={styles.photoIndicator}>
          <Text style={styles.photoCount}>📷 {diary.photos.length}장</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  date: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  location: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLight,
  },
  title: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  content: {
    fontSize: theme.fontSize.regular,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  photoIndicator: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  photoCount: {
    fontSize: theme.fontSize.small,
    color: theme.colors.accent,
  },
});