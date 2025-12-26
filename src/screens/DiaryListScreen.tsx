// src/screens/DiaryListScreen.tsx
// 일기 목록 화면

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where
} from 'firebase/firestore';

import { theme } from '../styles/theme';
import { Diary, RootStackParamList } from '../types';
import { DiaryCard } from '../components/DiaryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DiaryListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DiaryList'>;
};

const EmptyList = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>✈️</Text>
    <Text style={styles.emptyText}>아직 작성한 일기가 없어요</Text>
    <Text style={styles.emptySubtext}>
      오늘의 여행을 기록해보세요!
    </Text>
  </View>
);

export default function DiaryListScreen({ navigation }: DiaryListScreenProps) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Firestore에서 실시간으로 일기 목록 가져오기
    const q = query(
      collection(db, 'diaries'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diaryData: Diary[] = [];
      snapshot.forEach((doc) => {
        diaryData.push({ id: doc.id, ...doc.data() } as Diary);
      });

      // 인덱스 오류 방지를 위해 메모리상에서 정렬
      diaryData.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));


      setDiaries(diaryData);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderDiaryItem = ({ item }: { item: Diary }) => (
    <DiaryCard
      diary={item}
      onPress={() => navigation.navigate('DiaryWrite', { diaryId: item.id })}
    />
  );


  if (loading) {
    return <LoadingSpinner message="일기를 불러오는 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diaries}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyList}
      />

      {/* 일기 작성 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('DiaryWrite', {})}
        activeOpacity={0.8}
      >

        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.regular,
    color: theme.colors.textLight,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  fabIcon: {
    fontSize: 28,
  },
});