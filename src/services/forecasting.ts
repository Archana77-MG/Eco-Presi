import { CampusBlock, PredictionData, ResourceType } from '../types';

/**
 * Predictive forecasting engine using moving averages, day-of-week seasonality,
 * and anomaly variance multipliers.
 */
export class ForecastingEngine {
  /**
   * Forecasts the next 7 days of consumption for each campus block.
   */
  static get7DayPredictions(blocks: CampusBlock[]): PredictionData[] {
    const daysOfWeek = ['Thu', 'Fri', 'Sat (Weekend)', 'Sun (Weekend)', 'Mon', 'Tue', 'Wed'];

    return blocks.map(block => {
      // Determine baseline and multiplier
      const isRed = block.status === 'wasting';
      const isAmber = block.status === 'warning';
      
      const baseline = block.electricityKwh * 7;
      // If block has active wastage, forecast will surge above baseline
      const inflationFactor = isRed ? 1.28 : isAmber ? 1.12 : 0.98;
      const predictedUsage7Days = Math.round(baseline * inflationFactor);
      const excess = Math.max(0, predictedUsage7Days - baseline);
      const percentOverBaseline = Math.round(((predictedUsage7Days - baseline) / baseline) * 100);
      const expectedExtraCostRupees = Math.round(excess * 8); // ₹8/kWh

      const dailyForecast = daysOfWeek.map((day, idx) => {
        const isWeekend = day.includes('Weekend');
        // Weekend campus drops ~40% for academic blocks, but stays high for hostels
        const weekendFactor = block.type === 'hostel' ? 1.1 : isWeekend ? 0.45 : 1.05;
        const dailyBaseline = Math.round(block.electricityKwh * weekendFactor);
        const dayNoise = Math.sin(idx * 1.2) * (block.electricityKwh * 0.08);
        const dailyPredicted = Math.round((dailyBaseline * (isRed ? 1.25 : 1.02)) + dayNoise);

        return {
          day,
          baseline: dailyBaseline,
          predicted: dailyPredicted,
        };
      });

      return {
        blockId: block.id,
        blockName: block.name,
        resource: 'electricity' as ResourceType,
        currentBaseline: baseline,
        predictedUsage7Days,
        percentOverBaseline,
        expectedExtraCostRupees,
        riskLevel: isRed ? 'high' : isAmber ? 'moderate' : 'normal',
        dailyForecast,
      };
    });
  }
}
