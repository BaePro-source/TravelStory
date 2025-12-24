import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';

import { launchImageLibrary } from 'react-native-image-picker';
import { Travel, DiaryEntry, Photo } from '../types';
import { generateAIStory } from '../services/aiService';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DiaryWriteRouteProp = RouteProp<RootStackParamList, 'DiaryWrite'>;

const DiaryWriteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DiaryWriteRouteProp>();

  const { travelId } = route.params;
  const user = auth.currentUser;

  const [travel, setTravel] = useState<Travel | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

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
        selectionLimit: 10,
      },
      response => {
        if (response.assets) {
          const newPhotos: Photo[] = response.assets.map(asset => ({
            id: Date.now().toString() + Math.random(),
            uri: asset.uri || '',
            date: new Date().toISOString(),
          }));
          setPhotos([...photos, ...newPhotos]);
        }
      },
    );
  };

  const uploadImages = async (localPhotos: Photo[]): Promise<Photo[]> => {
    const uploadedPhotos: Photo[] = [];

    for (const photo of localPhotos) {
      if (photo.uri.startsWith('http')) {
        uploadedPhotos.push(photo);
        continue;
      }

      try {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const fileName = photo.id || Date.now().toString();
        const storageRef = ref(storage, `photos/${user?.uid}/${fileName}`);

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        uploadedPhotos.push({
          ...photo,
          uri: downloadURL,
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
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
      // 1. 이미지 먼저 업로드
      const uploadedPhotos = await uploadImages(photos);

      const newDiary: DiaryEntry = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString(),
      };

      // 2. Firestore 업데이트
      const travelRef = doc(db, 'travels', travelId);
      await updateDoc(travelRef, {
        diaries: arrayUnion(newDiary),
        photos: uploadedPhotos, // 모든 사진 정보를 업데이트 (기존 + 새 사진 포함된 상태)
      });

      setPhotos(uploadedPhotos); // 로컬 상태도 업데이트된 URL로 갱신

      Alert.alert('저장 완료', '일기와 사진이 서버에 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save diary:', error);
      Alert.alert('오류', '데이터 저장에 실패했습니다.');
    }
  };



  const generateStorybook = async () => {
    if (!travel) return;

    if (travel.diaries.length === 0 || travel.photos.length === 0) {
      Alert.alert(
        '알림',
        '스토리북을 생성하려면 일기와 사진이 모두 필요합니다.',
      );
      return;
    }

    try {
      const contents = travel.diaries.map(d => `${d.title}\n${d.content}`);
      const aiStory = await generateAIStory(travel.title, contents);

      const storybook = {
        travelId: travel.id,
        title: `${travel.title}의 이야기`,
        content: aiStory,
        createdAt: new Date().toISOString(),
        coverImage: travel.photos[0]?.uri || null,
        userId: user?.uid,
      };

      const storybookRef = doc(collection(db, 'storybooks'));
      await setDoc(storybookRef, storybook);


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
      Alert.alert('오류', '스토리북 생성에 실패했습니다.');
    }
  };






  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{travel?.title}</Text>
        <TouchableOpacity onPress={saveDiary}>
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
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />

        </View>

        <View style={styles.section}>
          <Text style={styles.label}>오늘의 기록</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="오늘 어떤 일이 있었나요?"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#CCCCCC"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
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
    paddingVertical: 16,
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
});

export default DiaryWriteScreen;
