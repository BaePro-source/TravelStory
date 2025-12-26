import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, query, addDoc, orderBy, where, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { db, auth } from '../config/firebase';
import { Travel, RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TravelCardProps {
  travel: Travel;
  onPress: () => void;
  onDelete: (id: string) => void;
}


const TravelCard = ({ travel, onPress, onDelete }: TravelCardProps) => {
  const hasContent = travel.diaries.length > 0 || travel.photos.length > 0;

  return (
    <View style={styles.cardContainer}>
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
      <TouchableOpacity
        style={styles.deleteIconButton}
        onPress={() => onDelete(travel.id)}>
        <Text style={styles.deleteIconText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};


const HomeScreen = () => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const travelsRef = collection(db, 'travels');

    const q = query(
      travelsRef,
      where('userId', '==', user.uid)
    );


    const unsubscribe = onSnapshot(q, (snapshot) => {
      const travelsData: Travel[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Travel[];

      // 인덱스 오류 방지를 위해 메모리상에서 정렬
      travelsData.sort((a, b) => b.startDate.localeCompare(a.startDate));

      setTravels(travelsData);

    }, (error) => {
      console.error('Firestore snapshot error:', error);
    });

    return unsubscribe;
  }, [user]);

  const createNewTravel = async () => {
    if (!user || isCreating) return;

    setIsCreating(true);
    try {
      const newTravel = {
        title: '새로운 여행',
        startDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        diaries: [],
        photos: [],
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'travels'), newTravel);
      Alert.alert('알림', '새로운 여행이 생성되었습니다.');
    } catch (error) {
      console.error('Failed to create travel:', error);
      Alert.alert('오류', '새 여행 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTravel = (id: string) => {
    Alert.alert(
      '여행 삭제',
      '정말로 이 여행 기록을 삭제하시겠습니까? 관련 스토리북도 함께 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. 관련 스토리북 모두 찾아서 삭제
              const storybooksRef = collection(db, 'storybooks');
              const q = query(storybooksRef, where('travelId', '==', id));
              const querySnapshot = await getDocs(q);

              const deletePromises = querySnapshot.docs.map(item => deleteDoc(item.ref));
              await Promise.all(deletePromises);

              // 2. 여행 기록 자체를 삭제
              await deleteDoc(doc(db, 'travels', id));

              Alert.alert('알림', '기록이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to delete travel:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert('알림', '로그아웃 되었습니다.');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Travel Story</Text>
        <View style={styles.userSection}>
          <Text style={styles.userName}>{user?.isAnonymous ? '익명 사용자' : user?.displayName || '사용자'}</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
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
          style={[styles.createButton, isCreating && styles.disabledButton]}
          onPress={createNewTravel}
          activeOpacity={0.8}
          disabled={isCreating}>
          <Text style={styles.createButtonText}>
            {isCreating ? '생성 중...' : '+ 새 여행 만들기'}
          </Text>
        </TouchableOpacity>


        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}>
          {travels.map(travel => (
            <TravelCard
              key={travel.id}
              travel={travel}
              onPress={() => navigation.navigate('DiaryWrite', { travelId: travel.id })}
              onDelete={deleteTravel}
            />
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
    marginRight: 12,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
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
  disabledButton: {
    backgroundColor: '#999999',
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
  cardContainer: {
    width: '48%',
    marginBottom: 16,
    position: 'relative',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  deleteIconButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
  },
  deleteIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});


export default HomeScreen;
