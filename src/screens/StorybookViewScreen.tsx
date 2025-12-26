import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Storybook, Photo } from '../types';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StorybookViewRouteProp = RouteProp<RootStackParamList, 'StorybookView'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StorybookViewScreen = () => {

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StorybookViewRouteProp>();
  const { storybookId } = route.params;

  const [storybook, setStorybook] = useState<Storybook | null>(null);

  useEffect(() => {
    loadStorybook();
  }, []);

  const loadStorybook = async () => {
    if (!storybookId) return;
    try {
      const storybookDoc = await getDoc(doc(db, 'storybooks', storybookId));
      if (storybookDoc.exists()) {
        setStorybook({ id: storybookDoc.id, ...storybookDoc.data() } as Storybook);
      }
    } catch (error) {
      console.error('Failed to load storybook:', error);
    }
  };

  const deleteStorybook = async () => {
    Alert.alert(
      '스토리북 삭제',
      '정말로 이 스토리북을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'storybooks', storybookId));
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete storybook:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };



  if (!storybook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스토리북</Text>
        <TouchableOpacity onPress={deleteStorybook}>
          <Text style={styles.deleteButton}>삭제</Text>
        </TouchableOpacity>
      </View>


      <ScrollView style={styles.content}>
        {storybook.photos && storybook.photos.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoGallery}
          >
            {storybook.photos.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        )}

        {!storybook.photos && storybook.coverImage && (
          <Image
            source={{ uri: storybook.coverImage }}
            style={styles.coverImage}
          />
        )}

        <View style={styles.titleSection}>
          <Text style={styles.title}>{storybook.title}</Text>
          <Text style={styles.date}>
            {storybook.createdAt ? new Date(storybook.createdAt).toLocaleDateString('ko-KR') : ''}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{storybook.content}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 16,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  deleteButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },

  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  photoGallery: {
    width: '100%',
    height: 350,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 350,
    resizeMode: 'cover',
  },

  titleSection: {

    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  contentSection: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333333',
  },
});

export default StorybookViewScreen;
