import React, {useState, useEffect} from 'react';
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {Travel, DiaryEntry, Photo} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DiaryWriteRouteProp = RouteProp<RootStackParamList, 'DiaryWrite'>;

const DiaryWriteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DiaryWriteRouteProp>();
  const {travelId} = route.params;

  const [travel, setTravel] = useState<Travel | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    loadTravel();
  }, []);

  const loadTravel = async () => {
    try {
      const stored = await AsyncStorage.getItem('travels');
      if (stored) {
        const travels: Travel[] = JSON.parse(stored);
        const found = travels.find(t => t.id === travelId);
        if (found) {
          setTravel(found);
          setPhotos(found.photos);
        }
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

  const saveDiary = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('travels');
      if (stored) {
        const travels: Travel[] = JSON.parse(stored);
        const index = travels.findIndex(t => t.id === travelId);

        if (index !== -1) {
          const newDiary: DiaryEntry = {
            id: Date.now().toString(),
            title,
            content,
            date: new Date().toISOString(),
          };

          travels[index].diaries.push(newDiary);
          travels[index].photos = photos;

          await AsyncStorage.setItem('travels', JSON.stringify(travels));
          Alert.alert('저장 완료', '일기가 저장되었습니다.', [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to save diary:', error);
      Alert.alert('오류', '일기 저장에 실패했습니다.');
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
      // 스토리북 생성 로직 (향후 AI API 연동)
      const storybook = {
        id: Date.now().toString(),
        travelId: travel.id,
        title: `${travel.title}의 이야기`,
        content: generateStorybookContent(travel),
        createdAt: new Date().toISOString(),
        coverImage: travel.photos[0]?.uri,
      };

      const storedStorybooks = await AsyncStorage.getItem('storybooks');
      const storybooks = storedStorybooks ? JSON.parse(storedStorybooks) : [];
      storybooks.push(storybook);
      await AsyncStorage.setItem('storybooks', JSON.stringify(storybooks));

      Alert.alert('생성 완료', '스토리북이 생성되었습니다!', [
        {
          text: '보기',
          onPress: () =>
            navigation.navigate('StorybookView', {storybookId: storybook.id}),
        },
        {text: '닫기', style: 'cancel'},
      ]);
    } catch (error) {
      console.error('Failed to generate storybook:', error);
      Alert.alert('오류', '스토리북 생성에 실패했습니다.');
    }
  };

  const generateStorybookContent = (travelData: Travel): string => {
    // 간단한 스토리북 생성 (향후 AI로 개선)
    let story = `# ${travelData.title}의 여행 이야기\n\n`;

    travelData.diaries.forEach((diary, index) => {
      story += `## ${diary.title}\n`;
      story += `${diary.content}\n\n`;
      if (index < travelData.photos.length) {
        story += `[사진 ${index + 1}]\n\n`;
      }
    });

    return story;
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
                source={{uri: photo.uri}}
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
