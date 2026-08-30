import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';

export interface LessonNodeData {
  id: string;
  title: string;
  titleAmharic: string;
  type: 'STORY' | 'WORD_GAME' | 'MATH_SHAPES' | 'AI_TALK' | 'LOGIC_PUZZLE';
  icon: string;
  starReward: number;
  description?: string;
}

export interface ChapterData {
  id: string;
  monthNumber: number;
  titleAmharic: string;
  titleEnglish: string;
  themeColor: string;
  isLocked?: boolean;
  status: string;
  nodes: LessonNodeData[];
  completedNodeIds?: string[];
}

interface DuolingoRoadmapPathProps {
  chapters: ChapterData[];
  activeNodeId?: string;
  onSelectNode: (node: LessonNodeData, chapter: ChapterData) => void;
}

export function DuolingoRoadmapPath({
  chapters,
  activeNodeId,
  onSelectNode,
}: DuolingoRoadmapPathProps) {
  const { width } = useWindowDimensions();

  // Calculate sine-wave curved node positions for Duolingo snake path
  const getNodeOffset = (index: number) => {
    const offsets = [0, 45, 75, 45, 0, -45, -75, -45];
    return offsets[index % offsets.length];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {[...chapters].reverse().map((chapter) => {
        const completedIds = chapter.completedNodeIds || [];
        return (
          <View key={chapter.id} style={styles.chapterSection}>
            {/* Chapter Header Banner */}
            <View
              style={[
                styles.chapterBanner,
                { backgroundColor: chapter.themeColor || AppColors.green },
              ]}
            >
              <View style={styles.bannerTextCol}>
                <Text style={styles.chapterAmharic}>{chapter.titleAmharic}</Text>
                <Text style={styles.chapterEnglish}>{chapter.titleEnglish}</Text>
              </View>
              {chapter.isLocked ? (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={16} color="#FFF" />
                  <Text style={styles.lockText}>Locked</Text>
                </View>
              ) : (
                <View style={styles.starBadge}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.starBadgeText}>
                    {completedIds.length} / {chapter.nodes.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Path Nodes */}
            <View style={styles.nodesColumn}>
              {chapter.nodes.map((node, nIdx) => {
                const isCompleted = completedIds.includes(node.id);
                const isActive = activeNodeId === node.id || (!isCompleted && nIdx === 0);
                const isNodeLocked = chapter.isLocked || (!isCompleted && nIdx > completedIds.length);
                const xOffset = getNodeOffset(nIdx);

                let btnBg = chapter.themeColor || AppColors.green;
                let shadowColor = '#059669';

                if (isCompleted) {
                  btnBg = '#10B981';
                  shadowColor = '#047857';
                } else if (isActive) {
                  btnBg = '#F59E0B';
                  shadowColor = '#D97706';
                } else if (isNodeLocked) {
                  btnBg = '#9CA3AF';
                  shadowColor = '#6B7280';
                }

                return (
                  <View
                    key={node.id}
                    style={[
                      styles.nodeRow,
                      { transform: [{ translateX: xOffset }] },
                    ]}
                  >
                    {/* Pulsing Ring for Active Node */}
                    {isActive && <View style={styles.activeGlowRing} />}

                    <Pressable
                      disabled={isNodeLocked}
                      onPress={() => onSelectNode(node, chapter)}
                      style={({ pressed }) => [
                        styles.nodeButton,
                        {
                          backgroundColor: btnBg,
                          borderBottomColor: shadowColor,
                          transform: [{ translateY: pressed ? 4 : 0 }],
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isNodeLocked
                            ? 'lock-closed'
                            : isCompleted
                            ? 'checkmark-sharp'
                            : (node.icon as any) || 'book'
                        }
                        size={28}
                        color="#FFFFFF"
                      />
                      {isCompleted && (
                        <View style={styles.starsTag}>
                          <Text style={styles.starsTagText}>★★★</Text>
                        </View>
                      )}
                    </Pressable>

                    {/* Node Title Label */}
                    <View style={styles.labelBubble}>
                      <Text style={styles.labelText}>{node.titleAmharic}</Text>
                      <Text style={styles.subLabelText}>+{node.starReward} ★</Text>
                    </View>

                    {/* Treasure Chest Milestone every 4 nodes */}
                    {(nIdx + 1) % 4 === 0 && (
                      <View style={styles.chestRow}>
                        <View style={styles.chestBox}>
                          <Ionicons name="gift" size={32} color="#F59E0B" />
                          <Text style={styles.chestText}>Reward Chest</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  chapterSection: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginBottom: 32,
  },
  chapterBanner: {
    width: '92%',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerTextCol: {
    flex: 1,
  },
  chapterAmharic: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  chapterEnglish: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  lockText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  starBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  nodesColumn: {
    alignItems: 'center',
    gap: 28,
  },
  nodeRow: {
    alignItems: 'center',
    position: 'relative',
  },
  activeGlowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    top: -6,
  },
  nodeButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    elevation: 6,
  },
  starsTag: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FEF08A',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  starsTagText: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: 'bold',
  },
  labelBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  labelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#1F2937',
  },
  subLabelText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#D97706',
  },
  chestRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  chestBox: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  chestText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#B45309',
    marginTop: 4,
  },
});
