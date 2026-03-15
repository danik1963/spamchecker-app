import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
})

// Add auth token to all requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ============ AUTH ============

export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'moderator'
  createdAt?: string
  lastLoginAt?: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await adminApi.post('/auth/login', { username, password })
  return response.data
}

export const getMe = async (): Promise<AdminUser> => {
  const response = await adminApi.get('/auth/me')
  return response.data
}

// ============ ANALYTICS ============

export interface AnalyticsSummary {
  reports: {
    total: number
    today: number
    week: number
    month: number
  }
  records: {
    total: number
    today: number
  }
  comments: {
    total: number
  }
  byPlatform: { platform: string; count: number }[]
  byCategory: { category: string; count: number }[]
  topIdentifiers: {
    identifier: string
    platform: string
    reportsCount: number
    category: string
  }[]
}

export const getAnalytics = async (from?: string, to?: string): Promise<AnalyticsSummary> => {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)
  const response = await adminApi.get(`/analytics/summary?${params}`)
  return response.data
}

// ============ REPORTS ============

export interface Report {
  id: string
  recordId: string
  category: string
  description?: string
  deviceId: string
  ipAddress: string
  createdAt: string
  deletedAt?: string
  isValid?: boolean
  record: {
    identifier: string
    platform: string
    status: string
    category: string
    reportsCount: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ReportsParams {
  platform?: string
  category?: string
  identifier?: string
  recordId?: string
  deviceId?: string
  ipAddress?: string
  from?: string
  to?: string
  isValid?: string
  includeDeleted?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
}

export const getReports = async (params: ReportsParams = {}): Promise<PaginatedResponse<Report>> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const response = await adminApi.get(`/reports?${searchParams}`)
  return response.data
}

export const updateReport = async (id: string, data: { isValid?: boolean }): Promise<Report> => {
  const response = await adminApi.patch(`/reports/${id}`, data)
  return response.data
}

export const deleteReport = async (id: string): Promise<void> => {
  await adminApi.delete(`/reports/${id}`)
}

export const restoreReport = async (id: string): Promise<Report> => {
  const response = await adminApi.post(`/reports/${id}/restore`)
  return response.data
}

// ============ RECORDS ============

export interface SpamRecord {
  id: string
  identifier: string
  platform: string
  category: string
  status: string
  reportsCount: number
  createdAt: string
  updatedAt: string
  hiddenAt?: string
  _count?: {
    reports: number
    comments: number
  }
}

export interface RecordsParams {
  platform?: string
  category?: string
  status?: string
  identifier?: string
  includeHidden?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
}

export const getRecords = async (params: RecordsParams = {}): Promise<PaginatedResponse<SpamRecord>> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const response = await adminApi.get(`/records?${searchParams}`)
  return response.data
}

export const getRecord = async (id: string): Promise<SpamRecord & { reports: Report[]; comments: Comment[] }> => {
  const response = await adminApi.get(`/records/${id}`)
  return response.data
}

export const updateRecord = async (
  id: string,
  data: { status?: string; category?: string; hiddenAt?: boolean }
): Promise<SpamRecord> => {
  const response = await adminApi.patch(`/records/${id}`, data)
  return response.data
}

export const deleteRecord = async (id: string): Promise<void> => {
  await adminApi.delete(`/records/${id}`)
}

export const restoreRecord = async (id: string): Promise<SpamRecord> => {
  const response = await adminApi.post(`/records/${id}/restore`)
  return response.data
}

// ============ COMMENTS ============

export interface Comment {
  id: string
  recordId: string
  parentId?: string
  author: string
  text: string
  likes: number
  deviceId: string
  createdAt: string
  deletedAt?: string
  record?: {
    identifier: string
    platform: string
  }
}

export interface CommentsParams {
  recordId?: string
  identifier?: string
  author?: string
  includeDeleted?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
}

export const getComments = async (params: CommentsParams = {}): Promise<PaginatedResponse<Comment>> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const response = await adminApi.get(`/comments?${searchParams}`)
  return response.data
}

export const deleteComment = async (id: string): Promise<void> => {
  await adminApi.delete(`/comments/${id}`)
}

export const restoreComment = async (id: string): Promise<Comment> => {
  const response = await adminApi.post(`/comments/${id}/restore`)
  return response.data
}

// ============ AUDIT LOGS ============

export interface AuditLog {
  id: string
  adminUserId: string
  actionType: string
  entityType: string
  entityId: string
  payload?: Record<string, unknown>
  createdAt: string
  adminUser: {
    username: string
    role: string
  }
}

export interface AuditLogsParams {
  adminUserId?: string
  actionType?: string
  entityType?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export const getAuditLogs = async (params: AuditLogsParams = {}): Promise<PaginatedResponse<AuditLog>> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const response = await adminApi.get(`/audit-logs?${searchParams}`)
  return response.data
}

// ============ ADMIN USERS ============

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await adminApi.get('/users')
  return response.data
}

export const createAdminUser = async (data: {
  username: string
  password: string
  role?: string
}): Promise<AdminUser> => {
  const response = await adminApi.post('/users', data)
  return response.data
}

export const deleteAdminUser = async (id: string): Promise<void> => {
  await adminApi.delete(`/users/${id}`)
}

export default adminApi
