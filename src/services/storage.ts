import {
  CampusBlock,
  ResourceReading,
  TariffSettings,
  WastageAnomaly,
  Recommendation,
  AlertNotification,
  AlertSettings,
  LoginRecord,
  UserRewardProfile,
  LeaderboardEntry,
  FeedbackRecord,
  User,
} from '../types';
import { ALLOWED_USERS, DEFAULT_TARIFFS } from '../config/allowedUsers';

// Storage keys
const KEYS = {
  CURRENT_USER: 'ecotria_current_user',
  BLOCKS: 'ecotria_campus_blocks',
  READINGS: 'ecotria_readings',
  TARIFFS: 'ecotria_tariffs',
  ANOMALIES: 'ecotria_anomalies',
  RECOMMENDATIONS: 'ecotria_recommendations',
  ALERTS: 'ecotria_alerts',
  ALERT_SETTINGS: 'ecotria_alert_settings',
  LOGIN_LOGS: 'ecotria_login_logs',
  USER_REWARDS: 'ecotria_rewards_profile',
  LEADERBOARD: 'ecotria_leaderboard',
  FEEDBACK: 'ecotria_feedback',
  LANGUAGE: 'ecotria_language',
  TOUR_COMPLETED: 'ecotria_tour_completed',
};

// Default initial blocks
const INITIAL_BLOCKS: CampusBlock[] = [
  {
    id: 'blk-a',
    name: 'Academic Block A',
    code: 'AB-A',
    type: 'classroom',
    floor: 4,
    areaSqFt: 45000,
    numberOfRooms: 32,
    meterId: 'PU-ELEC-BLK-A-01',
    electricityKwh: 380,
    waterLitres: 12500,
    wasteKg: 65,
    wastageRupees: 640,
    status: 'efficient',
    lastUpdated: '10 mins ago',
  },
  {
    id: 'blk-b',
    name: 'Academic Block B',
    code: 'AB-B',
    type: 'classroom',
    floor: 4,
    areaSqFt: 42000,
    numberOfRooms: 28,
    meterId: 'PU-ELEC-BLK-B-02',
    electricityKwh: 610,
    waterLitres: 14200,
    wasteKg: 82,
    wastageRupees: 2160,
    status: 'wasting', // red: empty room lights/fans
    lastUpdated: '5 mins ago',
  },
  {
    id: 'blk-c',
    name: 'Academic Block C (Labs)',
    code: 'AB-C',
    type: 'lab',
    floor: 3,
    areaSqFt: 38000,
    numberOfRooms: 24,
    meterId: 'PU-ELEC-BLK-C-03',
    electricityKwh: 540,
    waterLitres: 9800,
    wasteKg: 45,
    wastageRupees: 1480,
    status: 'warning', // amber: overnight AC left on
    lastUpdated: '12 mins ago',
  },
  {
    id: 'lib-01',
    name: 'Central Library',
    code: 'LIB',
    type: 'other',
    floor: 3,
    areaSqFt: 30000,
    numberOfRooms: 12,
    meterId: 'PU-ELEC-LIB-01',
    electricityKwh: 260,
    waterLitres: 4500,
    wasteKg: 20,
    wastageRupees: 320,
    status: 'efficient',
    lastUpdated: '15 mins ago',
  },
  {
    id: 'hst-b',
    name: 'Hostel Boys',
    code: 'HST-B',
    type: 'hostel',
    floor: 6,
    areaSqFt: 65000,
    numberOfRooms: 220,
    meterId: 'PU-ELEC-HST-B-01',
    electricityKwh: 890,
    waterLitres: 48000,
    wasteKg: 190,
    wastageRupees: 3840,
    status: 'wasting', // red: continuous night water leak
    lastUpdated: '3 mins ago',
  },
  {
    id: 'hst-g',
    name: 'Hostel Girls',
    code: 'HST-G',
    type: 'hostel',
    floor: 6,
    areaSqFt: 60000,
    numberOfRooms: 200,
    meterId: 'PU-ELEC-HST-G-01',
    electricityKwh: 780,
    waterLitres: 36000,
    wasteKg: 165,
    wastageRupees: 920,
    status: 'efficient',
    lastUpdated: '8 mins ago',
  },
  {
    id: 'can-01',
    name: 'University Canteen',
    code: 'CAN',
    type: 'canteen',
    floor: 2,
    areaSqFt: 18000,
    numberOfRooms: 6,
    meterId: 'PU-ELEC-CAN-01',
    electricityKwh: 420,
    waterLitres: 22000,
    wasteKg: 310,
    wastageRupees: 1550,
    status: 'warning', // amber: waste bin overflow
    lastUpdated: '6 mins ago',
  },
  {
    id: 'adm-01',
    name: 'Admin Block',
    code: 'ADM',
    type: 'office',
    floor: 3,
    areaSqFt: 25000,
    numberOfRooms: 18,
    meterId: 'PU-ELEC-ADM-01',
    electricityKwh: 290,
    waterLitres: 6500,
    wasteKg: 35,
    wastageRupees: 420,
    status: 'efficient',
    lastUpdated: '20 mins ago',
  },
  {
    id: 'spt-01',
    name: 'Sports Complex',
    code: 'SPT',
    type: 'other',
    floor: 2,
    areaSqFt: 22000,
    numberOfRooms: 8,
    meterId: 'PU-ELEC-SPT-01',
    electricityKwh: 210,
    waterLitres: 8500,
    wasteKg: 30,
    wastageRupees: 280,
    status: 'efficient',
    lastUpdated: '25 mins ago',
  },
  {
    id: 'aud-01',
    name: 'University Auditorium',
    code: 'AUD',
    type: 'other',
    floor: 2,
    areaSqFt: 35000,
    numberOfRooms: 4,
    meterId: 'PU-ELEC-AUD-01',
    electricityKwh: 140,
    waterLitres: 2100,
    wasteKg: 15,
    wastageRupees: 180,
    status: 'efficient',
    lastUpdated: '30 mins ago',
  },
];

// Initial realistic anomalies with root cause & estimated loss
const INITIAL_ANOMALIES: WastageAnomaly[] = [
  {
    id: 'anom-1',
    blockId: 'blk-b',
    blockName: 'Academic Block B',
    type: 'empty_room_usage',
    severity: 'high',
    timestamp: 'Today, 19:15',
    title: 'Room 204 Empty with 3.2 kW Active Load',
    description: 'Timetable schedule shows classes ended at 17:30. At 19:15, sensor records 8 ceiling fans and 12 fluorescent lights still running.',
    whyIsProblem: 'Unnecessary electricity burn with zero occupancy. Generates carbon emissions and raises BESCOM utility bill.',
    estimatedLossRupees: 45, // per hour (~₹360/night)
    recommendedFix: 'Send facility runner to switch off Room 204 main switch or trigger smart sub-panel relay cut-off.',
    resource: 'electricity',
    value: 3.2,
    unit: 'kW',
    status: 'active',
  },
  {
    id: 'anom-2',
    blockId: 'hst-b',
    blockName: 'Hostel Boys',
    type: 'water_leak',
    severity: 'critical',
    timestamp: 'Today, 03:40',
    title: 'Continuous Water Flow (380 L/hr) at 3 AM',
    description: 'Continuous baseline water flow detected through Hostel Boys Wing C manifold between 02:00 and 05:30 AM when all residents are asleep.',
    whyIsProblem: 'Indicates a severe overhead tank float valve overflow or broken flush solenoid. University buys water via tankers at ₹40/kL.',
    estimatedLossRupees: 1440, // per day
    recommendedFix: 'Inspect 3rd-floor communal washroom cistern valve and seal the secondary overhead valve.',
    resource: 'water',
    value: 380,
    unit: 'L/hr',
    status: 'active',
  },
  {
    id: 'anom-3',
    blockId: 'blk-c',
    blockName: 'Academic Block C (Labs)',
    type: 'night_excess',
    severity: 'high',
    timestamp: 'Today, 22:00',
    title: 'Precision Lab 102 Split ACs Left at 18°C',
    description: 'Computer graphics lab locked at 6 PM, but two 2-Ton inverter split ACs were left running on turbo mode.',
    whyIsProblem: 'Causes 4.8 kWh continuous draw overnight, translating to ~₹300+ wasted per night.',
    estimatedLossRupees: 384,
    recommendedFix: 'Engage Central Facility remote thermostat shutoff or alert lab technician on duty.',
    resource: 'electricity',
    value: 4.8,
    unit: 'kW',
    status: 'active',
  },
  {
    id: 'anom-4',
    blockId: 'can-01',
    blockName: 'University Canteen',
    type: 'waste_overflow',
    severity: 'medium',
    timestamp: 'Today, 15:30',
    title: 'Food Waste Bin Exceeded 120% Capacity',
    description: 'Wet waste load in Canteen collection bay exceeded 310 kg today (baseline: 180 kg) due to post-event surplus.',
    whyIsProblem: 'Unsegregated rotting waste attracts pests and incurs municipal landfill penalties at ₹5/kg.',
    estimatedLossRupees: 650,
    recommendedFix: 'Redirect untouched boxed event meals to campus support staff mess and route wet organic scraps to the campus bio-gas digester.',
    resource: 'waste',
    value: 130,
    unit: 'kg excess',
    status: 'active',
  },
  {
    id: 'anom-5',
    blockId: 'lib-01',
    blockName: 'Central Library',
    type: 'sudden_spike',
    severity: 'low',
    timestamp: 'Yesterday, 14:10',
    title: 'Sudden 14 kW Power Surge on Floor 2',
    description: 'Z-score anomaly (+3.4 std dev) detected when high-draw heating elements were connected during exhibition setup.',
    whyIsProblem: 'Potential risk of circuit breaker tripping and unmetered peak tariff charge.',
    estimatedLossRupees: 220,
    recommendedFix: 'Balance socket loads across Phase 2 distribution boards.',
    resource: 'electricity',
    value: 14,
    unit: 'kW spike',
    status: 'resolved',
  },
];

// Initial recommendations with measurable impact
const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    blockId: 'blk-b',
    blockName: 'Academic Block B',
    title: 'Corridor & Empty Classroom Curfew at 7:00 PM',
    description: 'Switch off corridor and empty classroom fixtures automatically or via night watch rounds.',
    resource: 'electricity',
    savingsUnitPerMonth: 120, // kWh/mo
    savingsRupeesPerMonth: 960,
    effort: 'Easy',
    paybackTime: 'Immediate',
    status: 'pending',
    impactScore: 92,
  },
  {
    id: 'rec-2',
    blockId: 'hst-b',
    blockName: 'Hostel Boys',
    title: 'Dual-Flush Cistern Overhaul & Valve Servicing',
    description: 'Replace faulty float valves and install dual-flush mechanisms across 45 washrooms in Boys Hostel Wing B & C.',
    resource: 'water',
    savingsUnitPerMonth: 45000, // Litres/mo
    savingsRupeesPerMonth: 1800,
    effort: 'Medium',
    paybackTime: '2 weeks',
    status: 'pending',
    impactScore: 96,
  },
  {
    id: 'rec-3',
    blockId: 'blk-c',
    blockName: 'Academic Block C (Labs)',
    title: 'Motion Sensor Cut-off for Computer & CAD Labs',
    description: 'Install PIR motion sensor interlocks with lab master power circuits to shut off monitors and lighting when vacant for 15+ mins.',
    resource: 'electricity',
    savingsUnitPerMonth: 450,
    savingsRupeesPerMonth: 3600,
    effort: 'Medium',
    paybackTime: '1 month',
    status: 'pending',
    impactScore: 88,
  },
  {
    id: 'rec-4',
    blockId: 'can-01',
    blockName: 'University Canteen',
    title: 'On-Campus Organic Composting & Biogas Feed',
    description: 'Process 800 kg food waste monthly on-site instead of commercial disposal, generating organic fertilizer for Presidency campus lawns.',
    resource: 'waste',
    savingsUnitPerMonth: 800,
    savingsRupeesPerMonth: 4000,
    effort: 'Hard',
    paybackTime: '3 months',
    status: 'pending',
    impactScore: 94,
  },
  {
    id: 'rec-5',
    blockId: 'adm-01',
    blockName: 'Admin Block',
    title: 'Standardize AC Setpoints to 24°C in Offices',
    description: 'BEE guideline compliance: lock thermostats at 24°C instead of 18-20°C across administrative conference rooms.',
    resource: 'electricity',
    savingsUnitPerMonth: 850,
    savingsRupeesPerMonth: 6800,
    effort: 'Easy',
    paybackTime: 'Immediate',
    status: 'completed',
    completedAt: '2026-10-25',
    impactScore: 98,
  },
];

// Initial alert settings
const INITIAL_ALERT_SETTINGS: AlertSettings = {
  facilityManagerEmail: 'facility@gmail.com',
  facilityManagerWhatsapp: '+919880123456',
  channels: {
    whatsapp: true,
    email: true,
  },
  severityFilters: {
    low: false,
    medium: true,
    high: true,
    critical: true,
  },
  alertTypes: {
    electricity: true,
    water: true,
    waste: true,
    timetable: true,
  },
  quietHours: {
    enabled: true,
    start: '23:00',
    end: '06:00',
  },
};

// Initial alerts
const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'alt-1',
    title: 'Empty Classroom Active Load - Block B',
    message: 'ALERT: Block B Room 204 is empty but using 3.2 kW since 7 PM. Estimated loss ₹45/hour. Please switch off.',
    blockName: 'Academic Block B',
    severity: 'high',
    timestamp: 'Today, 19:20',
    status: 'sent',
    channels: ['whatsapp', 'email'],
    estimatedLossPerHour: 45,
  },
  {
    id: 'alt-2',
    title: 'Midnight Water Leak - Hostel Boys',
    message: 'CRITICAL ALERT: Boys Hostel Wing C shows continuous 380 L/hr night flow since 2 AM. Water loss ₹1,440/day. Immediate plumber check required.',
    blockName: 'Hostel Boys',
    severity: 'critical',
    timestamp: 'Today, 03:45',
    status: 'sent',
    channels: ['whatsapp', 'email'],
    estimatedLossPerHour: 60,
  },
  {
    id: 'alt-3',
    title: 'Overnight AC in Lab 102 - Block C',
    message: 'ALERT: Academic Block C Lab 102 inverter AC running at 18°C after hours. Loss ₹384/night. Please shut down.',
    blockName: 'Academic Block C (Labs)',
    severity: 'high',
    timestamp: 'Today, 22:05',
    status: 'pending',
    channels: ['whatsapp'],
    estimatedLossPerHour: 38,
  },
];

// Initial login records for audit
const INITIAL_LOGIN_LOGS: LoginRecord[] = [
  {
    id: 'log-1',
    email: 'admin@presidencyuniversity.in',
    name: 'Dr. Ramesh Rao (Registrar / Admin)',
    role: 'Admin',
    loginTime: '2026-10-28 08:30:15',
    device: 'Desktop Chrome / Windows 11',
    status: 'success',
    ipAddress: '172.16.4.12 (Presidency LAN)',
  },
  {
    id: 'log-2',
    email: 'facility@gmail.com',
    name: 'Suresh Kumar (Chief Facility Officer)',
    role: 'Facility Manager',
    loginTime: '2026-10-28 09:12:44',
    device: 'Mobile Safari / iOS 18 (iPhone 15)',
    status: 'success',
    ipAddress: '49.207.210.15 (Jio 5G)',
  },
  {
    id: 'log-3',
    email: 'unknown.intruder@external.com',
    name: 'Unauthorized User',
    role: 'Facility Manager',
    loginTime: '2026-10-27 21:40:02',
    device: 'Chrome / Linux',
    status: 'denied',
    ipAddress: '103.21.144.9',
  },
];

// Initial user rewards profile
const INITIAL_USER_REWARDS: UserRewardProfile = {
  points: 420,
  streakDays: 6,
  totalSavedKwh: 340,
  totalSavedLitres: 12000,
  totalSavedKg: 85,
  totalSavedRupees: 4200,
  badges: [
    {
      id: 'bdg-1',
      name: 'Water Saver',
      description: 'Reported and verified an active pipe leak saving >5,000 L',
      icon: 'Droplets',
      unlocked: true,
      unlockedAt: '2026-10-22',
    },
    {
      id: 'bdg-2',
      name: 'Energy Hero',
      description: 'Kept classroom loads at zero during unoccupied hours for 5 days',
      icon: 'Zap',
      unlocked: true,
      unlockedAt: '2026-10-26',
    },
    {
      id: 'bdg-3',
      name: 'Zero-Waste Champion',
      description: 'Supported 100% organic waste diversion in campus canteen',
      icon: 'Trash2',
      unlocked: false,
    },
    {
      id: 'bdg-4',
      name: 'Night Owl Saver',
      description: 'Executed 10+ after-hours facility shutdowns',
      icon: 'Moon',
      unlocked: true,
      unlockedAt: '2026-10-27',
    },
    {
      id: 'bdg-5',
      name: 'Green Guardian',
      description: 'Reached 1,000 total sustainability points at Presidency University',
      icon: 'Award',
      unlocked: false,
    },
  ],
};

// Initial leaderboard entries
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Hostel Girls Wing A & B', type: 'hostel', points: 1450, savingsRupees: 18200, badgeCount: 4 },
  { rank: 2, name: 'Academic Block A (CS Dept)', type: 'block', points: 1280, savingsRupees: 15400, badgeCount: 3 },
  { rank: 3, name: 'Central Library Staff', type: 'department', points: 1120, savingsRupees: 13900, badgeCount: 3 },
  { rank: 4, name: 'Suresh Kumar (Facility)', type: 'individual', points: 940, savingsRupees: 11200, badgeCount: 3 },
  { rank: 5, name: 'Hostel Boys Wing 1', type: 'hostel', points: 820, savingsRupees: 9800, badgeCount: 2 },
  { rank: 6, name: 'Dr. Ramesh Rao (Admin)', type: 'individual', points: 420, savingsRupees: 4200, badgeCount: 2, isCurrentUser: true },
];

// Initial feedback
const INITIAL_FEEDBACK: FeedbackRecord[] = [
  {
    id: 'fb-1',
    userName: 'Prof. Anitha Sharma',
    userEmail: 'anitha.sharma@presidencyuniversity.in',
    rating: 5,
    category: 'energy',
    comment: 'The timetable mismatch detection alerted us before the weekend! Saved huge electricity in Block A Lab 3.',
    createdAt: '2026-10-26 16:20',
  },
  {
    id: 'fb-2',
    userName: 'Karthik Gowda (Student Rep)',
    userEmail: 'karthik.g@presidencyuniversity.in',
    rating: 4,
    category: 'ui',
    comment: 'Very easy to see red and green blocks on the phone. Loving the canteen discount coupon rewards!',
    createdAt: '2026-10-27 11:05',
  },
];

// Storage helper class
export class CampusStorage {
  // Current User
  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    // Return default first admin for immediate smooth out-of-the-box demo
    const defaultUser: User = {
      id: 'usr-1',
      email: ALLOWED_USERS[0].email,
      name: ALLOWED_USERS[0].name,
      role: ALLOWED_USERS[0].role,
    };
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  static setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
  }

  // Language
  static getLanguage(): 'en' | 'kn' | 'hi' {
    return (localStorage.getItem(KEYS.LANGUAGE) as any) || 'en';
  }

  static setLanguage(lang: 'en' | 'kn' | 'hi'): void {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  }

  // Blocks
  static getBlocks(): CampusBlock[] {
    try {
      const data = localStorage.getItem(KEYS.BLOCKS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.BLOCKS, JSON.stringify(INITIAL_BLOCKS));
    return INITIAL_BLOCKS;
  }

  static saveBlocks(blocks: CampusBlock[]): void {
    localStorage.setItem(KEYS.BLOCKS, JSON.stringify(blocks));
  }

  static addBlock(block: Omit<CampusBlock, 'id'>): CampusBlock {
    const blocks = this.getBlocks();
    const newBlock: CampusBlock = {
      ...block,
      id: 'blk-' + Date.now(),
      lastUpdated: 'Just now',
    };
    blocks.push(newBlock);
    this.saveBlocks(blocks);
    return newBlock;
  }

  static updateBlock(id: string, updates: Partial<CampusBlock>): void {
    const blocks = this.getBlocks().map(b => b.id === id ? { ...b, ...updates, lastUpdated: 'Just now' } : b);
    this.saveBlocks(blocks);
  }

  static deleteBlock(id: string): void {
    const blocks = this.getBlocks().filter(b => b.id !== id);
    this.saveBlocks(blocks);
  }

  // Tariffs
  static getTariffs(): TariffSettings {
    try {
      const data = localStorage.getItem(KEYS.TARIFFS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.TARIFFS, JSON.stringify(DEFAULT_TARIFFS));
    return DEFAULT_TARIFFS;
  }

  static saveTariffs(tariffs: TariffSettings): void {
    localStorage.setItem(KEYS.TARIFFS, JSON.stringify(tariffs));
  }

  // Anomalies / Wastage Issues
  static getAnomalies(): WastageAnomaly[] {
    try {
      const data = localStorage.getItem(KEYS.ANOMALIES);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.ANOMALIES, JSON.stringify(INITIAL_ANOMALIES));
    return INITIAL_ANOMALIES;
  }

  static saveAnomalies(anomalies: WastageAnomaly[]): void {
    localStorage.setItem(KEYS.ANOMALIES, JSON.stringify(anomalies));
  }

  static resolveAnomaly(id: string): void {
    const anomalies = this.getAnomalies().map(a => a.id === id ? { ...a, status: 'resolved' as const } : a);
    this.saveAnomalies(anomalies);
  }

  // Recommendations
  static getRecommendations(): Recommendation[] {
    try {
      const data = localStorage.getItem(KEYS.RECOMMENDATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.RECOMMENDATIONS, JSON.stringify(INITIAL_RECOMMENDATIONS));
    return INITIAL_RECOMMENDATIONS;
  }

  static saveRecommendations(recs: Recommendation[]): void {
    localStorage.setItem(KEYS.RECOMMENDATIONS, JSON.stringify(recs));
  }

  static markRecommendationDone(id: string): void {
    const recs = this.getRecommendations().map(r =>
      r.id === id ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString().split('T')[0] } : r
    );
    this.saveRecommendations(recs);
    // Award user points
    this.addPoints(100, `Completed savings recommendation: ${id}`);
  }

  // Alerts & Settings
  static getAlertSettings(): AlertSettings {
    try {
      const data = localStorage.getItem(KEYS.ALERT_SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.ALERT_SETTINGS, JSON.stringify(INITIAL_ALERT_SETTINGS));
    return INITIAL_ALERT_SETTINGS;
  }

  static saveAlertSettings(settings: AlertSettings): void {
    localStorage.setItem(KEYS.ALERT_SETTINGS, JSON.stringify(settings));
  }

  static getAlerts(): AlertNotification[] {
    try {
      const data = localStorage.getItem(KEYS.ALERTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    return INITIAL_ALERTS;
  }

  static saveAlerts(alerts: AlertNotification[]): void {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  }

  static addAlert(alert: Omit<AlertNotification, 'id'>): AlertNotification {
    const alerts = this.getAlerts();
    const newAlert: AlertNotification = {
      ...alert,
      id: 'alt-' + Date.now(),
    };
    alerts.unshift(newAlert);
    this.saveAlerts(alerts);
    return newAlert;
  }

  // Login Logs (Admin only)
  static getLoginLogs(): LoginRecord[] {
    try {
      const data = localStorage.getItem(KEYS.LOGIN_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify(INITIAL_LOGIN_LOGS));
    return INITIAL_LOGIN_LOGS;
  }

  static addLoginLog(record: Omit<LoginRecord, 'id'>): void {
    const logs = this.getLoginLogs();
    logs.unshift({
      ...record,
      id: 'log-' + Date.now(),
    });
    localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify(logs));
  }

  // Rewards & Gamification
  static getUserRewards(): UserRewardProfile {
    try {
      const data = localStorage.getItem(KEYS.USER_REWARDS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.USER_REWARDS, JSON.stringify(INITIAL_USER_REWARDS));
    return INITIAL_USER_REWARDS;
  }

  static addPoints(pointsToAdd: number, reason: string): UserRewardProfile {
    const profile = this.getUserRewards();
    profile.points += pointsToAdd;
    // Check for Green Guardian badge unlock
    if (profile.points >= 1000) {
      const badge = profile.badges.find(b => b.id === 'bdg-5');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        badge.unlockedAt = new Date().toISOString().split('T')[0];
      }
    }
    localStorage.setItem(KEYS.USER_REWARDS, JSON.stringify(profile));
    return profile;
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(KEYS.LEADERBOARD);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
    return INITIAL_LEADERBOARD;
  }

  // Feedback
  static getFeedback(): FeedbackRecord[] {
    try {
      const data = localStorage.getItem(KEYS.FEEDBACK);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(INITIAL_FEEDBACK));
    return INITIAL_FEEDBACK;
  }

  static addFeedback(fb: Omit<FeedbackRecord, 'id' | 'createdAt'>): FeedbackRecord {
    const records = this.getFeedback();
    const newRecord: FeedbackRecord = {
      ...fb,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toLocaleString(),
    };
    records.unshift(newRecord);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(records));
    // Reward points for submitting feedback
    this.addPoints(25, 'Submitted campus feedback');
    return newRecord;
  }

  // Guided Tour
  static isTourCompleted(): boolean {
    return localStorage.getItem(KEYS.TOUR_COMPLETED) === 'true';
  }

  static setTourCompleted(completed: boolean): void {
    localStorage.setItem(KEYS.TOUR_COMPLETED, completed ? 'true' : 'false');
  }

  // Reset to default
  static resetDemoData(): void {
    localStorage.clear();
  }
}
