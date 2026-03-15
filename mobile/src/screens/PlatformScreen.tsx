import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getRecentRecords, Platform, SpamRecord } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface PlatformScreenProps {
  platform: Platform;
}

const platformConfig: Record<Platform, { icon: string; color: string }> = {
  phone: { icon: 'call', color: '#4CAF50' },
  instagram: { icon: 'logo-instagram', color: '#E1306C' },
  whatsapp: { icon: 'logo-whatsapp', color: '#25D366' },
  telegram: { icon: 'paper-plane', color: '#0088cc' },
};

const categoryColors: Record<string, string> = {
  spam: '#FF9800',
  fraud: '#F44336',
  scam: '#E91E63',
  fake: '#9C27B0',
  unknown: '#607D8B',
};

export default function PlatformScreen({ platform }: PlatformScreenProps) {
  const { t } = useLanguage();
  const [records, setRecords] = useState<SpamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const config = platformConfig[platform];

  // Обновление при фокусе на экране (real-time)
  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [platform])
  );

  // Auto-refresh каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      loadRecords(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [platform]);

  const loadRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getRecentRecords(platform, 20);
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const renderRecord = ({ item }: { item: SpamRecord }) => {
    const categoryColor = categoryColors[item.category] || categoryColors.unknown;
    
    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => navigation.navigate('RecordDetails', { 
          recordId: item.id,
          identifier: item.identifier,
          platform: item.platform,
        })}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.identifier}>{item.identifier}</Text>
          <View style={styles.tags}>
            <View style={[styles.categoryTag, { backgroundColor: categoryColor + '30' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {t('recordDetails.category.' + item.category)}
              </Text>
            </View>
            <Text style={styles.reportsCount}>{item.reportsCount} {t('platform.reports')}</Text>
          </View>
        </View>
        {item.status === 'confirmed' && (
          <Ionicons name="shield-checkmark" size={20} color="#F44336" />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>{t('platform.emptyList')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  identifier: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportsCount: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    fontSize: 16,
  },
});
