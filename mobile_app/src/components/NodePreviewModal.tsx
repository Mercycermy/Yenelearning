import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';
import { LessonNodeData, ChapterData } from './DuolingoRoadmapPath';

interface NodePreviewModalProps {
  visible: boolean;
  node: LessonNodeData | null;
  chapter: ChapterData | null;
  onClose: () => void;
  onStartLesson: (node: LessonNodeData, chapter: ChapterData) => void;
}

export function NodePreviewModal({
  visible,
  node,
  chapter,
  onClose,
  onStartLesson,
}: NodePreviewModalProps) {
  if (!node || !chapter) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Theme Icon */}
          <View style={[styles.iconCircle, { backgroundColor: chapter.themeColor || AppColors.green }]}>
            <Ionicons name={(node.icon as any) || 'star'} size={40} color="#FFFFFF" />
          </View>

          <Text style={styles.amharicTitle}>{node.titleAmharic}</Text>
          <Text style={styles.englishTitle}>{node.title}</Text>
          <Text style={styles.description}>
            {node.description || 'Complete short micro-tasks to earn stars and level up!'}
          </Text>

          {/* Lesson Metadata Badges */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.metaText}>+{node.starReward || 15} Stars</Text>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="time" size={18} color="#3B82F6" />
              <Text style={styles.metaText}>3 Mins</Text>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="layers" size={18} color="#8B5CF6" />
              <Text style={styles.metaText}>4 Tasks</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable
            onPress={() => {
              onClose();
              onStartLesson(node, chapter);
            }}
            style={({ pressed }) => [
              styles.startBtn,
              { transform: [{ translateY: pressed ? 3 : 0 }] },
            ]}
          >
            <Text style={styles.startBtnText}>START LESSON 🚀</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  amharicTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
  },
  englishTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 2,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  metaText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#374151',
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    borderBottomWidth: 6,
    borderBottomColor: '#047857',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  startBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#9CA3AF',
  },
});
