/**
 * Core domain types for Ecotria Presidency
 */

export type Role = 'Admin' | 'Facility Manager';

export type Language = 'en' | 'kn' | 'hi';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  loginMethod?: 'google' | 'email' | 'whatsapp';
  avatarUrl?: string;
}

export interface LoginRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  loginMethod?: 'google' | 'email' | 'whatsapp';
  phone?: string;
  loginTime: string;
  logoutTime?: string;
  device: string;
  status: 'success' | 'denied';
  ipAddress?: string;
}

export type BlockType = 'classroom' | 'lab' | 'hostel' | 'canteen' | 'office' | 'other';

export interface CampusBlock {
  id: string;
  name: string;
  code: string;
  type: BlockType;
  floor: number;
  areaSqFt: number;
  numberOfRooms: number;
  meterId: string;
  // Current status
  electricityKwh: number;
  waterLitres: number;
  wasteKg: number;
  wastageRupees: number;
  status: 'efficient' | 'warning' | 'wasting'; // green, amber, red
  lastUpdated: string;
}

export type ResourceType = 'electricity' | 'water' | 'waste';

export interface ResourceReading {
  id: string;
  timestamp: string;
  location: string; // block name or id
  resource: ResourceType;
  value: number;
  unit: string; // kWh, L, kg
  isScheduledOccupied?: boolean;
}

export interface TariffSettings {
  electricityPerKwh: number; // default: 8
  waterPerKl: number;        // default: 40 (1 kL = 1000 L)
  wastePerKg: number;        // default: 5
}

export type AnomalyType = 
  | 'empty_room_usage' 
  | 'night_excess' 
  | 'sudden_spike' 
  | 'water_leak' 
  | 'waste_overflow';

export interface WastageAnomaly {
  id: string;
  blockId: string;
  blockName: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  title: string;
  description: string;
  whyIsProblem: string;
  estimatedLossRupees: number;
  recommendedFix: string;
  resource: ResourceType;
  value: number;
  unit: string;
  status: 'active' | 'resolved' | 'alert_sent';
}

export interface Recommendation {
  id: string;
  blockId: string;
  blockName: string;
  title: string;
  description: string;
  resource: ResourceType;
  savingsUnitPerMonth: number;
  savingsRupeesPerMonth: number;
  effort: 'Easy' | 'Medium' | 'Hard';
  paybackTime: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  impactScore: number;
}

export interface PredictionData {
  blockId: string;
  blockName: string;
  resource: ResourceType;
  currentBaseline: number;
  predictedUsage7Days: number;
  percentOverBaseline: number;
  expectedExtraCostRupees: number;
  riskLevel: 'normal' | 'moderate' | 'high';
  dailyForecast: { day: string; predicted: number; baseline: number }[];
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  blockName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'sent' | 'pending' | 'acknowledged';
  channels: ('whatsapp' | 'email')[];
  estimatedLossPerHour: number;
}

export interface AlertSettings {
  facilityManagerEmail: string;
  facilityManagerWhatsapp: string;
  channels: {
    whatsapp: boolean;
    email: boolean;
  };
  severityFilters: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  alertTypes: {
    electricity: boolean;
    water: boolean;
    waste: boolean;
    timetable: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // e.g. "23:00"
    end: string;   // e.g. "06:00"
  };
}

export interface UserRewardProfile {
  points: number;
  streakDays: number;
  totalSavedKwh: number;
  totalSavedLitres: number;
  totalSavedKg: number;
  totalSavedRupees: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  type: 'block' | 'hostel' | 'department' | 'individual';
  points: number;
  savingsRupees: number;
  badgeCount: number;
  isCurrentUser?: boolean;
}

export interface FeedbackRecord {
  id: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  category: 'energy' | 'water' | 'waste' | 'ui' | 'general';
  comment: string;
  createdAt: string;
}
