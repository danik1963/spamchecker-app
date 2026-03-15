import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { getStats, Stats } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const platformKeys = ['phone', 'instagram', 'whatsapp', 'telegram'] as const;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, todayReports: 0, confirmedScammers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const navigation = useNavigation<any>();
  const { t, language, setLanguage } = useLanguage();

  const platforms = [
    { key: 'phone', label: t('home.platforms.phone'), icon: 'call', color: '#4CAF50' },
    { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
    { key: 'telegram', label: 'Telegram', icon: 'paper-plane', color: '#0088cc' },
  ];

  // Загрузка статистики при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  // Auto-refresh каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('RecordDetails', { 
        identifier: searchQuery.trim(),
        platform: 'phone',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Кнопка выбора языка */}
      <TouchableOpacity 
        style={styles.languageButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <Ionicons name="globe-outline" size={20} color="#6C63FF" />
        <Text style={styles.languageButtonText}>
          {language === 'ru' ? 'RU' : 'KZ'}
        </Text>
      </TouchableOpacity>

      {/* Модальное окно выбора языка */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            
            <TouchableOpacity 
              style={[styles.languageOption, language === 'ru' && styles.languageOptionActive]}
              onPress={() => {
                setLanguage('ru');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageOptionText}>{t('settings.languages.ru')}</Text>
              {language === 'ru' && <Ionicons name="checkmark" size={20} color="#6C63FF" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.languageOption, language === 'kk' && styles.languageOptionActive]}
              onPress={() => {
                setLanguage('kk');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageOptionText}>{t('settings.languages.kk')}</Text>
              {language === 'kk' && <Ionicons name="checkmark" size={20} color="#6C63FF" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
        }
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={64} color="#6C63FF" />
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>
            {t('home.subtitle')}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('home.platforms.title')}</Text>
        
        <View style={styles.platformsGrid}>
          {platforms.map((platform) => {
            const getScreenName = (key: string) => {
              const screenMap: Record<string, string> = {
                'phone': 'Phones',
                'instagram': 'Instagram',
                'whatsapp': 'WhatsApp',
                'telegram': 'Telegram',
              };
              return screenMap[key] || key;
            };
            
            return (
              <TouchableOpacity
                key={platform.key}
                style={[styles.platformCard, { borderColor: platform.color }]}
                onPress={() => navigation.navigate(getScreenName(platform.key))}
              >
                <Ionicons 
                  name={platform.icon as any} 
                  size={32} 
                  color={platform.color} 
                />
                <Text style={styles.platformLabel}>{platform.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Text style={styles.statNumber}>{stats.totalRecords.toLocaleString()}</Text>
            )}
            <Text style={styles.statLabel}>{t('home.stats.records')}</Text>
          </View>
          <View style={styles.statItem}>
            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Text style={styles.statNumber}>{stats.todayReports.toLocaleString()}</Text>
            )}
            <Text style={styles.statLabel}>{t('home.stats.todayReports')}</Text>
          </View>
          <View style={styles.statItem}>
            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" />
            ) : (
              <Text style={styles.statNumber}>{stats.confirmedScammers.toLocaleString()}</Text>
            )}
            <Text style={styles.statLabel}>{t('home.stats.scammers')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  languageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    gap: 6,
  },
  languageButtonText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: '#6C63FF20',
  },
  languageOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  platformCard: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  platformLabel: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
