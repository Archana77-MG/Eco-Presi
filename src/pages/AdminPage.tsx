import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  AlertOctagon,
  Search,
  Star,
  MessageSquare,
  HardDrive,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { LoginRecord, FeedbackRecord, User, Language } from '../types';
import { CampusStorage } from '../services/storage';
import { ActionCard } from '../components/ActionCard';
import { ALLOWED_USERS } from '../config/allowedUsers';
import { translations } from '../config/translations';

interface AdminPageProps {
  currentUser: User | null;
  language: Language;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'denied'>('all');
  const [loginLogs, setLoginLogs] = useState<LoginRecord[]>(CampusStorage.getLoginLogs());
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>(CampusStorage.getFeedback());

  const t = translations[language] || translations.en;
  const isAdmin = currentUser?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="bg-rose-950/80 border-2 border-rose-800/60 rounded-3xl p-8 text-center max-w-lg mx-auto my-12 text-white shadow-xl shadow-black">
        <AlertOctagon className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-xl font-black text-rose-300">Restricted Admin Area</h3>
        <p className="text-xs text-rose-200 mt-1 font-medium">
          The Login Activity & Audit console is accessible only to users with the "Admin" role (e.g. admin@presidencyuniversity.in).
        </p>
      </div>
    );
  }

  // Filter login logs
  const filteredLogs = loginLogs.filter(log => {
    const matchesSearch =
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate Average Feedback Rating
  const avgRating = feedbackList.length
    ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length).toFixed(1)
    : '5.0';

  const handleClearDemoData = () => {
    if (confirm('Are you sure you want to reset all campus demo logs back to initial factory baseline?')) {
      CampusStorage.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoAdmin}
        buttonLabel="Audit Sign-ins"
        onActionClick={() => {
          const el = document.getElementById('audit-table');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        accentColor="blue"
      />

      {/* Admin Command Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-xl shadow-black/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-inner">
                Presidency IT Administration & Audit
              </span>
              <span className="text-xs text-blue-400 font-mono">
                Access Level: Tier-1 Admin
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Login Activity & University Audit Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
              Monitors authenticated sessions, unauthorized access attempts, and campus department satisfaction metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClearDemoData}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950/80 hover:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl border border-blue-900/60 shadow-lg shadow-black/40 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reset Factory Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authorized Users Whitelist */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <h3 className="text-base font-bold text-white mb-3">
          Configured Authorized Whitelist (Presidency University Domain)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALLOWED_USERS.map((usr, i) => (
            <div key={i} className="p-3.5 bg-slate-950/80 border border-blue-900/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{usr.name}</span>
                <span className="text-[11px] font-mono text-slate-400">{usr.email}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  usr.role === 'Admin' ? 'bg-blue-950 text-cyan-300 border-cyan-800/60' : 'bg-blue-950 text-blue-300 border-blue-800/60'
                }`}
              >
                {usr.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity Table (Prompt 1) */}
      <div id="audit-table" className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-blue-900/30">
          <div>
            <h3 className="text-lg font-bold text-white">
              Authentication Audit Stream ({filteredLogs.length} Records)
            </h3>
            <p className="text-xs text-slate-400">
              Persisted in localStorage with timestamp, device footprint, and access status
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-blue-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search email / device..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-blue-900/50 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-blue-900/50 bg-slate-950 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success Only</option>
              <option value="denied">Access Denied Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-blue-900/40 rounded-2xl mt-4 shadow-inner">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-blue-900/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Account Email</th>
                <th className="px-4 py-3">Name & Role</th>
                <th className="px-4 py-3">Login Timestamp</th>
                <th className="px-4 py-3">Device / Network</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 bg-slate-900/40">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-blue-950/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {log.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{log.name}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded inline-block border ${
                        log.role === 'Admin'
                          ? 'bg-blue-950 text-cyan-300 border-cyan-800/60'
                          : 'bg-blue-950 text-blue-300 border-blue-800/60'
                      }`}
                    >
                      {log.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {log.loginTime}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{log.device}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.ipAddress}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                        log.status === 'success'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border-rose-800/60 animate-pulse'
                      }`}
                    >
                      {log.status === 'success' ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campus Feedback & Rating Audit (Section 11) */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div>
            <h3 className="text-base font-bold text-white">
              Campus User Feedback & Satisfaction
            </h3>
            <p className="text-xs text-slate-400">
              Ratings submitted by professors, facility runners, and hostel wardens
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-blue-900/50">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-base font-black text-amber-300">{avgRating} / 5.0</span>
            <span className="text-xs text-slate-400">({feedbackList.length} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {feedbackList.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.userName}</span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic font-medium">
                "{item.comment}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-blue-900/30">
                <span className="capitalize font-semibold text-cyan-300">
                  Category: {item.category}
                </span>
                <span>{item.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
