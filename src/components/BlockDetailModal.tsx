import React from 'react';
import {
  X,
  Zap,
  Droplets,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Bell,
  MapPin,
  Clock,
  Layers,
  Maximize2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CampusBlock, Recommendation, Language } from '../types';
import { AnalyticsEngine } from '../services/analytics';
import { translations } from '../config/translations';

interface BlockDetailModalProps {
  block: CampusBlock | null;
  onClose: () => void;
  onTriggerAlert: (blockName: string, problem: string, loss: number) => void;
  recommendations: Recommendation[];
  language: Language;
}

export const BlockDetailModal: React.FC<BlockDetailModalProps> = ({
  block,
  onClose,
  onTriggerAlert,
  recommendations,
  language,
}) => {
  if (!block) return null;

  const t = translations[language] || translations.en;
  const hourlyData = AnalyticsEngine.getHourlyUsage(block.id);
  const blockRecs = recommendations.filter(r => r.blockId === block.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-blue-900/60 my-auto relative text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-blue-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950 border border-blue-700/60 text-blue-300">
                {block.code}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  block.status === 'efficient'
                    ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                    : block.status === 'warning'
                    ? 'bg-amber-950/80 border border-amber-700/60 text-amber-300'
                    : 'bg-rose-950/80 border border-rose-700/60 text-rose-300'
                }`}
              >
                {block.status === 'efficient'
                  ? t.efficient
                  : block.status === 'warning'
                  ? t.warning
                  : t.wasting}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">{block.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>Type: <strong className="capitalize text-slate-200">{block.type}</strong></span>
              <span>•</span>
              <span>Floor {block.floor}</span>
              <span>•</span>
              <span>{block.numberOfRooms} Rooms</span>
              <span>•</span>
              <span>{block.areaSqFt.toLocaleString()} sq ft</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">Meter: {block.meterId}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all cursor-pointer border border-transparent hover:border-blue-900/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Electricity</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
              {block.electricityKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">Today's total</div>
          </div>

          <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Water Used</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-200 mt-1">
              {block.waterLitres.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <div className="text-[11px] text-blue-400/80 mt-0.5">Flow & Tanker volume</div>
          </div>

          <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Trash2 className="w-4 h-4 text-emerald-400" />
              <span>Solid Waste</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-200 mt-1">
              {block.wasteKg} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Wet + Dry segregated</div>
          </div>

          <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Wastage Loss</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1">
              ₹{block.wastageRupees.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-0.5">Preventable loss / day</div>
          </div>
        </div>

        {/* 24-Hour Hourly Consumption Chart */}
        <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-blue-900/40 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">
                24-Hour Electricity Profile vs. Timetable Baseline
              </h4>
              <p className="text-xs text-slate-400">
                Green shaded zone is scheduled occupied class hours (08:00 - 18:00).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
                Actual Load (kW)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 bg-slate-500 rounded-full inline-block"></span>
                Baseline (kW)
              </span>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="elecGradModal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 p-3 rounded-xl shadow-xl border border-blue-800 text-xs text-slate-200">
                          <div className="font-bold text-white">{label}</div>
                          <div className="text-cyan-400 font-semibold mt-1">
                            Actual: {data.electricity} kW
                          </div>
                          <div className="text-slate-400">
                            Baseline: {data.baseline} kW
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Status: {data.isOccupied ? 'Occupied Class' : 'Unoccupied'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="electricity"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#elecGradModal)"
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Specific Recommendations */}
        <div className="mb-6">
          <h4 className="font-bold text-white text-base mb-3">
            Active Recommendations for {block.name}
          </h4>
          {blockRecs.length > 0 ? (
            <div className="space-y-3">
              {blockRecs.map(rec => (
                <div
                  key={rec.id}
                  className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                        {rec.effort} Effort • Payback: {rec.paybackTime}
                      </span>
                      <h5 className="font-bold text-sm text-white">{rec.title}</h5>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Saves:</span>
                    <span className="text-base font-black text-emerald-400">
                      ₹{rec.savingsRupeesPerMonth.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 bg-slate-900/70 p-3 rounded-xl border border-blue-900/30">
              No pending anomalies recorded for this block. Current performance is within green parameters.
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-blue-900/40">
          <button
            type="button"
            onClick={() =>
              onTriggerAlert(
                block.name,
                `Wastage detected in ${block.name}: ₹${block.wastageRupees}/day excess loss.`,
                Math.round(block.wastageRupees / 24)
              )
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Send Alert to Block Supervisor</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
