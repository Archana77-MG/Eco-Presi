import React, { useState } from 'react';
import { X, Send, MessageCircle, Mail, CheckCircle2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { AlertsService, SendAlertResult } from '../services/alertsService';
import { CampusStorage } from '../services/storage';

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlockName?: string;
  initialProblem?: string;
  initialLossPerHour?: number;
  onAlertDispatched?: () => void;
}

export const SendAlertModal: React.FC<SendAlertModalProps> = ({
  isOpen,
  onClose,
  initialBlockName = 'Academic Block B',
  initialProblem = 'Empty classroom with 8 fans and 12 fluorescent lights running since 7 PM.',
  initialLossPerHour = 45,
  onAlertDispatched,
}) => {
  const settings = CampusStorage.getAlertSettings();
  const [blockName, setBlockName] = useState(initialBlockName);
  const [issueDescription, setIssueDescription] = useState(initialProblem);
  const [lossPerHour, setLossPerHour] = useState(initialLossPerHour);
  const [actionNeeded, setActionNeeded] = useState('Please switch off Room 204 main switch.');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendAlertResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await AlertsService.sendAlert(
        {
          blockName,
          locationDetail: 'Sub-meter Zone 2',
          issueDescription,
          lossPerHour,
          actionNeeded,
          severity: 'high',
        },
        settings
      );
      setSendResult(result);
      if (onAlertDispatched) onAlertDispatched();
    } catch (err) {
      console.error('Failed to send alert', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-950 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/60 my-auto relative text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Send Facility Alert</h3>
              <p className="text-xs text-slate-400">
                Dispatch WhatsApp & Email notice to facility team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sendResult ? (
          <div className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Target Campus Block
              </label>
              <input
                type="text"
                value={blockName}
                onChange={e => setBlockName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Wastage Issue Description
              </label>
              <textarea
                rows={2}
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Estimated Loss (₹/hr)
                </label>
                <input
                  type="number"
                  value={lossPerHour}
                  onChange={e => setLossPerHour(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black text-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Target WhatsApp
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.facilityManagerWhatsapp}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-950 bg-slate-900/50 text-xs font-mono text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Immediate Action Required
              </label>
              <input
                type="text"
                value={actionNeeded}
                onChange={e => setActionNeeded(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-200"
              />
            </div>

            <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Simulated mode active: message will be logged, previewed, and ready for instant one-click WhatsApp (wa.me) or mailto dispatch.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSend}
                className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Dispatch Alert'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-5">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-200 text-sm">
                  Alert Dispatched & Logged Successfully!
                </h4>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Logged at {sendResult.timestamp} in Presidency Alert History.
                </p>
              </div>
            </div>

            {/* Exact Preview of Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Exact Message Preview
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(sendResult.messagePreview)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-black/90 border border-blue-900/50 text-emerald-400 font-mono text-xs rounded-xl whitespace-pre-wrap leading-relaxed">
                {sendResult.messagePreview}
              </pre>
            </div>

            {/* Direct Links for WhatsApp / Email */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Direct Delivery Channels
              </span>

              {sendResult.channelResults.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-900 border border-blue-900/40 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    {ch.channel === 'whatsapp' ? (
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white capitalize">
                        {ch.channel} ({ch.target})
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Status: Ready for dispatch
                      </span>
                    </div>
                  </div>

                  {ch.actionUrl && (
                    <a
                      href={ch.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md"
                    >
                      <span>Open {ch.channel === 'whatsapp' ? 'WhatsApp' : 'Mail'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-900/40">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer border border-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
