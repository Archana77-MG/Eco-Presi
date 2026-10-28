import { CampusStorage } from './storage';
import { AnalyticsEngine } from './analytics';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'navigate' | 'alert' | 'view_block';
    payload?: string;
  };
}

export class GeminiService {
  /**
   * Sends a message to the backend Gemini endpoint
   */
  static async askEcoAssistant(
    userQuestion: string,
    history: ChatMessage[],
    language: 'en' | 'kn' | 'hi' = 'en'
  ): Promise<string> {
    const blocks = CampusStorage.getBlocks();
    const tariffs = CampusStorage.getTariffs();
    const anomalies = CampusStorage.getAnomalies();
    const metrics = AnalyticsEngine.getDashboardMetrics(blocks, tariffs, anomalies, 'today');

    // Context summary for grounding the LLM
    const contextData = {
      campus: 'Presidency University, Bengaluru (Itgalpura Campus)',
      todayElectricityKwh: metrics.totalElectricityKwh,
      todayWaterLitres: metrics.totalWaterLitres,
      todayWasteKg: metrics.totalWasteKg,
      todayLossRupees: metrics.totalWastageRupees,
      campusEcoScore: metrics.campusEcoScore,
      tariffs: {
        electricity: `₹${tariffs.electricityPerKwh}/kWh`,
        water: `₹${tariffs.waterPerKl}/kL`,
        waste: `₹${tariffs.wastePerKg}/kg`,
      },
      topWastingBlocks: blocks
        .filter(b => b.status === 'wasting' || b.status === 'warning')
        .map(b => `${b.name} (Loss: ₹${b.wastageRupees}/day, Issue: ${b.status})`),
      activeAnomalies: anomalies.filter(a => a.status === 'active').map(a => ({
        location: a.blockName,
        problem: a.title,
        lossRupees: a.estimatedLossRupees,
        recommendedFix: a.recommendedFix,
      })),
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuestion,
          language,
          campusData: contextData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.warn('API call failed or server running offline, using intelligent local engine:', err);
      return this.getLocalFallbackResponse(userQuestion, contextData, language);
    }
  }

  /**
   * Generates Executive AI summary for reports
   */
  static async generateReportSummary(
    period: 'Daily' | 'Weekly' | 'Monthly' | 'Annual',
    language: 'en' | 'kn' | 'hi' = 'en'
  ): Promise<string> {
    const blocks = CampusStorage.getBlocks();
    const tariffs = CampusStorage.getTariffs();
    const anomalies = CampusStorage.getAnomalies();
    const metrics = AnalyticsEngine.getDashboardMetrics(blocks, tariffs, anomalies, period.toLowerCase() as any);

    try {
      const response = await fetch('/api/report-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          language,
          metrics,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report API HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.summary;
    } catch (e) {
      // Intelligent fallback summary
      if (language === 'kn') {
        return `ಪ್ರೆಸಿಡೆನ್ಸಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ${period} ಸಂಪನ್ಮೂಲ ವರದಿ: ಒಟ್ಟು ವಿದ್ಯುತ್ ಬಳಕೆ ${metrics.totalElectricityKwh.toLocaleString()} kWh, ನೀರು ${metrics.totalWaterLitres.toLocaleString()} L, ಮತ್ತು ತ್ಯಾಜ್ಯ ${metrics.totalWasteKg.toLocaleString()} kg. ಒಟ್ಟು ಅಂದಾಜು ವ್ಯರ್ಥ ನಷ್ಟ ₹${metrics.totalWastageRupees.toLocaleString()}. ಪ್ರಮುಖ ವ್ಯರ್ಥ ಬ್ಲಾಕ್ B ಮತ್ತು ಬಾಯ್ಸ್ ಹಾಸ್ಟೆಲ್. ತಕ್ಷಣವೇ ರಾತ್ರಿ ವಿದ್ಯುತ್ ಮತ್ತು ನೀರಿನ ಸೋರಿಕೆ ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳನ್ನು ಅನುಷ್ಠಾನಗೊಳಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`;
      } else if (language === 'hi') {
        return `प्रेसीडेंसी यूनिवर्सिटी की ${period} संसाधन रिपोर्ट: कुल बिजली खपत ${metrics.totalElectricityKwh.toLocaleString()} kWh, पानी ${metrics.totalWaterLitres.toLocaleString()} L, एवं ठोस कचरा ${metrics.totalWasteKg.toLocaleString()} kg। अनुमानित अपव्यय नुकसान ₹${metrics.totalWastageRupees.toLocaleString()} रहा। सबसे अधिक नुकसान ब्लॉक B तथा बॉयज़ हॉस्टल में दर्ज हुआ। कमरों में गैर-जरूरी लोड बंद करने व रिसाव रोकने की तत्काल सिफारिश की जाती है।`;
      }
      return `Presidency University ${period} Resource Performance Summary: Campus electricity consumption totaled ${metrics.totalElectricityKwh.toLocaleString()} kWh, water usage reached ${metrics.totalWaterLitres.toLocaleString()} L, and solid waste stood at ${metrics.totalWasteKg.toLocaleString()} kg. Estimated preventable resource wastage loss was ₹${metrics.totalWastageRupees.toLocaleString()}. Key hotspots requiring intervention: Academic Block B (empty room active fixtures) and Hostel Boys (night flush valve leak). Implementing recommended automated cut-offs and float valve replacements will recover an estimated ₹14,800/month.`;
    }
  }

  /**
   * Deterministic local campus intelligence engine if API offline
   */
  private static getLocalFallbackResponse(query: string, data: any, lang: 'en' | 'kn' | 'hi'): string {
    const q = query.toLowerCase();

    if (lang === 'kn') {
      if (q.includes('water') || q.includes('ನೀರು') || q.includes('ಸೋರಿಕೆ')) {
        return `ಬಾಯ್ಸ್ ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ರಾತ್ರಿ 2 ರಿಂದ 5 ರವರೆಗೆ ನಿರಂತರ 380 L/hr ನೀರಿನ ಸೋರಿಕೆ ಕಂಡುಬಂದಿದೆ. ಇದರಿಂದ ದಿನಕ್ಕೆ ಸುಮಾರು ₹1,440 ನಷ್ಟವಾಗುತ್ತಿದೆ. ಫ್ಲಶ್ ವಾಲ್ವ್ ದುರಸ್ತಿ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`;
      }
      if (q.includes('save') || q.includes('ಉಳಿತಾಯ') || q.includes('10000') || q.includes('ಹಾಸ್ಟೆಲ್')) {
        return `ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ₹10,000 ಉಳಿಸಲು: 1) ಡುಯಲ್-ಫ್ಲಶ್ ವಾಲ್ವ್ ಅಳವಡಿಸಿ (ತಿಂಗಳಿಗೆ ₹1,800 ಉಳಿತಾಯ), 2) ಹಗಲಿನ ವೇಳೆಯಲ್ಲಿ ಕಾರಿಡಾರ್ ಲೈಟ್ಸ್ ಆಫ್ ಮಾಡಿ (ತಿಂಗಳಿಗೆ ₹3,200 ಉಳಿತಾಯ), 3) ಗೀಸರ್ ಟೈಮರ್ ನಿಗದಿಪಡಿಸಿ (ತಿಂಗಳಿಗೆ ₹5,500 ಉಳಿತಾಯ).`;
      }
      return `ಇಕೋಟ್ರಿಯಾ ಪ್ರೆಸಿಡೆನ್ಸಿ ಡೇಟಾ: ಇಂದಿನ ಒಟ್ಟು ವಿದ್ಯುತ್ ಬಳಕೆ ${data.todayElectricityKwh} kWh, ನೀರಿನ ಬಳಕೆ ${data.todayWaterLitres} L, ಮತ್ತು ಅಂದಾಜು ವ್ಯರ್ಥ ನಷ್ಟ ₹${data.todayLossRupees}. ಪ್ರಮುಖ ಸಮಸ್ಯೆ: ಬ್ಲಾಕ್ B ರೂಮ್ 204 ನಲ್ಲಿ ಖಾಲಿ ಕೊಠಡಿ ವಿದ್ಯುತ್ ಲೋಡ್.`;
    }

    if (lang === 'hi') {
      if (q.includes('water') || q.includes('पानी') || q.includes('रिसाव')) {
        return `बॉयज़ हॉस्टल में रात 2 से 5 बजे के बीच 380 L/घंटा का निरंतर रिसाव दर्ज किया गया है। इससे प्रतिदिन लगभग ₹1,440 का नुकसान हो रहा है। वाशरुम फ्लश वाल्व की तत्काल मरम्मत आवश्यक है।`;
      }
      if (q.includes('save') || q.includes('बचत') || q.includes('हॉस्टल') || q.includes('10000')) {
        return `हॉस्टल में प्रति माह ₹10,000 से अधिक बचाने के लिए: 1) डुअल-फ्लश वाल्व लगाएं (बचत ~₹1,800/माह), 2) गीजर ऑटो-कटऑफ टाइमर लगाएं (बचत ~₹5,400/माह), 3) रात 11 बजे के बाद कॉरिडोर की आधी लाइटें बंद करें (बचत ~₹3,200/माह)।`;
      }
      return `इकोट्रिया प्रेसीडेंसी आज का विवरण: आज बिजली खपत ${data.todayElectricityKwh} kWh, पानी ${data.todayWaterLitres} L, एवं कुल अपव्यय नुकसान ₹${data.todayLossRupees} है। मुख्य समस्या: ब्लॉक B रूम 204 में खाली कमरे में लाइट/पंखे चालू हैं।`;
    }

    // English
    if (q.includes('water') || q.includes('leak') || q.includes('most water')) {
      return `Hostel Boys has the highest water wastage this week due to an unresolved continuous night flow anomaly of 380 L/hr between 2 AM and 5 AM. This costs Presidency University approximately ₹1,440/day in water procurement. Repairing the Wing C float valve is the top recommendation.`;
    }
    if (q.includes('save') || q.includes('10,000') || q.includes('10000') || q.includes('hostel')) {
      return `To save ₹10,000+ monthly in the hostels: 1) Install dual-flush cistern valves in Boys Hostel washrooms (saves ~₹1,800/mo), 2) Put water heaters/geysers on scheduled timers (saves ~₹5,400/mo at ₹8/kWh), 3) Implement automated corridor lighting shut-off after 11 PM (saves ~₹3,200/mo). Total potential: ₹10,400/month.`;
    }
    if (q.includes('block b') || q.includes('night') || q.includes('empty')) {
      return `Academic Block B Room 204 had 8 ceiling fans and 12 fluorescent fixtures running at 7:15 PM despite the class ending at 5:30 PM. Active load was 3.2 kW, causing an avoidable loss of ~₹45 per hour (₹360/night).`;
    }
    if (q.includes('eco score') || q.includes('score')) {
      return `Presidency University's current Campus Eco Score is ${data.campusEcoScore}/100. It is rated as 'Good', with 7 efficient blocks, 2 needing attention (Canteen & Block C), and 2 high wastage blocks (Block B & Boys Hostel).`;
    }

    return `Presidency University currently consumes ${data.todayElectricityKwh.toLocaleString()} kWh electricity and ${data.todayWaterLitres.toLocaleString()} L water today. Preventable wastage loss is estimated at ₹${data.todayLossRupees.toLocaleString()}. Top priority: send an alert for Block B Room 204 lights and repair the Boys Hostel float valve.`;
  }
}
