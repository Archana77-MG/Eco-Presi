import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CampusBlock, Recommendation, Language } from '../types';
import { ForecastingEngine } from '../services/forecasting';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface PredictionsPageProps {
  blocks: CampusBlock[];
  recommendations: Recommendation[];
  onMarkRecommendationDone: (id: string) => void;
  language: Language;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  blocks,
  recommendations,
  onMarkRecommendationDone,
  language,
}) => {
  const t = translations[language] || translations.en;
  const predictions = ForecastingEngine.get7DayPredictions(blocks);
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0]?.id || 'blk-b');

  const selectedPred = predictions.find(p => p.blockId === selectedBlockId) || predictions[0];

  // Cumulative savings from completed recommendations
  const completedRecs = recommendations.filter(r => r.status === 'completed');
  const totalVerifiedSavingsRupees = completedRecs.reduce(
    (sum, r) => sum + r.savingsRupeesPerMonth,
    0
  );
  const totalPendingPotentialRupees = recommendations
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.savingsRupeesPerMonth, 0);

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoPredictions}
        buttonLabel="Review Next 7-Day Forecast"
        onActionClick={() => {
          const el = document.getElementById('forecast-chart');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        accentColor="blue"
      />

      {/* Top Banner: Predict Waste Before it Happens */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-xl shadow-black/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-inner">
                Predictive AI Engine
              </span>
              <span className="text-xs text-blue-400 font-semibold">
                Moving Average + Day-of-Week Seasonality
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Predict Waste Before It Happens
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
              Forecasts expected load for the next 7 days based on scheduled occupancy, weekend drop-offs, and historical anomalies to intervene before money is lost.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-blue-900/50 text-center shadow-lg shadow-black/50">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                Savings Achieved
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                ₹{totalVerifiedSavingsRupees.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">/ month verified</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-amber-900/50 text-center shadow-lg shadow-black/50">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Pending Potential
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                ₹{totalPendingPotentialRupees.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">/ month to unlock</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Grid per Block */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-blue-900/30">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              7-Day Campus Forecast & Baseline Overrun
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select a facility to inspect projected daily electricity demand
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {predictions.map(pred => (
              <button
                key={pred.blockId}
                onClick={() => setSelectedBlockId(pred.blockId)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedBlockId === pred.blockId
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-blue-900/40'
                }`}
              >
                {pred.blockName.replace('Academic Block ', 'Block ')}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Block Forecast Summary & Chart */}
        {selectedPred && (
          <div id="forecast-chart" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/40">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Weekly Baseline
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  {selectedPred.currentBaseline.toLocaleString()} kWh
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-400 uppercase block">
                  Projected Demand (7 Days)
                </span>
                <span className="text-xl font-black text-amber-300 mt-1 block">
                  {selectedPred.predictedUsage7Days.toLocaleString()} kWh
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-900/40">
                <span className="text-[11px] font-bold text-rose-400 uppercase block">
                  Overrun Expected
                </span>
                <span className="text-xl font-black text-rose-400 mt-1 block">
                  +{selectedPred.percentOverBaseline}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-900 to-red-900 text-white shadow-lg border border-rose-700/50">
                <span className="text-[11px] font-bold text-rose-200 uppercase block">
                  Expected Extra Cost
                </span>
                <span className="text-2xl font-black mt-1 block text-white">
                  ₹{selectedPred.expectedExtraCostRupees.toLocaleString()}
                </span>
                <span className="text-[10px] text-rose-200 block mt-0.5">
                  Avoidable with quick actions
                </span>
              </div>
            </div>

            {/* Daily Bar Chart */}
            <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-blue-900/40 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Daily Forecast vs Baseline: {selectedPred.blockName}
                </span>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block shadow-xs shadow-blue-500"></span>
                    Scheduled Baseline
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block shadow-xs shadow-amber-400"></span>
                    Predicted Demand
                  </span>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedPred.dailyForecast}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#030712',
                        borderColor: '#1e3a8a',
                        color: '#f8fafc',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Bar dataKey="baseline" name="Baseline (kWh)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="predicted" name="Predicted (kWh)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Measurable Recommendations with "Mark as done" */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div>
            <h3 className="text-xl font-bold text-white">
              Measurable Action Plan & Recommendations ({recommendations.length})
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              High-ROI actions with clear effort, payback time, and verified Rupee tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60">
              {completedRecs.length} Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          {recommendations.map(rec => {
            const isCompleted = rec.status === 'completed';

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-5 border transition-all shadow-lg shadow-black/40 ${
                  isCompleted
                    ? 'bg-slate-950/80 border-emerald-800/50'
                    : 'bg-slate-950/80 border-blue-900/40 hover:border-blue-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
                        {rec.blockName}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          rec.effort === 'Easy'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : rec.effort === 'Medium'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        }`}
                      >
                        {rec.effort} Effort
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-blue-900/40">
                        Payback: {rec.paybackTime}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950 border border-emerald-700/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-medium">
                      {rec.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/30">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Estimated Monthly Savings</span>
                      <span className="text-lg font-black text-cyan-400">
                        ₹{rec.savingsRupeesPerMonth.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        ({rec.savingsUnitPerMonth.toLocaleString()} {rec.resource === 'electricity' ? 'kWh' : rec.resource === 'water' ? 'L' : 'kg'}/mo)
                      </span>
                    </div>

                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => onMarkRecommendationDone(rec.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-cyan-200" />
                        <span>Mark as Done</span>
                      </button>
                    ) : (
                      <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Savings Logged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
