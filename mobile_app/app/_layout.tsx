import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { AppColors } from '../src/constants/colors';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (loaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.softMint }}>
        <ActivityIndicator size="large" color={AppColors.purple} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: AppColors.white },
          headerTintColor: AppColors.gray900,
          headerTitleStyle: {
            fontFamily: loaded ? 'Poppins_700Bold' : undefined,
            fontSize: 18,
            fontWeight: '700',
          },
          contentStyle: { backgroundColor: AppColors.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Welcome to Yene Teacher' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="words" options={{ title: 'Learn Words' }} />
        <Stack.Screen name="tutor" options={{ title: 'Talk with Tutor' }} />
        <Stack.Screen name="parent" options={{ headerShown: false }} />
        <Stack.Screen name="parent-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="stories" options={{ title: 'Stories' }} />
        <Stack.Screen name="story-reader" options={{ title: 'Story' }} />
        <Stack.Screen name="games" options={{ title: 'Mini-Games Arcade' }} />
        <Stack.Screen name="game/shape-match" options={{ title: 'Shape Match', headerShown: false }} />
        <Stack.Screen name="game/word-spell" options={{ title: 'Word Spell', headerShown: false }} />
        <Stack.Screen name="game/counting" options={{ title: 'Count & Math', headerShown: false }} />
        <Stack.Screen name="game/logic-puzzle" options={{ title: 'Logic Quest', headerShown: false }} />
        <Stack.Screen name="teacher-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="knowledge" options={{ title: 'Knowledge' }} />
        <Stack.Screen name="knowledge/[id]" options={{ title: 'Knowledge Details' }} />
      </Stack>
    </View>
  );
}

