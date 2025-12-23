import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Storybook} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StorybookViewRouteProp = RouteProp<RootStackParamList, 'StorybookView'>;

const StorybookViewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StorybookViewRouteProp>();
  const {storybookId} = route.params;

  const [storybook, setStorybook] = useState<Storybook | null>(null);

  useEffect(() => {
    loadStorybook();
  }, []);

  const loadStorybook = async () => {
    try {
      const stored = await AsyncStorage.getItem('storybooks');
      if (stored) {
        const storybooks: Storybook[] = JSON.parse(stored);
        const found = storybooks.find(s => s.id === storybookId);
        if (found) {
          setStorybook(found);
        }
      }
    } catch (error) {
      console.error('Failed to load storybook:', error);
    }
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
        <View style={{width: 50}} />
      </View>

      <ScrollView style={styles.content}>
        {storybook.coverImage && (
          <Image
            source={{uri: storybook.coverImage}}
            style={styles.coverImage}
          />
        )}

        <View style={styles.titleSection}>
          <Text style={styles.title}>{storybook.title}</Text>
          <Text style={styles.date}>
            {new Date(storybook.createdAt).toLocaleDateString('ko-KR')}
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
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
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
