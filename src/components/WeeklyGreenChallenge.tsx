import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  Droplets,
  Trash2,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Language, UserRewardProfile } from '../types';
import { translations } from '../config/translations';

interface WeeklyGreenChallengeProps {
  language: Language;
  onActionContributed: (points: number, kwhSaved: number, description: string) => void;
  userRewards: UserRewardProfile;
}

export type ChallengeResource = 'electricity' | 'water' | 'waste' | 'all';

interface ChallengeTrack {
  id: ChallengeResource;
  title: string;
  subtitle: string;
  current: number;
  goal: number;
  unit: string;
  rupeesSaved: number;
  icon: any;
  color: string;
  colorGrad: string;
  bgGrad: string;
  blockContributions: { name: string; amount: number; pct: number }[];
}

export const WeeklyGreenChallenge: React.FC<WeeklyGreenChallengeProps> = ({
  language,
  onActionContributed,
  userRewards,
}) => {
  const [activeTrack, setActiveTrack] = useState<ChallengeResource>('electricity');
  const [bonusAddedKwh, setBonusAddedKwh] = useState<number>(0);
  const [recentContributedAction, setRecentContributedAction] = useState<string | null>(null);
  const [showPledgeModal, setShowPledgeModal] = useState<boolean>(false);
  const [pledgeAction, setPledgeAction] = useState<string>('lights_off');
  const [pledgeBlock, setPledgeBlock] = useState<string>('Academic Block A');

  const t = translations[language] || translations.en;

  // Base progress numbers with interactive additions
  const tracks: Record<ChallengeResource, ChallengeTrack> = {
    electricity: {
      id: 'electricity',
      title: 'Presidency 1,500 kWh Conservation Sprint',
      subtitle: 'Switch off empty lecture halls, labs & hostel corridor night loads',
      current: 1120 + bonusAddedKwh,
      goal: 1500,
      unit: 'kWh',
      rupeesSaved: (1120 + bonusAddedKwh) * 8,
      icon: Zap,
      color: 'blue',
      colorGrad: 'from-blue-600 to-cyan-500',
      bgGrad: 'bg-slate-950/80 border-blue-900/50',
      blockContributions: [
        { name: 'Academic Block A', amount: 380, pct: 34 },
        { name: 'Hostel Boys & Girls', amount: 290, pct: 26 },
        { name: 'Central Library', amount: 240, pct: 21 },
        { name: 'Academic Block B & C', amount: 210, pct: 19 },
      ],
    },
    water: {
      id: 'water',
      title: 'Hostel 50,000 Litres Leak Patrol',
      subtitle: 'Eliminate continuous cistern flow & dripping taps across residential blocks',
      current: 38500 + bonusAddedKwh * 25,
      goal: 50000,
      unit: 'Litres',
      rupeesSaved: Math.round(((38500 + bonusAddedKwh * 25) / 1000) * 40),
      icon: Droplets,
      color: 'cyan',
      colorGrad: 'from-cyan-600 to-blue-500',
      bgGrad: 'bg-slate-950/80 border-cyan-900/50',
      blockContributions: [
        { name: 'Hostel Boys', amount: 16500, pct: 43 },
        { name: 'Hostel Girls', amount: 13200, pct: 34 },
        { name: 'Canteen & Mess', amount: 8800, pct: 23 },
      ],
    },
    waste: {
      id: 'waste',
      title: 'Zero-Food-Waste Canteen Target',
      subtitle: 'Food waste diversion to Itgalpura biogas digester & organic compost',
      current: 780 + bonusAddedKwh * 10,
      goal: 1000,
      unit: 'kg',
      rupeesSaved: (780 + bonusAddedKwh * 10) * 5,
      icon: Trash2,
      color: 'emerald',
      colorGrad: 'from-emerald-600 to-teal-500',
      bgGrad: 'bg-slate-950/80 border-emerald-900/50',
      blockContributions: [
        { name: 'University Canteen', amount: 480, pct: 62 },
        { name: 'Hostel Mess', amount: 210, pct: 27 },
        { name: 'Campus Kiosks', amount: 90, pct: 11 },
      ],
    },
    all: {
      id: 'all',
      title: 'Presidency ₹15,000 Budget Recovery',
      subtitle: 'Combined financial savings target across all campus utilities',
      current: 12420 + bonusAddedKwh * 8,
      goal: 15000,
      unit: '₹',
      rupeesSaved: 12420 + bonusAddedKwh * 8,
      icon: Trophy,
      color: 'indigo',
      colorGrad: 'from-blue-600 via-indigo-600 to-cyan-500',
      bgGrad: 'bg-slate-950/80 border-blue-800/50',
      blockContributions: [
        { name: 'Electricity Cut-Offs', amount: 8960, pct: 72 },
        { name: 'Water Leak Repairs', amount: 2140, pct: 17 },
        { name: 'Compost Landfill Savings', amount: 1320, pct: 11 },
      ],
    },
  };

  const currentTrack = tracks[activeTrack];
  const progressPct = Math.min(100, Math.round((currentTrack.current / currentTrack.goal) * 100));

  // Milestones
  const milestones = [
    { pct: 25, label: 'Bronze', reward: 'Notice Board Banner', achieved: progressPct >= 25 },
    { pct: 50, label: 'Silver', reward: 'Free Solar Hub Wi-Fi Boost', achieved: progressPct >= 50 },
    { pct: 75, label: 'Gold', reward: '10% Canteen Green Day', achieved: progressPct >= 75 },
    { pct: 100, label: 'Diamond', reward: '+200 Pts & Native Tree Plaque', achieved: progressPct >= 100 },
  ];

  // Quick Action / Pledge Handler
  const handleContributeAction = (actionLabel: string, kwh: number, points: number) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch (e) {}

    setBonusAddedKwh(prev => prev + kwh);
    setRecentContributedAction(`🎉 You logged: "${actionLabel}" (+${kwh} ${currentTrack.unit} saved, +${points} Eco Points)!`);
    onActionContributed(points, kwh, actionLabel);

    setTimeout(() => {
      setRecentContributedAction(null);
    }, 4500);
  };

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actionDetails: Record<string, { label: string; amount: number; pts: number }> = {
      lights_off: { label: `Switched off unoccupied classroom fixtures in ${pledgeBlock}`, amount: 35, pts: 40 },
      ac_24: { label: `Standardized AC thermostat to 24°C in ${pledgeBlock}`, amount: 50, pts: 60 },
      tap_tighten: { label: `Secured dripping tap in ${pledgeBlock} washroom`, amount: 25, pts: 35 },
      clean_mess: { label: `Sorted 100% wet waste in ${pledgeBlock}`, amount: 20, pts: 30 },
    };

    const item = actionDetails[pledgeAction] || actionDetails.lights_off;
    handleContributeAction(item.label, item.amount, item.pts);
    setShowPledgeModal(false);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-blue-900/40 shadow-xl shadow-black/60 mb-8 space-y-6 text-white">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-900/30">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60">
              Campus Communal Quest
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Cycle Ends in 3 Days, 14 Hrs</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/50">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>14,500 Students & Staff Participating</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span>Weekly Green Challenge</span>
            <span className="text-sm font-bold text-cyan-300 bg-blue-950/90 px-2.5 py-0.5 rounded-lg border border-blue-700/60">
              {progressPct}% Achieved
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl font-medium">
            Live communal progress bar uniting Presidency University’s academic blocks, hostels, and dining halls to reach collective sustainability milestones.
          </p>
        </div>

        {/* Track Category Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-blue-900/50 overflow-x-auto self-start lg:self-auto shadow-inner">
          {(['electricity', 'water', 'waste', 'all'] as const).map(trackKey => {
            const tr = tracks[trackKey];
            const Icon = tr.icon;
            const isSelected = activeTrack === trackKey;
            return (
              <button
                key={trackKey}
                type="button"
                onClick={() => setActiveTrack(trackKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/70 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`} />
                <span className="capitalize">{trackKey}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Immediate Feedback Toast */}
      {recentContributedAction && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-950 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2 border border-blue-400/40">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow shrink-0" />
            <span>{recentContributedAction}</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-100 bg-white/20 px-2 py-0.5 rounded-md">
            Progress Updated
          </span>
        </div>
      )}

      {/* Main Communal Progress Bar Section */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${currentTrack.bgGrad} shadow-xl shadow-black/50`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {currentTrack.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              {currentTrack.subtitle}
            </p>
          </div>

          <div className="flex items-baseline gap-2 sm:text-right">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {currentTrack.current.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {currentTrack.goal.toLocaleString()} {currentTrack.unit}
            </span>
            <span className="text-xs font-black text-cyan-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800/60 ml-1">
              ₹{currentTrack.rupeesSaved.toLocaleString()} Saved
            </span>
          </div>
        </div>

        {/* Large Visual Progress Bar with Dynamic Striping & Milestone Pins */}
        <div className="relative my-4">
          <div className="w-full bg-slate-900 h-6 sm:h-7 rounded-2xl overflow-hidden p-1 border border-blue-900/60 shadow-inner">
            <div
              className={`bg-gradient-to-r ${currentTrack.colorGrad} h-full rounded-xl transition-all duration-700 shadow-md relative overflow-hidden flex items-center justify-end pr-2`}
              style={{ width: `${progressPct}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse" />
              <span className="text-[10px] font-black text-white relative z-10 drop-shadow-xs">
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Milestone markers along the bar */}
          <div className="grid grid-cols-4 gap-1 mt-2 text-center">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 mb-1 ${
                    m.achieved
                      ? 'bg-cyan-400 border-white shadow-xs shadow-cyan-400'
                      : 'bg-slate-700 border-slate-900'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    m.achieved ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  {m.pct}% ({m.label})
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:block truncate max-w-[120px]">
                  {m.reward}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons to Contribut to Goal Right Now */}
        <div className="pt-3 border-t border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-semibold">
              Live Pulse: 84 campus members contributed savings in the last 4 hours.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleContributeAction('Toggled corridor night switches in Block B', 30, 40)}
              className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-blue-800/60 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick +30 kWh Cut</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPledgeModal(true)}
              className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-cyan-200" />
              <span>Contribute Action (+Pts)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Breakdown Columns: 1. Communal Block Contribution + 2. Unlocked Rewards Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Column 1: Communal Contributions by Facility */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-blue-900/40 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-900/30">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Facility & Block Share towards Goal
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Contribution %
            </span>
          </div>

          <div className="space-y-2.5">
            {currentTrack.blockContributions.map((blk, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate max-w-[210px]">
                    {blk.name}
                  </span>
                  <span className="font-bold text-cyan-300">
                    {blk.amount.toLocaleString()} {currentTrack.unit} ({blk.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-blue-950">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
                    style={{ width: `${blk.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Collective Milestone Rewards */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-blue-900/40 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-900/30">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Unlocked Campus Perks this Cycle
              </h4>
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
              3 of 4 Unlocked
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Notice Board Honor Roll
                  </span>
                  <span className="text-[10px] text-slate-400">25% milestone reached on Tuesday</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-cyan-300 uppercase bg-blue-950 border border-blue-800/60 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Solar Bench Wi-Fi Speed Boost
                  </span>
                  <span className="text-[10px] text-slate-400">50% milestone reached on Wednesday</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-cyan-300 uppercase bg-blue-950 border border-blue-800/60 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    10% Canteen Green Subsidy Day
                  </span>
                  <span className="text-[10px] text-slate-400">75% milestone reached today!</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-cyan-300 uppercase bg-blue-950 border border-blue-800/60 px-2 py-0.5 rounded">
                Unlocked
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-blue-900/30 flex items-center justify-between opacity-75">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-300 block">
                    +200 Pts & Itgalpura Native Tree Plaque
                  </span>
                  <span className="text-[10px] text-slate-500">Requires 380 more kWh to unlock 100%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Contribute Custom Action / Pledge */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-800/60 text-white shadow-black">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/40 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Log Your Saving Action
                </h3>
                <p className="text-xs text-slate-400">
                  Boost Presidency University's communal challenge progress!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPledgeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePledgeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Choose Action Completed
                </label>
                <select
                  value={pledgeAction}
                  onChange={e => setPledgeAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="lights_off">Switched off empty room lights/fans (+35 kWh, +40 pts)</option>
                  <option value="ac_24">Set air conditioning thermostat to 24°C (+50 kWh, +60 pts)</option>
                  <option value="tap_tighten">Closed running washroom tap / cistern (+25 L, +35 pts)</option>
                  <option value="clean_mess">Zero-waste plate segregation in Canteen (+20 kg, +30 pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Campus Location / Block
                </label>
                <select
                  value={pledgeBlock}
                  onChange={e => setPledgeBlock(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="Academic Block A">Academic Block A</option>
                  <option value="Academic Block B">Academic Block B</option>
                  <option value="Academic Block C (Labs)">Academic Block C (Labs)</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Hostel Boys">Hostel Boys</option>
                  <option value="Hostel Girls">Hostel Girls</option>
                  <option value="University Canteen">University Canteen</option>
                  <option value="Admin Block">Admin Block</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 text-xs text-cyan-200">
                Logging this action will immediately increase the communal progress bar and award points to your profile!
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setShowPledgeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-950 border border-blue-400/30 cursor-pointer"
                >
                  Submit & Boost Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
