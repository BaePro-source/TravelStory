// src/screens/LoginScreen.tsx
// 로그인 화면 - Google 로그인

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { auth, WEB_CLIENT_ID } from '../config/firebase';
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { theme } from '../styles/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  // Google Sign-In 설정
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
    });
  }, []);


  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      console.log('익명 로그인 성공!');
      // onAuthStateChanged가 자동으로 감지하여 Home으로 이동됨
    } catch (error: any) {
      console.error('익명 로그인 실패:', error);
      Alert.alert('오류', `로그인에 실패했습니다: ${error.message}`);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Google 로그인 시작
      const signInResult = await GoogleSignin.signIn();

      // idToken 안전하게 추출
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('ID Token을 가져오지 못했습니다.');
      }

      // Firebase 인증
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      console.log('Google 로그인 성공!');
      // onAuthStateChanged가 자동으로 감지하여 Home으로 이동됨
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      Alert.alert('오류', `Google 로그인에 실패했습니다: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="로그인 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 로고 영역 */}
        <View style={styles.logoSection}>
          <Text style={styles.emoji}>✈️</Text>
          <Text style={styles.title}>여행 이야기</Text>
          <Text style={styles.subtitle}>
            당신의 여행을 기록하고{'\n'}
            특별한 추억을 만들어보세요
          </Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.anonymousButton}
            onPress={handleAnonymousLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.anonymousIcon}>🎭</Text>
            <Text style={styles.anonymousButtonText}>익명으로 시작하기</Text>
          </TouchableOpacity>

          <Text style={styles.privacy}>
            로그인하면 서비스 이용약관 및{'\n'}
            개인정보 처리방침에 동의하게 됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    paddingBottom: theme.spacing.xl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  googleIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  googleButtonText: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  anonymousIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  anonymousButtonText: {
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  privacy: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});