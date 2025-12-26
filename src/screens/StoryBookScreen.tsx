// src/screens/StoryBookScreen.tsx
// 스토리북 생성 화면 - AI 스토리 생성

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';


import { theme } from '../styles/theme';
import { Diary, RootStackParamList, Storybook } from '../types';
import { formatDate } from '../utils/dateFormat';
import { generateAIStory } from '../services/aiService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type StoryBookScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoryBook'>;
};



const EmptyDiaries = ({ navigation }: { navigation: any }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyText}>작성된 일기가 없어요</Text>
    <Text style={styles.emptySubtext}>
      먼저 여행 일기를 작성해주세요!
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={() => navigation.navigate('HomeTab')}
    >

      <Text style={styles.emptyButtonText}>일기 작성하러 가기</Text>
    </TouchableOpacity>
  </View>
);

const EmptyStorybooks = ({ onCreate }: { onCreate: () => void }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>✨</Text>
    <Text style={styles.emptyText}>아직 스토리북이 없어요</Text>
    <Text style={styles.emptySubtext}>
      당신의 일기를 모아 멋진 이야기를 만들어보세요!
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={onCreate}
    >
      <Text style={styles.emptyButtonText}>첫 스토리북 만들기</Text>
    </TouchableOpacity>
  </View>
);


export default function StoryBookScreen({ navigation }: StoryBookScreenProps) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [selectedDiaries, setSelectedDiaries] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!auth.currentUser) return;

    // 1. 일기 목록 로드
    const diaryQ = query(
      collection(db, 'diaries'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubDiaries = onSnapshot(diaryQ, (snapshot) => {
      const data: Diary[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Diary);
      });
      // 인덱스 오류 방지를 위해 메모리상에서 정렬
      data.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setDiaries(data);

    });

    // 2. 스토리북 목록 로드
    const storyQ = query(
      collection(db, 'storybooks'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubStories = onSnapshot(storyQ, (snapshot) => {
      const data: Storybook[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Storybook);
      });
      // 인덱스 오류 방지를 위해 메모리상에서 정렬
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setStorybooks(data);

    });

    return () => {
      unsubDiaries();
      unsubStories();
    };
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
      const title = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월의 여행`;
      const diaryContents = selectedDiaryData.map(d => `${d.title}\n${d.content}`);
      // @ts-ignore - Some lint might still show 2 args if types aren't cached
      const story = await generateAIStory(title, diaryContents, allPhotos.length);




      // 스토리 저장
      const storyData = {
        userId: auth.currentUser!.uid,
        title: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월의 여행`,
        content: story,
        photos: allPhotos,
        diaryIds: selectedDiaries,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'storybooks'), storyData);


      setLoading(false);
      setIsCreating(false);
      setSelectedDiaries([]);

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

  const deleteStorybook = async (id: string) => {
    const storybookToDelete = storybooks.find(s => s.id === id);
    if (!storybookToDelete) return;

    Alert.alert(
      '삭제 확인',
      '정말로 이 스토리북을 삭제하시겠습니까? 관련 여행 기록도 함께 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. 관련 여행 기록 삭제 (travelId가 있는 경우)
              if (storybookToDelete.travelId) {
                await deleteDoc(doc(db, 'travels', storybookToDelete.travelId));
              }

              // 2. 스토리북 본체 삭제
              await deleteDoc(doc(db, 'storybooks', id));
            } catch (error) {
              console.error('Failed to delete storybook:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
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

  const renderStorybookItem = ({ item }: { item: Storybook }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate('StorybookView', { storybookId: item.id })}
    >
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle}>{item.title}</Text>
        <Text style={styles.storyDate}>
          {new Date(item.createdAt).toLocaleDateString('ko-KR')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteMiniButton}
        onPress={() => deleteStorybook(item.id)}
      >
        <Text style={styles.deleteMiniText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isCreating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsCreating(false)}>
            <Text style={styles.backButton}>← 취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>스토리로 만들 일기 선택</Text>
        </View>

        <FlatList
          data={diaries}
          renderItem={renderDiaryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<EmptyDiaries navigation={navigation} />}
        />

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 스토리북</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.createButtonText}>+ 만들기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={storybooks}
        renderItem={renderStorybookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyStorybooks onCreate={() => setIsCreating(true)} />}
      />
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
  backButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 12,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createButtonText: {
    color: theme.colors.textDark,
    fontWeight: 'bold',
  },
  storyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  storyDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLight,
  },
  deleteMiniButton: {
    padding: 8,
  },
  deleteMiniText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
