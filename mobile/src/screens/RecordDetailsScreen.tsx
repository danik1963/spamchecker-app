import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
  Platform as RNPlatform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { getComments, addComment, likeComment, getRecordById, Comment, Platform, SpamRecord } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface RouteParams {
  recordId: string;
  identifier: string;
  platform: Platform;
}

const platformConfig: Record<Platform, { icon: string; color: string }> = {
  phone: { icon: 'call', color: '#4CAF50' },
  instagram: { icon: 'logo-instagram', color: '#E1306C' },
  whatsapp: { icon: 'logo-whatsapp', color: '#25D366' },
  telegram: { icon: 'paper-plane', color: '#0088cc' },
};

const categoryColors: Record<string, { color: string; bgColor: string }> = {
  spam: { color: '#FF9800', bgColor: '#FF980020' },
  fraud: { color: '#F44336', bgColor: '#F4433620' },
  scam: { color: '#E91E63', bgColor: '#E91E6320' },
  fake: { color: '#9C27B0', bgColor: '#9C27B020' },
  unknown: { color: '#607D8B', bgColor: '#607D8B20' },
};

function ThreadComment({ comment, onReply, onLike, t }: { 
  comment: Comment; 
  onReply: (id: string) => void;
  onLike: (id: string) => void;
  t: (key: string, options?: object) => string;
}) {
  const [showReplies, setShowReplies] = useState(false);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('recordDetails.timeAgo.justNow');
    if (diffMins < 60) return `${diffMins} ${t('recordDetails.timeAgo.minutes')}`;
    if (diffHours < 24) return `${diffHours} ${t('recordDetails.timeAgo.hours')}`;
    if (diffDays < 7) return `${diffDays} ${t('recordDetails.timeAgo.days')}`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentRow}>
        <View style={styles.avatarLine}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
          {(comment.replies && comment.replies.length > 0) && (
            <View style={styles.threadLine} />
          )}
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.authorName}>{comment.author}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onLike(comment.id)}>
              <Ionicons name="heart-outline" size={18} color="#888" />
              {comment.likes > 0 && <Text style={styles.actionCount}>{comment.likes}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onReply(comment.id)}>
              <Ionicons name="chatbubble-outline" size={18} color="#888" />
              {comment.replies && comment.replies.length > 0 && (
                <Text style={styles.actionCount}>{comment.replies.length}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          
          {comment.replies && comment.replies.length > 0 && (
            <>
              <TouchableOpacity 
                style={styles.showRepliesButton}
                onPress={() => setShowReplies(!showReplies)}
              >
                <Text style={styles.showRepliesText}>
                  {showReplies ? 'Скрыть ответы' : `Показать ${comment.replies.length} ответов`}
                </Text>
              </TouchableOpacity>
              
              {showReplies && (
                <View style={styles.replies}>
                  {comment.replies.map((reply) => (
                    <View key={reply.id} style={styles.replyContainer}>
                      <View style={styles.replyAvatar}>
                        <Ionicons name="person" size={12} color="#fff" />
                      </View>
                      <View style={styles.replyContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.replyAuthor}>{reply.author}</Text>
                          <Text style={styles.timeAgo}>{formatTimeAgo(reply.createdAt)}</Text>
                        </View>
                        <Text style={styles.replyText}>{reply.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function RecordDetailsScreen() {
  const route = useRoute();
  const { recordId, identifier, platform } = route.params as RouteParams;
  const { t } = useLanguage();
  const inputRef = useRef<TextInput>(null);
  
  const [record, setRecord] = useState<SpamRecord | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Загрузка данных при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [recordId])
  );

  const loadData = async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const [recordData, commentsData] = await Promise.all([
        getRecordById(recordId),
        getComments(recordId)
      ]);
      setRecord(recordData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh каждые 15 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      loadDataSilent();
    }, 15000);
    return () => clearInterval(interval);
  }, [recordId]);

  const loadDataSilent = async () => {
    if (!recordId) return;
    try {
      const commentsData = await getComments(recordId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !recordId) return;

    setSubmitting(true);
    try {
      const comment = await addComment(recordId, newComment.trim(), replyingTo || undefined);
      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    await likeComment(commentId);
    loadDataSilent();
  };

  const getPlatformLabel = (p: Platform): string => {
    const labels: Record<Platform, string> = {
      phone: t('home.platforms.phone'),
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
    };
    return labels[p];
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={RNPlatform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.platformIcon, { backgroundColor: platformConfig[platform]?.color + '20' }]}>
              <Ionicons 
                name={platformConfig[platform]?.icon as any} 
                size={28} 
                color={platformConfig[platform]?.color} 
              />
            </View>
            {record?.status === 'confirmed' && (
              <View style={styles.confirmedBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.confirmedText}>{t('recordDetails.confirmed')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.identifier}>{identifier}</Text>
          <Text style={styles.platformLabel}>{getPlatformLabel(platform)}</Text>

          <View style={styles.infoRow}>
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: categoryColors[record?.category || 'unknown']?.bgColor }
            ]}>
              <View style={[
                styles.categoryDot,
                { backgroundColor: categoryColors[record?.category || 'unknown']?.color }
              ]} />
              <Text style={[
                styles.categoryText,
                { color: categoryColors[record?.category || 'unknown']?.color }
              ]}>
                {t(`recordDetails.category.${record?.category || 'unknown'}`)}
              </Text>
            </View>
            
            <View style={styles.reportsInfo}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.reportsCount}>
                {record?.reportsCount || 0} {t('recordDetails.reports')}
              </Text>
            </View>
          </View>

          {record?.status === 'confirmed' && (
            <View style={styles.dangerBanner}>
              <Ionicons name="alert-circle" size={20} color="#F44336" />
              <Text style={styles.dangerText}>
                {t('recordDetails.dangerWarning')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            {t('recordDetails.comments')} ({comments.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <ThreadComment
                key={comment.id}
                comment={comment}
                onReply={(id) => setReplyingTo(id)}
                onLike={handleLike}
                t={t}
              />
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubbles-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>{t('recordDetails.noComments')}</Text>
              <Text style={styles.emptySubtext}>{t('recordDetails.beFirst')}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingBar}>
              <Text style={styles.replyingText}>{t('recordDetails.replyingTo')}</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={t('recordDetails.writeComment')}
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendButtonDisabled]}
              onPress={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: '#16213e',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  confirmedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  identifier: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  platformLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportsCount: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4433615',
    borderWidth: 1,
    borderColor: '#F4433640',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 10,
  },
  dangerText: {
    color: '#F44336',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  commentsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
  },
  avatarLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#0f3460',
    marginTop: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#888',
  },
  showRepliesButton: {
    marginTop: 12,
  },
  showRepliesText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  replies: {
    marginTop: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    marginRight: 8,
  },
  replyText: {
    fontSize: 14,
    color: '#ccc',
  },
  emptyComments: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
    padding: 12,
  },
  replyingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  replyingText: {
    color: '#6C63FF',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
});
