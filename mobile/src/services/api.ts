import axios from 'axios';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Для разработки используем локальный IP, для production - Railway
const LOCAL_IP = '192.168.0.10';
const API_BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:3001/api`
  : 'https://spamchecker-app-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export type Platform = 'phone' | 'instagram' | 'whatsapp' | 'telegram';

export interface SpamRecord {
  id: string;
  identifier: string;
  platform: Platform;
  category: 'spam' | 'fraud' | 'scam' | 'fake' | 'unknown';
  status: 'pending' | 'confirmed';
  reportsCount: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  recordId: string;
  parentId?: string;
  author: string;
  text: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `${Device.modelName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await AsyncStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const getRecentRecords = async (platform: Platform, limit = 20): Promise<SpamRecord[]> => {
  try {
    const response = await api.get(`/phones/recent?platform=${platform}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
};

export const searchRecord = async (identifier: string, platform: Platform) => {
  try {
    const response = await api.get(`/phones/search/${encodeURIComponent(identifier)}?platform=${platform}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return { record: null, comments: [], found: false };
  }
};

export const reportRecord = async (
  identifier: string,
  platform: Platform,
  category: string,
  description?: string
): Promise<SpamRecord | null> => {
  try {
    const deviceId = await getDeviceId();
    const response = await api.post('/phones/report', {
      identifier,
      platform,
      category,
      description,
      deviceId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const getComments = async (recordId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/phones/${recordId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addComment = async (
  recordId: string,
  text: string,
  parentId?: string
): Promise<Comment | null> => {
  try {
    const deviceId = await getDeviceId();
    const response = await api.post(`/phones/${recordId}/comments`, {
      text,
      deviceId,
      parentId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const likeComment = async (commentId: string): Promise<Comment | null> => {
  try {
    const response = await api.post(`/phones/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking comment:', error);
    return null;
  }
};

// Статистика из БД
export interface Stats {
  totalRecords: number;
  todayReports: number;
  confirmedScammers: number;
}

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get('/phones/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalRecords: 0, todayReports: 0, confirmedScammers: 0 };
  }
};

// Получение записи по ID
export const getRecordById = async (recordId: string): Promise<SpamRecord | null> => {
  try {
    const response = await api.get(`/phones/record/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
};
