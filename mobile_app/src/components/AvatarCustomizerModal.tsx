import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';

export interface AvatarItemData {
  id: string;
  name: string;
  nameAmharic: string;
  category: 'HAT' | 'OUTFIT' | 'ACCESSORY';
  starCost: number;
  iconName: string;
  color: string;
}

interface AvatarCustomizerModalProps {
  visible: boolean;
  onClose: () => void;
  stars: number;
  items: AvatarItemData[];
  equippedConfig: { equippedHat?: string; equippedOutfit?: string; skinColor?: string };
  onEquipItem: (item: AvatarItemData) => void;
}

export function AvatarCustomizerModal({
  visible,
  onClose,
  stars,
  items,
  equippedConfig,
  onEquipItem,
}: AvatarCustomizerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'HAT' | 'OUTFIT' | 'ACCESSORY'>('HAT');

  const filteredItems = items.filter((item) => item.category === selectedCategory);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="color-palette" size={24} color={AppColors.purple} />
              <Text style={styles.title}>Avatar Dressing Room</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Stars Count Display */}
          <View style={styles.starsBar}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.starsText}>{stars} Stars Available</Text>
          </View>

          {/* Avatar Preview Box */}
          <View style={styles.previewBox}>
            <Image
              source={{ uri: 'https://api.dicebear.com/9.x/bottts/png?seed=Abebe' }}
              style={styles.avatarImage}
            />
            {equippedConfig.equippedHat && (
              <View style={styles.equippedHatBadge}>
                <Ionicons name={equippedConfig.equippedHat as any} size={24} color="#FFF" />
              </View>
            )}
            <Text style={styles.previewText}>Customized Abebe Tutor</Text>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsRow}>
            {(['HAT', 'OUTFIT', 'ACCESSORY'] as const).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.tabBtn,
                  selectedCategory === cat && styles.tabBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === cat && styles.tabTextActive,
                  ]}
                >
                  {cat === 'HAT' ? 'Hats 🧢' : cat === 'OUTFIT' ? 'Outfits 👕' : 'Items 👓'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Items Grid */}
          <ScrollView contentContainerStyle={styles.itemsGrid}>
            {filteredItems.map((item) => {
              const isEquipped =
                (item.category === 'HAT' && equippedConfig.equippedHat === item.iconName) ||
                (item.category === 'OUTFIT' && equippedConfig.equippedOutfit === item.iconName);

              const canAfford = stars >= item.starCost;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onEquipItem(item)}
                  style={[
                    styles.itemCard,
                    isEquipped && styles.itemCardEquipped,
                  ]}
                >
                  <View style={[styles.itemIconCircle, { backgroundColor: item.color }]}>
                    <Ionicons name={item.iconName as any} size={28} color="#FFF" />
                  </View>
                  <Text style={styles.itemNameAmharic}>{item.nameAmharic}</Text>
                  <Text style={styles.itemNameEnglish}>{item.name}</Text>

                  <View style={styles.costBadge}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.costText}>{item.starCost}</Text>
                  </View>

                  {isEquipped && (
                    <View style={styles.equippedTag}>
                      <Text style={styles.equippedTagText}>Equipped</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1F2937',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  starsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  starsText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#B45309',
  },
  previewBox: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  equippedHatBadge: {
    position: 'absolute',
    top: 10,
    right: '38%',
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 4,
  },
  previewText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#065F46',
    marginTop: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: AppColors.purple,
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  itemCardEquipped: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  itemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNameAmharic: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1F2937',
  },
  itemNameEnglish: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  costText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#D97706',
  },
  equippedTag: {
    marginTop: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  equippedTagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
