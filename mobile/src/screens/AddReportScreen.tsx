import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportRecord, Platform } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const platformConfigs: { key: Platform; icon: string; color: string }[] = [
  { key: 'phone', icon: 'call', color: '#4CAF50' },
  { key: 'instagram', icon: 'logo-instagram', color: '#E1306C' },
  { key: 'whatsapp', icon: 'logo-whatsapp', color: '#25D366' },
  { key: 'telegram', icon: 'paper-plane', color: '#0088cc' },
];

const categoryConfigs = [
  { key: 'spam', icon: 'megaphone', color: '#FF9800' },
  { key: 'fraud', icon: 'warning', color: '#F44336' },
  { key: 'scam', icon: 'alert-circle', color: '#E91E63' },
  { key: 'fake', icon: 'person-remove', color: '#9C27B0' },
];

export default function AddReportScreen() {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<Platform>('phone');
  const [identifier, setIdentifier] = useState('');
  const [category, setCategory] = useState('spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      Alert.alert(t('common.error'), t('addReport.identifier.' + platform));
      return;
    }

    setLoading(true);
    try {
      await reportRecord(identifier.trim(), platform, category, description || undefined);
      Alert.alert(t('addReport.success'), '', [
        { text: 'OK', onPress: () => {
          setIdentifier('');
          setDescription('');
        }}
      ]);
    } catch (error: any) {
      Alert.alert(t('common.error'), t('addReport.error'));
    } finally {
      setLoading(false);
    }
  };

  const getPlatformLabel = (key: Platform): string => {
    if (key === 'phone') return t('home.platforms.phone');
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t('addReport.selectPlatform')}</Text>
      <View style={styles.optionsRow}>
        {platformConfigs.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.optionButton,
              platform === p.key && { borderColor: p.color, backgroundColor: p.color + '20' },
            ]}
            onPress={() => setPlatform(p.key)}
          >
            <Ionicons name={p.icon as any} size={20} color={platform === p.key ? p.color : '#888'} />
            <Text style={[styles.optionLabel, platform === p.key && { color: p.color }]}>
              {getPlatformLabel(p.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {t('addReport.identifier.' + platform)}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t('addReport.identifierPlaceholder.' + platform)}
        placeholderTextColor="#666"
        value={identifier}
        onChangeText={setIdentifier}
        keyboardType={platform === 'phone' || platform === 'whatsapp' ? 'phone-pad' : 'default'}
      />

      <Text style={styles.sectionTitle}>{t('addReport.category')}</Text>
      <View style={styles.categoriesGrid}>
        {categoryConfigs.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[
              styles.categoryButton,
              category === c.key && { borderColor: c.color, backgroundColor: c.color + '20' },
            ]}
            onPress={() => setCategory(c.key)}
          >
            <Ionicons name={c.icon as any} size={24} color={category === c.key ? c.color : '#888'} />
            <Text style={[styles.categoryLabel, category === c.key && { color: c.color }]}>
              {t('addReport.categories.' + c.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('addReport.comment')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={t('addReport.commentPlaceholder')}
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitText}>{t('addReport.submit')}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    gap: 6,
  },
  optionLabel: {
    color: '#888',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  categoryLabel: {
    color: '#888',
    marginTop: 8,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
});
