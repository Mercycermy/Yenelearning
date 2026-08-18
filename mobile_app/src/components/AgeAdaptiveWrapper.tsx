import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';

interface AgeAdaptiveWrapperProps {
  gradeLevel: string; // 'KG' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4'
  onSelectAction: (route: string) => void;
  children: React.ReactNode;
}

export function AgeAdaptiveWrapper({
  gradeLevel,
  onSelectAction,
  children,
}: AgeAdaptiveWrapperProps) {
  const isKG = gradeLevel === 'KG';

  if (!isKG) {
    // Grade 1-4 Mode: Full Duolingo Roadmap Path
    return <>{children}</>;
  }

  // KG Mode (Ages 4-6): Zero-text / Visual-first audio tiles
  const kgActions = [
    { title: 'ድምፅ እና ፊደል', subtitle: 'Listen & Say', icon: 'volume-medium' as const, color: AppColors.purple, bg: AppColors.softPurple, route: '/words' },
    { title: 'ተረት ተረት', subtitle: 'Listen to Story', icon: 'headset' as const, color: AppColors.blue, bg: AppColors.softBlue, route: '/stories' },
    { title: 'ጨዋታ', subtitle: 'Touch & Win', icon: 'happy' as const, color: AppColors.yellow, bg: AppColors.softYellow, route: '/games' },
    { title: 'አበበ', subtitle: 'Talk to Abebe', icon: 'mic' as const, color: AppColors.green, bg: AppColors.softGreen, route: '/tutor' },
  ];

  return (
    <View style={styles.kgContainer}>
      <View style={styles.kgHeader}>
        <Ionicons name="sparkles" size={28} color="#F59E0B" />
        <Text style={styles.kgTitle}>KG Visual Explorer</Text>
        <Text style={styles.kgSubtitle}>Touch any icon to listen and learn!</Text>
      </View>

      <View style={styles.kgGrid}>
        {kgActions.map((action) => (
          <Pressable
            key={action.title}
            onPress={() => onSelectAction(action.route)}
            style={({ pressed }) => [
              styles.kgTile,
              {
                backgroundColor: action.bg,
                borderColor: action.color,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle}>{action.title}</Text>
            <Text style={styles.tileSubtitle}>{action.subtitle}</Text>

            <View style={styles.audioPlayBadge}>
              <Ionicons name="play" size={14} color="#FFF" />
              <Text style={styles.audioPlayText}>TAP</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kgContainer: {
    padding: 16,
    alignItems: 'center',
  },
  kgHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  kgTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1F2937',
    marginTop: 6,
  },
  kgSubtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  kgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    maxWidth: 540,
  },
  kgTile: {
    width: '46%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
  },
  tileSubtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 2,
  },
  audioPlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    gap: 4,
  },
  audioPlayText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});
