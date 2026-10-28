import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Zap,
  Droplets,
  Trash2,
  Gift,
  Flame,
  CheckCircle2,
  Users,
  Building2,
  User,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { UserRewardProfile, LeaderboardEntry, Language } from '../types';
import { CampusStorage } from '../services/storage';
import { ActionCard } from '../components/ActionCard';
import { WeeklyGreenChallenge } from '../components/WeeklyGreenChallenge';
import { translations } from '../config/translations';

interface RewardsPageProps {
  userRewards: UserRewardProfile;
  leaderboard: LeaderboardEntry[];
  onRefreshRewards: () => void;
  language: Language;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({
  userRewards,
  leaderboard,
  onRefreshRewards,
  language,
}) => {
  const [selectedLeaderboardTab, setSelectedLeaderboardTab] = useState<
    'all' | 'block' | 'hostel' | 'department' | 'individual'
  >('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'water_leak' | 'empty_room' | 'waste_overflow'>('water_leak');
  const [reportLocation, setReportLocation] = useState('Hostel Boys Wing C');
  const [reportNotes, setReportNotes] = useState('');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  const t = translations[language] || translations.en;

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    CampusStorage.addPoints(50, `Reported ${reportType} at ${reportLocation}`);
    triggerConfetti();
    onRefreshRewards();
    setShowReportModal(false);
    setClaimSuccessMsg('Wastage logged! +50 Eco Points awarded to your profile.');
    setTimeout(() => setClaimSuccessMsg(''), 4000);
  };

  const handleClaimReward = (itemTitle: string, pointCost: number) => {
    if (userRewards.points < pointCost) {
      alert(`You need ${pointCost} points for ${itemTitle}. Current balance: ${userRewards.points} points.`);
      return;
    }
    CampusStorage.addPoints(-pointCost, `Redeemed ${itemTitle}`);
    triggerConfetti();
    onRefreshRewards();
    setClaimSuccessMsg(`🎉 Success! You claimed "${itemTitle}". Voucher code sent to your email.`);
    setTimeout(() => setClaimSuccessMsg(''), 4000);
  };

  const handleChallengeAction = (points: number, kwhSaved: number, description: string) => {
    CampusStorage.addPoints(points, description);
    onRefreshRewards();
  };

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (selectedLeaderboardTab === 'all') return true;
    return entry.type === selectedLeaderboardTab;
  });

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoRewards}
        buttonLabel="Report a Wastage (+50 pts)"
        onActionClick={() => setShowReportModal(true)}
        accentColor="blue"
      />

      {claimSuccessMsg && (
        <div className="p-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl shadow-blue-950 border border-blue-400/40 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow shrink-0" />
          <span>{claimSuccessMsg}</span>
        </div>
      )}

      {/* Profile Points & Streaks Showcase */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-xl shadow-black/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-950/90 backdrop-blur-md flex items-center justify-center text-white border border-blue-700/60 shrink-0 shadow-xl shadow-blue-950">
              <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-inner">
                  Campus Eco Champion
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {userRewards.streakDays}-Day Saving Streak
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {userRewards.points.toLocaleString()} Eco Points
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Saved ₹{userRewards.totalSavedRupees.toLocaleString()} across {userRewards.totalSavedKwh} kWh & {userRewards.totalSavedLitres.toLocaleString()} Litres
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-cyan-200" />
            <span>Report Leak or Wastage (+50 pts)</span>
          </button>
        </div>
      </div>

      {/* Extended Interactive Weekly Green Challenge Component */}
      <WeeklyGreenChallenge
        language={language}
        onActionContributed={handleChallengeAction}
        userRewards={userRewards}
      />

      {/* Campus Badges */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <h3 className="text-lg font-bold text-white mb-4">
          Sustainability Badges & Honors
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {userRewards.badges.map(badge => {
            const isUnlocked = badge.unlocked;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-blue-700/60 shadow-lg shadow-black/40'
                    : 'bg-slate-950/30 border-blue-950/40 opacity-40 grayscale'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2.5 ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md shadow-blue-900/50'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs text-white">{badge.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                  {badge.description}
                </p>
                <span className={`text-[9px] font-black mt-2 block uppercase ${
                  isUnlocked ? 'text-cyan-300' : 'text-slate-500'
                }`}>
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Catalogue & Leaderboard (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards Catalogue */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
            <div>
              <h3 className="text-lg font-bold text-white">Rewards Catalogue</h3>
              <p className="text-xs text-slate-400">
                Redeem your hard-earned points for campus perks
              </p>
            </div>
            <Gift className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="space-y-3 mt-4">
            {[
              {
                title: 'Presidency Canteen ₹100 Coupon',
                desc: 'Valid at main food court, Nescafe counter & Juice bar.',
                cost: 300,
                tag: 'Popular',
              },
              {
                title: 'University Green Certificate',
                desc: 'Official signed digital certificate for resume & academic portfolio.',
                cost: 500,
                tag: 'Academic',
              },
              {
                title: 'Digital Notice Board Recognition',
                desc: 'Your name/team featured on Presidency main auditorium digital screen.',
                cost: 750,
                tag: 'Honor',
              },
              {
                title: 'Presidency Tree Planter Plaque',
                desc: 'A native sapling planted on campus with your dedicated nameplate.',
                cost: 1000,
                tag: 'Eco Hero',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-blue-900/40 hover:border-blue-500/60 transition-all flex items-center justify-between gap-3 bg-slate-950/80 shadow-md shadow-black/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
                      {item.tag}
                    </span>
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{item.desc}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-400 block">
                    {item.cost} Pts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleClaimReward(item.title, item.cost)}
                    className="mt-1.5 px-3 py-1 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-950 border border-blue-400/30 transition-all cursor-pointer"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Leaderboard */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
            <div>
              <h3 className="text-lg font-bold text-white">Campus Leaderboard</h3>
              <p className="text-xs text-slate-400">Top blocks, hostels & sustainability heroes</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-blue-900/40">
              {(['all', 'block', 'hostel'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedLeaderboardTab(tab)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    selectedLeaderboardTab === tab
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-blue-950/60 mt-3">
            {filteredLeaderboard.map(entry => (
              <div
                key={entry.rank}
                className={`py-3 px-2 flex items-center justify-between transition-colors rounded-xl ${
                  entry.isCurrentUser ? 'bg-blue-950/80 border border-blue-700/60 font-bold' : 'hover:bg-blue-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-xs shadow-amber-400'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {entry.name} {entry.isCurrentUser && '(You)'}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {entry.type} • Saved ₹{entry.savingsRupees.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-cyan-300 block">
                    {entry.points} pts
                  </span>
                  <span className="text-[10px] text-slate-400">{entry.badgeCount} Badges</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Report Leak Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-800/60 text-white shadow-black">
            <h3 className="text-xl font-bold text-white mb-1">
              Report Campus Wastage / Leak
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Help facility staff intervene quickly and earn +50 Eco Points!
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Issue Type
                </label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="water_leak">Active Water Pipe / Cistern Leak</option>
                  <option value="empty_room">Unoccupied Room with Lights & Fans ON</option>
                  <option value="waste_overflow">Overflowing Solid Waste Bin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Location / Room
                </label>
                <input
                  type="text"
                  required
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  placeholder="e.g. Block B Room 302, Hostel Girls Floor 2"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-blue-900/60 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  placeholder="e.g. Tap won't shut completely, water overflowing since 10 mins..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-900/60 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-blue-900/30">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-950 border border-blue-400/30 cursor-pointer"
                >
                  Submit & Earn +50 Pts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
