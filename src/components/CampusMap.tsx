import React from 'react';
import { CampusBlock, Language } from '../types';
import { Zap, Droplets, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { translations } from '../config/translations';

interface CampusMapProps {
  blocks: CampusBlock[];
  onSelectBlock: (block: CampusBlock) => void;
  language: Language;
}

export const CampusMap: React.FC<CampusMapProps> = ({ blocks, onSelectBlock, language }) => {
  const t = translations[language] || translations.en;

  const getStatusBadge = (status: CampusBlock['status']) => {
    switch (status) {
      case 'efficient':
        return {
          bg: 'bg-slate-950/80 border-emerald-600/40 text-emerald-200',
          dot: 'bg-emerald-400 shadow-emerald-400/80',
          label: t.efficient,
          icon: CheckCircle,
          ring: 'hover:ring-emerald-500/50 hover:border-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
        };
      case 'warning':
        return {
          bg: 'bg-slate-950/80 border-amber-600/40 text-amber-200',
          dot: 'bg-amber-400 shadow-amber-400/80',
          label: t.warning,
          icon: AlertTriangle,
          ring: 'hover:ring-amber-500/50 hover:border-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-800/60',
        };
      case 'wasting':
        return {
          bg: 'bg-slate-950/80 border-rose-600/50 text-rose-200',
          dot: 'bg-rose-500 shadow-rose-500/80',
          label: t.wasting,
          icon: AlertTriangle,
          ring: 'hover:ring-rose-500/50 hover:border-rose-400',
          badge: 'bg-rose-950 text-rose-300 border-rose-800/60',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60 mb-8">
      {/* Header & Traffic light Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-blue-900/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-950 text-cyan-300 border border-blue-800/60">
              Presidency 65-Acre Layout
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Campus Map & Block Status Grid
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time status of all academic zones, hostels, and campus utilities. Click any block to inspect.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-slate-950 p-2 sm:p-2.5 rounded-2xl border border-blue-900/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400"></span>
            <span className="text-emerald-300">{t.efficient}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs shadow-amber-400"></span>
            <span className="text-amber-300">{t.warning}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-xs shadow-rose-400"></span>
            <span className="text-rose-300">{t.wasting}</span>
          </div>
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {blocks.map(block => {
          const statusInfo = getStatusBadge(block.status);

          return (
            <div
              key={block.id}
              onClick={() => onSelectBlock(block)}
              className={`group relative rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-lg shadow-black/50 hover:shadow-xl hover:ring-2 ${statusInfo.bg} ${statusInfo.ring} active:scale-98`}
            >
              {/* Top Row: Code, Name, Status Dot */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${statusInfo.badge}`}>
                    {block.code}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {block.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {block.type} • Floor {block.floor}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`w-3 h-3 rounded-full ${statusInfo.dot} animate-pulse`}
                    title={statusInfo.label}
                  />
                </div>
              </div>

              {/* Resource Consumption Pills */}
              <div className="grid grid-cols-3 gap-1.5 my-3 pt-2 border-t border-blue-900/30 text-[11px]">
                <div className="bg-slate-900/90 p-1.5 rounded-lg text-center border border-blue-900/40">
                  <div className="flex items-center justify-center text-amber-400 mb-0.5">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-200">{block.electricityKwh}</span>
                  <span className="text-[9px] text-slate-500 block">kWh</span>
                </div>

                <div className="bg-slate-900/90 p-1.5 rounded-lg text-center border border-blue-900/40">
                  <div className="flex items-center justify-center text-cyan-400 mb-0.5">
                    <Droplets className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-200">
                    {Math.round(block.waterLitres / 1000)}k
                  </span>
                  <span className="text-[9px] text-slate-500 block">L</span>
                </div>

                <div className="bg-slate-900/90 p-1.5 rounded-lg text-center border border-blue-900/40">
                  <div className="flex items-center justify-center text-emerald-400 mb-0.5">
                    <Trash2 className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-200">{block.wasteKg}</span>
                  <span className="text-[9px] text-slate-500 block">kg</span>
                </div>
              </div>

              {/* Loss in Rupees tag */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Daily Wastage:</span>
                <span
                  className={`font-black ${
                    block.wastageRupees > 1000 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  ₹{block.wastageRupees.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
