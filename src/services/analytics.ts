import {
  CampusBlock,
  TariffSettings,
  WastageAnomaly,
  ResourceType,
} from '../types';

export interface DashboardMetrics {
  totalElectricityKwh: number;
  totalWaterLitres: number;
  totalWasteKg: number;
  totalWastageRupees: number;
  co2SavedKg: number;
  campusEcoScore: number; // 0 - 100
  top3Problems: WastageAnomaly[];
}

export interface HourlyUsagePoint {
  hour: string;
  electricity: number;
  water: number;
  waste: number;
  isOccupied: boolean;
  baseline: number;
  wastageCost: number;
}

export interface BlockComparisonItem {
  name: string;
  code: string;
  electricity: number;
  water: number;
  waste: number;
  wastageCost: number;
  status: 'efficient' | 'warning' | 'wasting';
}

export interface WastageTrendPoint {
  date: string;
  electricityLoss: number;
  waterLoss: number;
  wasteLoss: number;
  totalLoss: number;
}

export interface TimetableComparisonPoint {
  period: string; // e.g., '08:00 - 10:00 (Lectures)'
  actualLoadKwh: number;
  scheduledBaselineKwh: number;
  excessKwh: number;
  isOccupied: boolean;
}

/**
 * Analytics and wastage detection engine for Presidency University
 */
export class AnalyticsEngine {
  /**
   * Calculates high-level KPI cards for the selected time filter
   */
  static getDashboardMetrics(
    blocks: CampusBlock[],
    tariffs: TariffSettings,
    anomalies: WastageAnomaly[],
    filter: 'today' | 'week' | 'month' | 'year' = 'today'
  ): DashboardMetrics {
    const multiplier = filter === 'today' ? 1 : filter === 'week' ? 6.5 : filter === 'month' ? 28 : 340;

    const totalElectricityKwh = Math.round(blocks.reduce((acc, b) => acc + b.electricityKwh, 0) * multiplier);
    const totalWaterLitres = Math.round(blocks.reduce((acc, b) => acc + b.waterLitres, 0) * multiplier);
    const totalWasteKg = Math.round(blocks.reduce((acc, b) => acc + b.wasteKg, 0) * multiplier);

    // Calculate rupee losses
    const activeAnomalies = anomalies.filter(a => a.status !== 'resolved');
    const baseDailyLoss = activeAnomalies.reduce((sum, a) => sum + (a.estimatedLossRupees || 200), 0);
    const totalWastageRupees = Math.round(baseDailyLoss * multiplier);

    // Grid carbon factor in Karnataka (CEA Indian Grid average: ~0.82 kg CO2 / kWh)
    const co2SavedKg = Math.round((totalElectricityKwh * 0.18) * 0.82);

    // Eco score: evaluated on how many blocks are green vs red/amber
    const efficientCount = blocks.filter(b => b.status === 'efficient').length;
    const warningCount = blocks.filter(b => b.status === 'warning').length;
    const totalBlocks = blocks.length || 1;
    const rawScore = ((efficientCount * 1.0 + warningCount * 0.6) / totalBlocks) * 100;
    const campusEcoScore = Math.min(100, Math.max(10, Math.round(rawScore)));

    // Top 3 problems sorted by estimated loss
    const top3Problems = [...activeAnomalies]
      .sort((a, b) => b.estimatedLossRupees - a.estimatedLossRupees)
      .slice(0, 3);

    return {
      totalElectricityKwh,
      totalWaterLitres,
      totalWasteKg,
      totalWastageRupees,
      co2SavedKg,
      campusEcoScore,
      top3Problems,
    };
  }

  /**
   * Generates realistic 24-hour campus resource usage curves
   */
  static getHourlyUsage(blockId?: string): HourlyUsagePoint[] {
    const hours = [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];

    // Standard hourly campus pattern
    return hours.map((hour, idx) => {
      const hourNum = parseInt(hour.split(':')[0], 10);
      const isOccupied = hourNum >= 8 && hourNum <= 18;
      
      let baseElec = isOccupied ? 240 + Math.sin(idx) * 60 : 70;
      let baseWater = isOccupied ? 6800 + Math.cos(idx) * 1500 : 900;
      let baseWaste = isOccupied ? 40 + Math.sin(idx) * 15 : 5;

      // Inject anomaly for Block B (high night load)
      if (blockId === 'blk-b' && hourNum >= 18) {
        baseElec += 110; // empty room light draw
      }
      // Inject water anomaly for Hostel Boys at 02:00 - 04:00
      if (blockId === 'hst-b' && (hourNum === 2 || hourNum === 4)) {
        baseWater += 1400; // continuous flush leak
      }

      const baseline = isOccupied ? 220 : 45;
      const excess = Math.max(0, baseElec - baseline);
      const wastageCost = Math.round(excess * 8 + (baseWater > 2000 && !isOccupied ? 35 : 0));

      return {
        hour,
        electricity: Math.round(baseElec),
        water: Math.round(baseWater),
        waste: Math.round(baseWaste),
        isOccupied,
        baseline,
        wastageCost,
      };
    });
  }

  /**
   * Block-wise comparison data for charts
   */
  static getBlockComparison(blocks: CampusBlock[]): BlockComparisonItem[] {
    return blocks.map(b => ({
      name: b.name.replace('Academic Block ', 'Block ').replace('University ', ''),
      code: b.code,
      electricity: b.electricityKwh,
      water: Math.round(b.waterLitres / 100), // scaled for dual axis or visual balance
      waste: b.wasteKg,
      wastageCost: b.wastageRupees,
      status: b.status,
    }));
  }

  /**
   * Historical 7-day wastage trend in Rupees
   */
  static getWastageTrend(): WastageTrendPoint[] {
    const days = ['22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct (Today)'];
    const trendBase = [3800, 3650, 4100, 2900, 2750, 3200, 2850];

    return days.map((date, i) => {
      const elec = Math.round(trendBase[i] * 0.55);
      const water = Math.round(trendBase[i] * 0.32);
      const waste = Math.round(trendBase[i] * 0.13);
      return {
        date,
        electricityLoss: elec,
        waterLoss: water,
        wasteLoss: waste,
        totalLoss: elec + water + waste,
      };
    });
  }

  /**
   * Timetable comparison: Occupied vs Empty Room usage
   */
  static getTimetableComparison(): TimetableComparisonPoint[] {
    return [
      { period: '06:00 - 08:00 (Pre-Class Early Arrival)', actualLoadKwh: 48, scheduledBaselineKwh: 20, excessKwh: 28, isOccupied: false },
      { period: '08:30 - 10:30 (Morning Core Lectures)', actualLoadKwh: 340, scheduledBaselineKwh: 320, excessKwh: 20, isOccupied: true },
      { period: '10:45 - 12:45 (Lab Sessions & Tutorials)', actualLoadKwh: 410, scheduledBaselineKwh: 390, excessKwh: 20, isOccupied: true },
      { period: '13:00 - 14:00 (Campus Lunch Break)', actualLoadKwh: 260, scheduledBaselineKwh: 140, excessKwh: 120, isOccupied: false },
      { period: '14:15 - 16:15 (Afternoon Classes)', actualLoadKwh: 380, scheduledBaselineKwh: 360, excessKwh: 20, isOccupied: true },
      { period: '16:30 - 18:00 (Library & Club Activities)', actualLoadKwh: 220, scheduledBaselineKwh: 180, excessKwh: 40, isOccupied: true },
      { period: '18:30 - 21:00 (Post-Class Vacant)', actualLoadKwh: 195, scheduledBaselineKwh: 35, excessKwh: 160, isOccupied: false },
      { period: '21:30 - 05:30 (Overnight Security Only)', actualLoadKwh: 85, scheduledBaselineKwh: 25, excessKwh: 60, isOccupied: false },
    ];
  }

  /**
   * Rules Engine for detecting wastage anomalies from raw data or CSV entries
   */
  static evaluateAnomalyRules(
    reading: {
      location: string;
      resource: ResourceType;
      value: number;
      unit: string;
      timestamp?: string;
      isOccupied?: boolean;
    },
    tariffs: TariffSettings
  ): WastageAnomaly | null {
    const time = reading.timestamp || 'Now';
    const hour = new Date().getHours();

    // Rule A: Empty room usage
    if (reading.resource === 'electricity' && reading.isOccupied === false && reading.value > 2.0) {
      const estimatedLoss = Math.round(reading.value * tariffs.electricityPerKwh * 4); // 4 hours vacant
      return {
        id: 'dyn-anom-' + Date.now(),
        blockId: reading.location.toLowerCase().replace(/\s+/g, '-'),
        blockName: reading.location,
        type: 'empty_room_usage',
        severity: reading.value > 4.0 ? 'high' : 'medium',
        timestamp: time,
        title: `Unscheduled Load in ${reading.location}`,
        description: `Sensor recorded ${reading.value} kW during unoccupied timetable schedule.`,
        whyIsProblem: `Equipment is running with no students present, consuming unnecessary electricity.`,
        estimatedLossRupees: estimatedLoss,
        recommendedFix: `Turn off classroom sub-panel switches or send security guard on inspection.`,
        resource: 'electricity',
        value: reading.value,
        unit: 'kW',
        status: 'active',
      };
    }

    // Rule D: Water leak (continuous flow at night)
    if (reading.resource === 'water' && (hour >= 1 && hour <= 5) && reading.value > 150) {
      const dailyLoss = Math.round((reading.value / 1000) * tariffs.waterPerKl * 24);
      return {
        id: 'dyn-anom-' + Date.now(),
        blockId: reading.location.toLowerCase().replace(/\s+/g, '-'),
        blockName: reading.location,
        type: 'water_leak',
        severity: 'critical',
        timestamp: time,
        title: `Night Water Flow Leak in ${reading.location}`,
        description: `Unusual continuous flow of ${reading.value} L/hr detected during early hours.`,
        whyIsProblem: `Water flows continuously even when everyone is asleep, indicating an active cistern overflow or line fracture.`,
        estimatedLossRupees: dailyLoss,
        recommendedFix: `Dispatch plumbing team to shut main isolation valve and replace leaking float valve.`,
        resource: 'water',
        value: reading.value,
        unit: 'L/hr',
        status: 'active',
      };
    }

    // Rule C: Sudden spike
    if (reading.resource === 'electricity' && reading.value > 15.0) {
      return {
        id: 'dyn-anom-' + Date.now(),
        blockId: reading.location.toLowerCase().replace(/\s+/g, '-'),
        blockName: reading.location,
        type: 'sudden_spike',
        severity: 'high',
        timestamp: time,
        title: `Sudden Load Spike (+3.1σ) in ${reading.location}`,
        description: `Power consumption jumped to ${reading.value} kW, far above expected baseline.`,
        whyIsProblem: `Risk of exceeding contracted demand tariff penalties from BESCOM and overloading phase distribution.`,
        estimatedLossRupees: Math.round(reading.value * tariffs.electricityPerKwh * 1.5),
        recommendedFix: `Audit connected loads and verify no unapproved heavy heating or machinery was hooked up.`,
        resource: 'electricity',
        value: reading.value,
        unit: 'kW',
        status: 'active',
      };
    }

    // Rule E: Waste overflow
    if (reading.resource === 'waste' && reading.value > 250) {
      const penaltyCost = Math.round((reading.value - 150) * tariffs.wastePerKg);
      return {
        id: 'dyn-anom-' + Date.now(),
        blockId: reading.location.toLowerCase().replace(/\s+/g, '-'),
        blockName: reading.location,
        type: 'waste_overflow',
        severity: 'medium',
        timestamp: time,
        title: `Solid Waste Bin Overflow in ${reading.location}`,
        description: `Disposal bin weight reached ${reading.value} kg, exceeding normal capacity.`,
        whyIsProblem: `Accumulation of decomposing waste causes health hazards and higher municipal landfill surcharge.`,
        estimatedLossRupees: penaltyCost,
        recommendedFix: `Call campus composting team to clear wet organic matter and compact dry recyclables.`,
        resource: 'waste',
        value: reading.value,
        unit: 'kg',
        status: 'active',
      };
    }

    return null;
  }
}
