import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { demoApiService as apiService } from '../services/demo-api';
import { Spider } from '../types';

interface CollectionScreenProps {
  onBack: () => void;
  onSpiderSelect: (spider: Spider) => void;
}

export default function CollectionScreen({ onBack, onSpiderSelect }: CollectionScreenProps) {
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSpiders();
  }, []);

  const loadSpiders = async () => {
    try {
      const response = await apiService.getSpiderCollection();
      setSpiders(response.spiders);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load spider collection');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSpiders();
    setRefreshing(false);
  };

  const toggleSpiderActive = async (spider: Spider) => {
    try {
      await apiService.setSpiderActive(spider.id, !spider.isActive);
      await loadSpiders(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update spider status');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      'common': '#9e9e9e',
      'uncommon': '#4caf50',
      'rare': '#2196f3',
      'epic': '#9c27b0',
      'legendary': '#ff9800',
    };
    return colors[rarity] || '#9e9e9e';
  };

  const getSizeIcon = (size: string) => {
    const icons: { [key: string]: string } = {
      'tiny': '🔍',
      'small': '🕷️',
      'medium': '🕸️',
      'large': '🦂',
      'giant': '🦴',
    };
    return icons[size] || '🕷️';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Spiders ({spiders.length})</Text>
      </View>

      {spiders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🕷️</Text>
          <Text style={styles.emptyTitle}>No spiders yet!</Text>
          <Text style={styles.emptySubtitle}>
            Start capturing spiders to build your collection
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.grid}>
            {spiders.map((spider) => (
              <TouchableOpacity
                key={spider.id}
                style={[
                  styles.spiderCard,
                  spider.isActive && styles.activeSpiderCard
                ]}
                onPress={() => onSpiderSelect(spider)}
                onLongPress={() => toggleSpiderActive(spider)}
              >
                <View style={styles.spiderImageContainer}>
                  {spider.image ? (
                    <Image source={{ uri: spider.image }} style={styles.spiderImage} />
                  ) : (
                    <Text style={styles.spiderPlaceholder}>🕷️</Text>
                  )}
                  {spider.isActive && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeText}>⚔️</Text>
                    </View>
                  )}
                </View>

                <View style={styles.spiderInfo}>
                  <Text style={styles.spiderName} numberOfLines={1}>
                    {spider.name}
                  </Text>
                  <Text style={styles.spiderSpecies} numberOfLines={1}>
                    {spider.commonName}
                  </Text>
                  
                  <View style={styles.spiderStats}>
                    <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(spider.rarity) }]}>
                      <Text style={styles.rarityText}>
                        {spider.rarity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.sizeText}>
                      {getSizeIcon(spider.size.category)}
                    </Text>
                  </View>

                  <View style={styles.powerRow}>
                    <Text style={styles.powerText}>⚡ {spider.powerLevel}</Text>
                    <Text style={styles.levelText}>Lv.{spider.level}</Text>
                  </View>

                  <View style={styles.battleRecord}>
                    <Text style={styles.recordText}>
                      {spider.battlesWon}W • {spider.battlesLost}L
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Long press a spider to activate/deactivate for battles
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#ff6b35',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  spiderCard: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    margin: '1%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  activeSpiderCard: {
    borderColor: '#ff6b35',
    borderWidth: 2,
    backgroundColor: '#2a2a2a',
  },
  spiderImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  spiderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  spiderPlaceholder: {
    fontSize: 40,
    width: 80,
    height: 80,
    textAlign: 'center',
    lineHeight: 80,
  },
  activeIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    fontSize: 12,
  },
  spiderInfo: {
    alignItems: 'center',
  },
  spiderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  spiderSpecies: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 8,
  },
  spiderStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sizeText: {
    fontSize: 16,
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  powerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  levelText: {
    fontSize: 12,
    color: '#cccccc',
  },
  battleRecord: {
    alignItems: 'center',
  },
  recordText: {
    fontSize: 10,
    color: '#999999',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});