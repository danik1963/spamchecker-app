export type Platform = 'phone' | 'instagram' | 'whatsapp' | 'telegram'

export interface SpamRecord {
  id: string
  identifier: string
  platform: Platform
  category: 'spam' | 'fraud' | 'scam' | 'fake' | 'unknown'
  status: 'pending' | 'confirmed'
  reportsCount: number
  createdAt: string
  updatedAt: string
}

export interface PhoneNumber {
  id: string
  identifier: string
  phone?: string  // deprecated, use identifier
  platform: Platform
  category: 'spam' | 'fraud' | 'scam' | 'fake' | 'unknown'
  status: 'pending' | 'confirmed'
  reportsCount: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  phoneId?: string
  recordId?: string
  parentId?: string
  author?: string
  text: string
  likes?: number
  deviceId?: string
  createdAt: string
  replies?: Comment[]
}

export interface Report {
  id: string
  phoneId: string
  category: 'spam' | 'fraud'
  description?: string
  deviceId: string
  ipAddress: string
  createdAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface SearchResult {
  phone?: PhoneNumber | null
  record?: PhoneNumber | null  // Backend returns 'record', not 'phone'
  comments: Comment[]
  found: boolean
}
