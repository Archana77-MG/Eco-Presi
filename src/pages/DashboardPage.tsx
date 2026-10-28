import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Trash2,
  TrendingDown,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CampusBlock, TariffSettings, WastageAnomaly, Language } from '../types';
import { AnalyticsEngine } from '../services/analytics';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface DashboardPageProps {
  blocks: CampusBlock[];
  tariffs: TariffSettings;
  anomalies: WastageAnomaly[];
  language: Language;
  onOpenAlertModal: (blockName: string, problem: string, loss: number) => void;
  onNavigateTab: (tab: any) => void;
  onSelectBlock: (block: CampusBlock) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  blocks,
  tariffs,
  anomalies,
  language,
  onOpenAlertModal,
  onNavigateTab,
  onSelectBlock,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const t = translations[language] || translations.en;

  const metrics = AnalyticsEngine.getDashboardMetrics(blocks, tariffs, anomalies, dateFilter);
  const hourlyUsageData = AnalyticsEngine.getHourlyUsage();
  const blockComparisonData = AnalyticsEngine.getBlockComparison(blocks);
  const wastageTrendData = AnalyticsEngine.getWastageTrend();
  const timetableData = AnalyticsEngine.getTimetableComparison();

  return (
    <div className="space-y-6">
      {/* "What should I do now?" Action Card */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoDashboard}
        buttonLabel={t.topProblemsTitle.split(' ')[0] + ' Alerts'}
        onActionClick={() => {
          if (metrics.top3Problems.length > 0) {
            const p = metrics.top3Problems[0];
            onOpenAlertModal(p.blockName, p.description, p.estimatedLossRupees);
          }
        }}
        accentColor="blue"
      />

      {/* Date Filter & Campus Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-blue-900/40 shadow-xl shadow-black/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Presidency Campus Resource Command</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block"></span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time telemetry across Academic Blocks A-C, Hostels, Canteen & Utilities (Itgalpura, Yelahanka)
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-blue-900/50 self-start sm:self-auto shadow-inner">
          {(['today', 'week', 'month', 'year'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setDateFilter(f)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                dateFilter === f
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {f === 'today'
                ? t.filterToday
                : f === 'week'
                ? t.filterWeek
                : f === 'month'
                ? t.filterMonth
                : t.filterYear}
            </button>
          ))}
        </div>
      </div>

      {/* 6 High-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Electricity */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl p-4 sm:p-5 transition-all hover:border-blue-500/60 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {t.electricity}
            </span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics.totalElectricityKwh.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1">kWh</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1 font-medium">₹8/kWh tariff rate</p>
        </div>

        {/* Water */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl p-4 sm:p-5 transition-all hover:border-cyan-500/60 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {t.water}
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {Math.round(metrics.totalWaterLitres / 1000).toLocaleString()}k
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1">Litres</span>
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-1 font-medium">Tanker + borewell</p>
        </div>

        {/* Waste */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl p-4 sm:p-5 transition-all hover:border-emerald-500/60 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {t.waste}
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics.totalWasteKg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1">kg</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">Wet + dry segregated</p>
        </div>

        {/* Total Wastage in Rupees */}
        <div className="bg-rose-950/40 border-2 border-rose-800/60 rounded-3xl p-4 sm:p-5 transition-all hover:border-rose-500 shadow-xl shadow-rose-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
              Wastage (₹)
            </span>
            <div className="p-2 rounded-xl bg-rose-900/80 text-rose-300 border border-rose-700/60 animate-pulse">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">
              ₹{metrics.totalWastageRupees.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-rose-300 font-bold mt-1">Preventable money lost</p>
        </div>

        {/* CO2 Avoided */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl p-4 sm:p-5 transition-all hover:border-blue-500/60 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              {t.co2Saved}
            </span>
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/50">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics.co2SavedKg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1">kg</span>
          </div>
          <p className="text-[11px] text-teal-400/80 mt-1 font-medium">Karnataka grid factor</p>
        </div>

        {/* Campus Eco Score */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 border border-blue-500/40 text-white rounded-3xl p-4 sm:p-5 shadow-xl shadow-blue-950/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              {t.ecoScore}
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-cyan-300 border border-cyan-400/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white">{metrics.campusEcoScore}</span>
            <span className="text-xs text-cyan-200 font-bold">/ 100</span>
          </div>
          <p className="text-[11px] text-cyan-200/90 font-medium mt-1">7 of 10 blocks green</p>
        </div>
      </div>

      {/* Top 3 Problems Right Now with One-Click Alert */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.topProblemsTitle}</h3>
              <p className="text-xs text-slate-400">
                Identified automatically by live telemetry sensor rule checks
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('wastage')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Anomalies</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {metrics.top3Problems.map((prob, idx) => (
            <div
              key={prob.id}
              className="rounded-2xl p-4 border border-rose-800/60 bg-rose-950/20 backdrop-blur-xs flex flex-col justify-between shadow-lg shadow-black/40"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300 uppercase px-2 py-0.5 rounded bg-rose-900/60 border border-rose-800/60">
                    Priority #{idx + 1} • {prob.blockName}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{prob.timestamp}</span>
                </div>

                <h4 className="font-bold text-sm text-white mt-2">{prob.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2 font-medium">
                  {prob.description}
                </p>

                <div className="mt-3 p-2 bg-slate-950/80 rounded-xl border border-rose-900/60 text-xs">
                  <span className="text-slate-400 block text-[10px]">Financial Impact:</span>
                  <span className="font-black text-rose-400 text-base">
                    ₹{prob.estimatedLossRupees.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {' '}
                    {prob.type === 'water_leak' ? '/day' : '/hr'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-900/40 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Action: Alert guard</span>
                <button
                  type="button"
                  onClick={() =>
                    onOpenAlertModal(prob.blockName, prob.description, prob.estimatedLossRupees)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-950/80 transition-all cursor-pointer border border-rose-400/40"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t.sendAlert}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 24-Hr Campus Usage Profile */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                24-Hour Campus Resource Curve
              </h3>
              <p className="text-xs text-slate-400">Electricity (kW) & Water (L/hr)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block shadow-xs shadow-amber-400"></span>
                Electricity
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block shadow-xs shadow-cyan-400"></span>
                Water
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyUsageData}>
                <defs>
                  <linearGradient id="elecHomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#1e3a8a',
                    color: '#f8fafc',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="electricity"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#elecHomeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Block-wise Resource Comparison */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Block-wise Electricity Comparison
              </h3>
              <p className="text-xs text-slate-400">Daily kWh per academic building & hostel</p>
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">kWh / Day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#1e3a8a',
                    color: '#f8fafc',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                />
                <Bar
                  dataKey="electricity"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  onClick={(data: any) => {
                    const found = blocks.find(b => b.code === data.code);
                    if (found) onSelectBlock(found);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Wastage Trend in Rupees (7 Days) */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                7-Day Wastage Trend (Rupees ₹)
              </h3>
              <p className="text-xs text-slate-400">Preventable losses across resources</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 rounded-xl">
              <span>Avg: ₹3,320 / day</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wastageTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  formatter={(value: any) => [`₹${value}`, 'Cost Lost']}
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#1e3a8a',
                    color: '#f8fafc',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalLoss"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f43f5e', stroke: '#030712', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Timetable Comparison (Occupied vs Empty) */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Usage vs. University Timetable Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Actual Load vs. Scheduled Baseline (Detects empty room burn)
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
              Timetable Interlock
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timetableData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#1e3a8a',
                    color: '#f8fafc',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="actualLoadKwh" name="Actual (kW)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scheduledBaselineKwh" name="Baseline (kW)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
