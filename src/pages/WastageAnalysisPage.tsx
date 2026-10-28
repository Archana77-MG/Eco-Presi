import React, { useState } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  Sliders,
  Check,
  Bell,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
} from 'lucide-react';
import { TariffSettings, WastageAnomaly, Language } from '../types';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface WastageAnalysisPageProps {
  tariffs: TariffSettings;
  onSaveTariffs: (newTariffs: TariffSettings) => void;
  anomalies: WastageAnomaly[];
  onResolveAnomaly: (id: string) => void;
  onOpenAlertModal: (blockName: string, problem: string, loss: number) => void;
  language: Language;
}

export const WastageAnalysisPage: React.FC<WastageAnalysisPageProps> = ({
  tariffs,
  onSaveTariffs,
  anomalies,
  onResolveAnomaly,
  onOpenAlertModal,
  language,
}) => {
  const [elecRate, setElecRate] = useState(tariffs.electricityPerKwh);
  const [waterRate, setWaterRate] = useState(tariffs.waterPerKl);
  const [wasteRate, setWasteRate] = useState(tariffs.wastePerKg);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const t = translations[language] || translations.en;

  const handleSaveTariffSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTariffs({
      electricityPerKwh: Number(elecRate),
      waterPerKl: Number(waterRate),
      wastePerKg: Number(wasteRate),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const filteredAnomalies = anomalies.filter(a => {
    if (selectedFilter === 'all') return true;
    return a.status === selectedFilter;
  });

  const totalLoss = anomalies
    .filter(a => a.status === 'active')
    .reduce((sum, a) => sum + a.estimatedLossRupees, 0);

  return (
    <div className="space-y-6 text-white">
      {/* Action Card */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoWastage}
        buttonLabel="Adjust Utility Tariffs"
        onActionClick={() => {
          const el = document.getElementById('tariff-box');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        accentColor="blue"
      />

      {/* Header & Total Loss Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-xl shadow-black/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 inline-block mb-2 shadow-inner">
              Financial Wastage Engine (Rupees ₹)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Resource Leakage & Anomaly Audit
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
              Every identified kilowatt, litre, or kilo is mapped directly to Presidency University utility tariffs, revealing preventable institutional budget bleed.
            </p>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-rose-900/60 text-center shrink-0 shadow-lg shadow-rose-950/40">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
              Active Preventable Loss
            </span>
            <span className="text-3xl sm:text-4xl font-black text-rose-400 mt-1 block">
              ₹{totalLoss.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Across {anomalies.filter(a => a.status === 'active').length} active issues
            </span>
          </div>
        </div>
      </div>

      {/* Editable Tariff Settings Card */}
      <div id="tariff-box" className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-cyan-400 border border-blue-800/60 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Utility Tariff Settings</h3>
              <p className="text-xs text-slate-400">
                Update billing rates (BESCOM, BWSSB, municipal processing)
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-cyan-300 bg-blue-950 px-3 py-1.5 rounded-xl border border-blue-700/60 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-cyan-400" /> Tariffs Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveTariffSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/40">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Electricity Tariff (₹ / kWh)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                step="0.5"
                min="1"
                value={elecRate}
                onChange={e => setElecRate(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-blue-900/60 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 bg-slate-900 text-white"
              />
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1.5 font-medium">
              Default: ₹8.0 (BESCOM Commercial HT-2b)
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/40">
            <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Water Tariff (₹ / kL)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                step="1"
                min="5"
                value={waterRate}
                onChange={e => setWaterRate(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-blue-900/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 bg-slate-900 text-white"
              />
            </div>
            <p className="text-[11px] text-cyan-400/80 mt-1.5 font-medium">
              Default: ₹40.0 (Tanker supply / 1,000 Litres)
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/40">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Solid Waste Processing (₹ / kg)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={wasteRate}
                onChange={e => setWasteRate(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-blue-900/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 bg-slate-900 text-white"
              />
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-1.5 font-medium">
              Default: ₹5.0 (Landfill & handling fee)
            </p>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer"
            >
              Update Tariffs & Recalculate Losses
            </button>
          </div>
        </form>
      </div>

      {/* 5 Plain-Language Anomaly Rules Explained */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>How Ecotria Finds Inefficiency (5 Clear Rules Explained)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30">
            <span className="font-bold text-amber-400 block mb-1">a) Empty Room Burn</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              Compares sensor draw against university class timetable. Active load &gt; 2 kW while unoccupied triggers an alert.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30">
            <span className="font-bold text-rose-400 block mb-1">b) Night/Holiday Excess</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              Detects loads persisting after 11 PM or during Sunday campus lockouts above the 0.5 kW baseline.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30">
            <span className="font-bold text-purple-400 block mb-1">c) Sudden Spike (z-score)</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              Flags sharp unexpected bursts (+3σ standard deviations) indicative of phase unbalance or heavy unmetered equipment.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30">
            <span className="font-bold text-cyan-400 block mb-1">d) Continuous Night Leak</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              Detects steady water flow (&gt;150 L/hr) between 2:00 AM - 5:00 AM indicating broken cistern float valves.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30">
            <span className="font-bold text-emerald-400 block mb-1">e) Solid Waste Overflow</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              Alerts when canteen bins exceed 120% capacity, averting municipal composting surcharges.
            </p>
          </div>
        </div>
      </div>

      {/* Detected Inefficiencies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            Active Findings & Detailed Root Causes ({filteredAnomalies.length})
          </h3>

          <div className="flex items-center gap-2">
            {(['all', 'active', 'resolved'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer capitalize ${
                  selectedFilter === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/70 font-black'
                    : 'bg-slate-900 text-slate-400 border border-blue-900/40 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredAnomalies.map(item => (
            <div
              key={item.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-xl shadow-black/50 ${
                item.status === 'resolved'
                  ? 'bg-slate-950/60 border-blue-900/30 opacity-70'
                  : item.severity === 'critical'
                  ? 'bg-slate-950/90 border-rose-800/60'
                  : 'bg-slate-950/90 border-amber-800/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        item.severity === 'critical'
                          ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                          : item.severity === 'high'
                          ? 'bg-amber-600 text-white shadow-sm shadow-amber-950'
                          : 'bg-blue-600 text-white shadow-sm shadow-blue-950'
                      }`}
                    >
                      {item.severity} Severity
                    </span>
                    <span className="text-xs font-bold text-cyan-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800/60">
                      📍 {item.blockName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">🕒 {item.timestamp}</span>
                    {item.status === 'resolved' && (
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-white">{item.title}</h4>

                  {/* 4 Core Pillars: What, Why, ₹ Lost, Recommended Fix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-900/40">
                      <span className="font-bold text-white block mb-0.5">What happened:</span>
                      <p className="text-slate-300 font-medium">{item.description}</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-900/40">
                      <span className="font-bold text-white block mb-0.5">Why it is a problem:</span>
                      <p className="text-slate-300 font-medium">{item.whyIsProblem}</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-900/50">
                      <span className="font-bold text-emerald-400 block mb-0.5">
                        Recommended Fix:
                      </span>
                      <p className="text-emerald-200/90 font-medium">{item.recommendedFix}</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-900/50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-rose-300 block">Preventable Loss:</span>
                        <span className="text-lg font-black text-rose-400">
                          ₹{item.estimatedLossRupees.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.value} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action buttons */}
                {item.status === 'active' && (
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAlertModal(item.blockName, item.description, item.estimatedLossRupees)
                      }
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/80 transition-all cursor-pointer border border-rose-400/40"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Send Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onResolveAnomaly(item.id)}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950 transition-all cursor-pointer border border-blue-400/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
