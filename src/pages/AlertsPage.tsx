import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Mail,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Settings as SettingsIcon,
  Phone,
  Save,
  Check,
} from 'lucide-react';
import { AlertNotification, AlertSettings, Language } from '../types';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface AlertsPageProps {
  alerts: AlertNotification[];
  settings: AlertSettings;
  onSaveSettings: (settings: AlertSettings) => void;
  onTriggerTestAlert: () => void;
  language: Language;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  settings,
  onSaveSettings,
  onTriggerTestAlert,
  language,
}) => {
  const [email, setEmail] = useState(settings.facilityManagerEmail);
  const [whatsapp, setWhatsapp] = useState(settings.facilityManagerWhatsapp);
  const [waEnabled, setWaEnabled] = useState(settings.channels.whatsapp);
  const [emailEnabled, setEmailEnabled] = useState(settings.channels.email);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(settings.quietHours.enabled);
  const [quietStart, setQuietStart] = useState(settings.quietHours.start);
  const [quietEnd, setQuietEnd] = useState(settings.quietHours.end);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = translations[language] || translations.en;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      facilityManagerEmail: email,
      facilityManagerWhatsapp: whatsapp,
      channels: {
        whatsapp: waEnabled,
        email: emailEnabled,
      },
      quietHours: {
        enabled: quietHoursEnabled,
        start: quietStart,
        end: quietEnd,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoAlerts}
        buttonLabel="Send Test Alert"
        onActionClick={onTriggerTestAlert}
        accentColor="rose"
      />

      {/* Header & Quick Action */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Facility Alert Dispatch & Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time notifications sent directly to university maintenance officers
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerTestAlert}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-950 border border-rose-400/40 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4 text-rose-200" />
          <span>Send Test Alert</span>
        </button>
      </div>

      {/* 2 Column: Settings Form + Active Alert History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Configuration (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-950 text-cyan-400 border border-blue-800/60 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delivery Settings</h3>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-cyan-300 bg-blue-950 border border-blue-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-cyan-400" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Facility Manager WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+919880123456"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/60 bg-slate-950 text-white font-mono font-medium focus:outline-none focus:border-blue-400"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dispatches via WhatsApp Business Cloud API / wa.me click link
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Facility Manager Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="facility@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/60 bg-slate-950 text-white font-medium focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Channels toggles */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Channels
              </span>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-blue-900/40 bg-slate-950/80 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={waEnabled}
                  onChange={e => setWaEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">WhatsApp Messages</span>
                  <span className="text-slate-400">Instant notification for urgent leaks & cut-offs</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-blue-900/40 bg-slate-950/80 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={e => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Email Digest & Alerts</span>
                  <span className="text-slate-400">Detailed shift handover reports</span>
                </div>
              </label>
            </div>

            {/* Quiet Hours */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Quiet Hours (Night Filter)
                </span>
                <input
                  type="checkbox"
                  checked={quietHoursEnabled}
                  onChange={e => setQuietHoursEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Non-critical notices are queued until morning. Critical water leaks will still trigger.
              </p>
              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={e => setQuietStart(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-blue-900/60 bg-slate-900 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={e => setQuietEnd(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-blue-900/60 bg-slate-900 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-cyan-200" />
              <span>Save Alert Configuration</span>
            </button>
          </form>
        </div>

        {/* Right: Alert History Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
            <div>
              <h3 className="text-base font-bold text-white">
                Recent Alert History ({alerts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Audit log of all triggered WhatsApp and Email messages
              </p>
            </div>
            <Bell className="w-5 h-5 text-blue-400" />
          </div>

          <div className="space-y-3 mt-4">
            {alerts.map(alt => (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl border transition-all shadow-md shadow-black/40 ${
                  alt.severity === 'critical'
                    ? 'bg-slate-950/90 border-rose-800/60'
                    : 'bg-slate-950/80 border-blue-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        alt.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="font-bold text-white">{alt.blockName}</span>
                  </div>
                  <span className="font-mono text-slate-400">{alt.timestamp}</span>
                </div>

                <p className="text-xs font-semibold text-white mt-1">{alt.title}</p>
                <p className="text-xs text-cyan-200 mt-1 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-blue-900/50 font-mono text-[11px]">
                  {alt.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-blue-900/30">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="capitalize font-medium text-cyan-300">
                      Status: {alt.status}
                    </span>
                  </div>
                  <span className="font-bold text-rose-400">
                    Est. Loss: ₹{alt.estimatedLossPerHour}/hr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
