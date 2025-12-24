import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { collection, onSnapshot, query, addDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Travel, RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TravelCardProps {
  travel: Travel;
  onPress: () => void;
}

const TravelCard = ({ travel, onPress }: TravelCardProps) => {
  const hasContent = travel.diaries.length > 0 || travel.photos.length > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{travel.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{travel.startDate}</Text>
          {hasContent && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>스토리북 생성완료</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const travelsRef = collection(db(), 'travels');
    const q = query(travelsRef, orderBy('startDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const travelsData: Travel[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Travel[];
      setTravels(travelsData);
    }, (error) => {
      console.error('Firestore snapshot error:', error);
    });

    return unsubscribe;
  }, [user]);

  const createNewTravel = async () => {
    if (!user) return;

    try {
      const newTravel = {
        title: '새로운 여행',
        startDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        diaries: [],
        photos: [],
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db(), 'travels'), newTravel);
    } catch (error) {
      console.error('Failed to create travel:', error);
      Alert.alert('오류', '새 여행 생성에 실패했습니다.');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Travel Story</Text>
        <View style={styles.userSection}>
          <Text style={styles.userName}>{user?.isAnonymous ? '익명 사용자' : user?.displayName || '사용자'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>나의 여행</Text>
          <Text style={styles.subtitle}>
            지금까지 여행을 했던 곳을 기록해보세요
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={createNewTravel}
          activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ 새 여행 만들기</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}>
          {travels.map(travel => (
            <TravelCard key={travel.id} travel={travel} onPress={() => navigation.navigate('DiaryWrite', { travelId: travel.id })} />
          ))}
        </ScrollView>
      </View>
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
    backgroundColor: '#FAF9F6',
  },
  logo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 13,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
  },
  createButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    minHeight: 100,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    color: '#666666',
  },
});

export default HomeScreen;
