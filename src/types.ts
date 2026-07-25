export type Language = 'tr' | 'en';

export type ThemeMode = 'dark' | 'light';

export interface VideoResolutionOption {
  format: string;
  resolution: string;
  size: string;
  fps: number;
  bitrate: string;
  hasAudio: boolean;
  quality: 'sd' | 'hd' | 'fhd' | '2k' | '4k';
  formatId?: string;
}

export interface AudioBitrateOption {
  format: string;
  bitrate: string; // e.g. '320 kbps'
  size: string;
  sampleRate: string;
  quality: 'standard' | 'high' | 'ultra';
  formatId?: string;
}

export interface MediaAnalysisResult {
  url: string;
  id: string;
  title: string;
  platform: string;
  platformIcon: string;
  author: string;
  authorAvatar?: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  views: string;
  uploadDate: string;
  videoOptions: VideoResolutionOption[];
  audioOptions: AudioBitrateOption[];
}

export interface PlatformItem {
  id: string;
  name: string;
  category: 'video' | 'social' | 'audio' | 'all';
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: Record<Language, string>;
  supportedFormats: string[];
  maxQuality: string;
  status: 'active' | 'maintenance' | 'beta';
  speedRating: number; // 1-5
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: string;
  thumbnail: string;
  format: string;
  quality: string;
  size: string;
  timestamp: string;
  downloadUrl: string;
}

export interface FavoriteItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  thumbnail: string;
  addedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'vip' | 'admin';
  plan: 'Free' | 'Pro Unlimited' | 'API Developer';
  joinedDate: string;
  totalDownloads: number;
  bandwidthUsed: string;
  apiKey?: string;
}

export interface BlogPost {
  id: string;
  title: Record<Language, string>;
  slug: string;
  summary: Record<Language, string>;
  content: Record<Language, string>;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  views: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalConversions: number;
  dailyTrafficGB: number;
  serverCpuLoad: number;
  serverMemoryLoad: number;
  bandwidthSavedTB: number;
  uptimePercentage: number;
}

export interface Announcement {
  id: string;
  title: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  badgeText?: string;
  link?: string;
  linkText?: string;
  active: boolean;
}

export interface PricingSettings {
  monthlyPrice: number;
  yearlyDiscountPercent: number;
  yearlyPrice: number;
  currency: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
