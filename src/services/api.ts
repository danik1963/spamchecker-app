import axios from 'axios'
import type { PhoneNumber, Comment, SearchResult } from '../types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

export const searchPhone = async (
  phone: string,
  platform: 'phone' | 'instagram' | 'whatsapp' | 'telegram' = 'phone'
): Promise<SearchResult> => {
  try {
    const response = await api.get(`/phones/search/${encodeURIComponent(phone)}?platform=${platform}`)
    return response.data
  } catch (error) {
    console.error('Search error:', error)
    return { phone: null, comments: [], found: false }
  }
}

export const reportPhone = async (
  identifier: string,
  category: 'spam' | 'fraud' | 'scam' | 'fake',
  description?: string,
  platform: 'phone' | 'instagram' | 'whatsapp' | 'telegram' = 'phone'
): Promise<PhoneNumber | null> => {
  try {
    const response = await api.post('/phones/report', {
      identifier,
      platform,
      category,
      description,
      deviceId: getDeviceId(),
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw error
  }
}

export const getRecentPhones = async (
  limit = 20,
  platform: 'phone' | 'instagram' | 'whatsapp' | 'telegram' = 'phone'
): Promise<PhoneNumber[]> => {
  try {
    const response = await api.get(`/phones/recent?platform=${platform}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Error fetching recent phones:', error)
    return []
  }
}

export const addComment = async (phoneId: string, text: string): Promise<Comment | null> => {
  try {
    const response = await api.post(`/phones/${phoneId}/comments`, {
      text,
      deviceId: getDeviceId(),
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw error
  }
}

export const getPhoneComments = async (phoneId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/phones/${phoneId}/comments`)
    return response.data
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export const getRecordById = async (recordId: string): Promise<PhoneNumber | null> => {
  try {
    const response = await api.get(`/phones/record/${recordId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching record:', error)
    return null
  }
}

export interface Stats {
  totalRecords: number
  todayReports: number
  confirmedScammers: number
}

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get('/phones/stats')
    return response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { totalRecords: 0, todayReports: 0, confirmedScammers: 0 }
  }
}
