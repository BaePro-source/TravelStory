// src/screens/StoryBookScreen.tsx
// 스토리북 생성 화면 - AI 스토리 생성

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';


import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { theme } from '../styles/theme';
import { Diary, RootStackParamList } from '../types';
import { formatDate } from '../utils/dateFormat';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type StoryBookScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoryBook'>;
};



const EmptyList = ({ navigation }: { navigation: any }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyText}>작성된 일기가 없어요</Text>
    <Text style={styles.emptySubtext}>
      먼저 여행 일기를 작성해주세요!
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={() => navigation.navigate('Main')}
    >
      <Text style={styles.emptyButtonText}>일기 작성하러 가기</Text>
    </TouchableOpacity>
  </View>
);

export default function StoryBookScreen({ navigation }: StoryBookScreenProps) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [selectedDiaries, setSelectedDiaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (!auth().currentUser) return;

    const q = query(collection(db(), 'diaries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diaryData: Diary[] = [];
      snapshot.forEach((doc) => {
        diaryData.push({ id: doc.id, ...doc.data() } as Diary);
      });
      setDiaries(diaryData);
    });

    return () => unsubscribe();
  }, []);

  const toggleDiary = (diaryId: string) => {
    if (selectedDiaries.includes(diaryId)) {
      setSelectedDiaries(selectedDiaries.filter(id => id !== diaryId));
    } else {
      setSelectedDiaries([...selectedDiaries, diaryId]);
    }
  };

  const generateStory = async () => {
    if (selectedDiaries.length === 0) {
      Alert.alert('알림', '스토리로 만들 일기를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 선택된 일기들 가져오기
      const selectedDiaryData = diaries.filter(diary =>
        selectedDiaries.includes(diary.id)
      );

      // 일기 내용 합치기
      const combinedContent = selectedDiaryData
        .map(diary => `${diary.title}\n${diary.content}`)
        .join('\n\n');

      // 모든 사진 모으기
      const allPhotos = selectedDiaryData
        .flatMap(diary => diary.photos || []);

      // TODO: 실제 Claude API 호출로 스토리 생성
      // 현재는 데모용 스토리
      const story = await generateAIStory(combinedContent, allPhotos);

      // 스토리 저장
      const storyData = {
        userId: auth().currentUser!.uid,
        title: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월의 여행`,
        content: story,
        photos: allPhotos,
        diaryIds: selectedDiaries,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db(), 'stories'), storyData);

      setLoading(false);

      // 생성된 스토리 화면으로 이동
      navigation.navigate('StorybookView', {
        storybookId: docRef.id
      });

    } catch (error) {
      console.error('스토리 생성 실패:', error);
      setLoading(false);
      Alert.alert('오류', '스토리 생성에 실패했습니다.');
    }
  };

  const generateAIStory = async (content: string, photos: string[]) => {
    // TODO: 실제 Claude API 연동
    // 현재는 데모용 더미 스토리 반환

    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const demoStory = `✨ 당신의 여행 이야기 ✨

${content}

이 여행은 정말 특별한 순간들로 가득했습니다. 
매 순간이 소중한 추억이 되어 당신의 마음속에 영원히 남을 것입니다.

사진 ${photos.length}장과 함께하는 이 이야기는
당신만의 특별한 여행 스토리가 되었습니다.

앞으로도 많은 여행과 아름다운 추억을 만들어가시길 바랍니다. 💝`;

        resolve(demoStory);
      }, 2000);
    });
  };

  const renderDiaryItem = ({ item }: { item: Diary }) => {
    const isSelected = selectedDiaries.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.diaryCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => toggleDiary(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.diaryHeader}>
          <View style={styles.checkbox}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.diaryInfo}>
            <Text style={styles.diaryDate}>
              {formatDate(item.date)}
            </Text>
            <Text style={styles.diaryTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        </View>

        {item.photos && item.photos.length > 0 && (
          <Text style={styles.photoCount}>📷 {item.photos.length}장</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스토리로 만들 일기 선택</Text>
        <Text style={styles.headerSubtitle}>
          {selectedDiaries.length}개 선택됨
        </Text>
      </View>

      <FlatList
        data={diaries}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyList navigation={navigation} />}
      />


      {/* 스토리 생성 버튼 */}
      {diaries.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              selectedDiaries.length === 0 && styles.disabledButton,
            ]}
            onPress={generateStory}
            disabled={loading || selectedDiaries.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>
                ✨ AI 스토리 만들기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.regular,
    color: theme.colors.textLight,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  diaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.warm,
  },
  diaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  diaryInfo: {
    flex: 1,
  },
  diaryDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  diaryTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  photoCount: {
    fontSize: theme.fontSize.small,
    color: theme.colors.accent,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
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
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.card,
  },
  generateButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
});