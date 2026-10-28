import { AlertNotification, AlertSettings } from '../types';
import { CampusStorage } from './storage';

export interface SendAlertResult {
  success: boolean;
  messagePreview: string;
  channelResults: {
    channel: 'whatsapp' | 'email';
    status: 'sent' | 'simulated' | 'fallback_link_ready';
    target: string;
    actionUrl?: string;
  }[];
  timestamp: string;
}

export class AlertsService {
  /**
   * Builds the formatted message body for university staff
   */
  static formatAlertMessage(
    blockName: string,
    locationDetail: string,
    issueDescription: string,
    lossPerHour: number,
    actionNeeded: string
  ): string {
    return `🚨 *ECOTRIA ALERT - PRESIDENCY UNIVERSITY* 🚨\n\n` +
      `📍 *Location:* ${blockName} (${locationDetail})\n` +
      `⚠️ *Issue:* ${issueDescription}\n` +
      `💸 *Estimated Loss:* ₹${lossPerHour}/hour\n` +
      `✅ *Action Required:* ${actionNeeded}\n\n` +
      `_Reported by Ecotria Presidency Smart Campus System (Itgalpura Campus)_`;
  }

  /**
   * Generates a direct WhatsApp click-to-chat URL (wa.me)
   */
  static getWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  /**
   * Generates a direct mailto URL
   */
  static getMailtoUrl(email: string, subject: string, body: string): string {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Sends or simulates sending an alert
   */
  static async sendAlert(
    alertData: {
      blockName: string;
      locationDetail?: string;
      issueDescription: string;
      lossPerHour: number;
      actionNeeded: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    },
    settings: AlertSettings
  ): Promise<SendAlertResult> {
    const detail = alertData.locationDetail || 'Main Sub-Meter';
    const message = this.formatAlertMessage(
      alertData.blockName,
      detail,
      alertData.issueDescription,
      alertData.lossPerHour,
      alertData.actionNeeded
    );

    const subject = `[URGENT ECO-ALERT] ${alertData.blockName} - Wastage Detected`;

    const channelResults: SendAlertResult['channelResults'] = [];

    // WhatsApp
    if (settings.channels.whatsapp && settings.facilityManagerWhatsapp) {
      const waUrl = this.getWhatsAppUrl(settings.facilityManagerWhatsapp, message);
      // In web app, we create the wa.me link ready for facility manager
      channelResults.push({
        channel: 'whatsapp',
        status: 'fallback_link_ready',
        target: settings.facilityManagerWhatsapp,
        actionUrl: waUrl,
      });
    }

    // Email
    if (settings.channels.email && settings.facilityManagerEmail) {
      const mailtoUrl = this.getMailtoUrl(settings.facilityManagerEmail, subject, message);
      channelResults.push({
        channel: 'email',
        status: 'fallback_link_ready',
        target: settings.facilityManagerEmail,
        actionUrl: mailtoUrl,
      });
    }

    // Also record alert in local storage history
    const newAlert: Omit<AlertNotification, 'id'> = {
      title: `${alertData.blockName}: ${alertData.issueDescription}`,
      message,
      blockName: alertData.blockName,
      severity: alertData.severity || 'high',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      channels: ['whatsapp', 'email'],
      estimatedLossPerHour: alertData.lossPerHour,
    };
    CampusStorage.addAlert(newAlert);

    return {
      success: true,
      messagePreview: message,
      channelResults,
      timestamp: new Date().toLocaleString(),
    };
  }
}
