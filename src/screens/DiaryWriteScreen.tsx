import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import { launchImageLibrary } from 'react-native-image-picker';
import { Travel, DiaryEntry, Photo } from '../types';
import { generateAIStory } from '../services/aiService';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DiaryWriteRouteProp = RouteProp<RootStackParamList, 'DiaryWrite'>;

const DiaryWriteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DiaryWriteRouteProp>();

  const { travelId } = route.params || {};
  const user = auth.currentUser;

  const [travel, setTravel] = useState<Travel | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    loadTravel();
  }, []);

  const loadTravel = async () => {
    if (!travelId) return;
    try {
      const travelDoc = await getDoc(doc(db, 'travels', travelId));
      if (travelDoc.exists()) {
        const data = travelDoc.data() as Travel;
        // id 중복 지정을 방지하기 위해 data에서 id를 제외하거나 순서를 바꿉니다.
        setTravel({ ...data, id: travelDoc.id });
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to load travel:', error);
    }
  };



  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 3,
        includeBase64: true,
        quality: 0.3,
        maxWidth: 800,
        maxHeight: 800,
      },
      response => {
        if (response.assets) {
          const newPhotos: Photo[] = response.assets.map((asset, index) => {
            let uri = asset.uri || '';
            // URI가 슬래시로 시작하고 스키마가 없는 경우에만 file://을 붙입니다.
            if (uri && !uri.includes('://') && uri.startsWith('/')) {
              uri = `file://${uri}`;
            }
            return {
              id: `${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
              uri,
              base64: asset.base64,
              date: new Date().toISOString(),
            };
          });
          setPhotos([...photos, ...newPhotos]);

        }
      },
    );
  };

  const uploadImages = async (localPhotos: Photo[]): Promise<Photo[]> => {
    const uploadedPhotos: Photo[] = [];

    for (const photo of localPhotos) {
      // 이미 업로드된 사진은 그대로 사용
      if (photo.uri.startsWith('data:image')) {
        uploadedPhotos.push(photo);
        continue;
      }

      try {
        if (!photo.base64) {
          console.warn('No base64 data for photo:', photo.id);
          Alert.alert('업로드 오류', '사진 데이터를 읽을 수 없습니다.');
          continue;
        }

        // base64를 data URL로 변환하여 저장 (Firebase Storage 대신 Firestore에 저장)
        const dataUrl = `data:image/jpeg;base64,${photo.base64}`;

        console.log('Saving image as base64 data URL');

        uploadedPhotos.push({
          ...photo,
          uri: dataUrl,
        });
      } catch (error) {
        console.error('Failed to process image:', error);
        Alert.alert('처리 실패', `이미지 처리에 실패했습니다.\n\n에러: ${error}`);
      }
    }

    return uploadedPhotos;
  };


  const saveDiary = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!travelId) return;

    try {
      setLoading(true);

      // 1. 이미지 먼저 업로드
      const uploadedPhotos = await uploadImages(photos);

      const newDiary: DiaryEntry = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString(),
      };

      // 2. 기존 여행 데이터의 사진과 새로 업로드한 사진 합치기
      const existingPhotos = travel?.photos || [];
      const allPhotos = [...existingPhotos, ...uploadedPhotos];

      // 3. Firestore 업데이트
      const travelRef = doc(db, 'travels', travelId);
      const updates: any = {
        diaries: arrayUnion(newDiary),
        photos: allPhotos,
      };

      // 만약 여행 제목이 기본값이면 첫 일기 제목으로 변경
      if (travel?.title === '새로운 여행') {
        updates.title = title.trim();
      }

      await updateDoc(travelRef, updates);

      setPhotos(allPhotos); // 로컬 상태도 업데이트된 URL로 갱신
      if (travel && travel.title === '새로운 여행') {
        setTravel({ ...travel, title: title.trim(), diaries: [...(travel.diaries || []), newDiary], photos: allPhotos });
      } else if (travel) {
        setTravel({ ...travel, diaries: [...(travel.diaries || []), newDiary], photos: allPhotos });
      }
      setLoading(false);

      Alert.alert('저장 완료', '일기와 사진이 서버에 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save diary:', error);
      setLoading(false);
      Alert.alert('오류', '데이터 저장에 실패했습니다.');
    }
  };



  const generateStorybook = async () => {
    if (!travel) return;

    // 현재 화면의 내용을 포함하여 데이터 준비
    const allDiaries = [...(travel.diaries || [])];
    if (title.trim() && content.trim()) {
      allDiaries.push({ title, content, date: new Date().toISOString() } as DiaryEntry);
    }

    // 현재 선택된 사진들 (이미 로드된 + 새로 추가된)
    const allPhotos = photos;

    if (allDiaries.length === 0 || allPhotos.length === 0) {
      Alert.alert(
        '알림',
        '스토리북을 생성하려면 최소 한 건의 일기(제목+내용)와 사진이 필요합니다.',
      );
      return;
    }

    setLoading(true);
    try {
      // 1. 만약 새로 추가된 사진이 있다면 업로드부터 수행 (커버 이미지를 위해 필요할 수 있음)
      const uploadedPhotos = await uploadImages(allPhotos);
      setPhotos(uploadedPhotos);

      // 2. AI 스토리 생성
      const contents = allDiaries.map(d => `${d.title}\n${d.content}`);
      const aiStory = await generateAIStory(travel.title, contents, uploadedPhotos.length);


      const storybook = {
        travelId: travel.id,
        title: title.trim() || travel.title,
        content: aiStory,
        createdAt: new Date().toISOString(),
        coverImage: uploadedPhotos[0]?.uri || null,
        photos: uploadedPhotos.map(p => p.uri),
        userId: user?.uid,
      };


      const storybookRef = doc(collection(db, 'storybooks'));
      await setDoc(storybookRef, storybook);

      // 여행 제목 업데이트 (기본값인 경우)
      if (travel.title === '새로운 여행') {
        await updateDoc(doc(db, 'travels', travel.id), {
          title: title.trim() || travel.title
        });
      }

      setLoading(false);
      Alert.alert('생성 완료', '스토리북이 생성되었습니다!', [
        {
          text: '보기',
          onPress: () =>
            navigation.navigate('StorybookView', { storybookId: storybookRef.id }),
        },
        { text: '닫기', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Failed to generate storybook:', error);
      setLoading(false);
      Alert.alert('오류', '스토리북 생성에 실패했습니다.');
    }
  };







  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>당신의 소중한 이야기를 엮는 중입니다... ✨</Text>
      </View>
    );
  }

  return (

    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{travel?.title}</Text>
        <TouchableOpacity onPress={saveDiary} style={styles.headerButton}>
          <Text style={styles.saveButton}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="여행의 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#CCCCCC"
            multiline={false}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>오늘의 기록</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="오늘 어떤 일이 있었나요?"
            value={content}
            onChangeText={setContent}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor="#CCCCCC"
            underlineColorAndroid="transparent"
          />
        </View>


        <View style={styles.section}>
          <View style={styles.photoHeader}>
            <Text style={styles.label}>사진</Text>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.addPhotoButton}>+ 사진 추가</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosContainer}>
            {photos.map(photo => (
              <Image
                key={photo.id}
                source={{ uri: photo.uri }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateStorybook}>
          <Text style={styles.generateButtonText}>✨ 스토리북 생성하기</Text>
        </TouchableOpacity>

        {travel?.diaries && travel.diaries.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.label}>나의 이전 기록</Text>
            {travel.diaries.map((diary, index) => (
              <View key={diary.id || index} style={styles.historyCard}>
                <Text style={styles.historyTitle}>{diary.title}</Text>
                <Text style={styles.historyDate}>{new Date(diary.date).toLocaleDateString()}</Text>
                <Text style={styles.historyContent} numberOfLines={3}>{diary.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPhotoButton: {
    fontSize: 14,
    color: '#666666',
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  generateButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  historySection: {
    marginTop: 40,
    marginBottom: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 24,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  historyContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});


export default DiaryWriteScreen;
