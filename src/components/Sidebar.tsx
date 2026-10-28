import React from 'react';
import {
  LayoutDashboard,
  Building2,
  TrendingDown,
  Sparkles,
  Trophy,
  Bell,
  FileSpreadsheet,
  ShieldCheck,
  HelpCircle,
  Cpu,
  Upload,
  Gamepad2,
  Wand2,
} from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../config/translations';

export type NavTab =
  | 'dashboard'
  | 'game'
  | 'blocks'
  | 'wastage'
  | 'predictions'
  | 'rewards'
  | 'studio'
  | 'alerts'
  | 'reports'
  | 'admin'
  | 'help'
  | 'architecture';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  language: Language;
  onOpenCsvModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  language,
  onOpenCsvModal,
}) => {
  const t = translations[language] || translations.en;
  const isAdmin = currentUser?.role === 'Admin';

  const navItems = [
    { id: 'dashboard' as NavTab, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'game' as NavTab, label: '3D Campus Patrol', icon: Gamepad2, badge: '3D Game' },
    { id: 'blocks' as NavTab, label: t.navBlocks, icon: Building2 },
    { id: 'wastage' as NavTab, label: t.navWastage, icon: TrendingDown },
    { id: 'predictions' as NavTab, label: t.navPredictions, icon: Sparkles },
    { id: 'rewards' as NavTab, label: t.navRewards, icon: Trophy },
    { id: 'studio' as NavTab, label: 'Campus AI Studio', icon: Wand2, badge: 'Nano' },
    { id: 'alerts' as NavTab, label: t.navAlerts, icon: Bell },
    { id: 'reports' as NavTab, label: t.navReports, icon: FileSpreadsheet },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: t.navAdmin, icon: ShieldCheck }] : []),
    { id: 'architecture' as NavTab, label: t.navArchitecture, icon: Cpu },
    { id: 'help' as NavTab, label: t.navHelp, icon: HelpCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950/90 backdrop-blur-md border-r border-blue-900/40 py-6 px-4 shrink-0 h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto shadow-2xl shadow-black/80">
      {/* Quick Action: CSV Upload */}
      <button
        id="tour-csv-btn"
        type="button"
        onClick={onOpenCsvModal}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/60 border border-blue-400/30 transition-all cursor-pointer mb-6 active:scale-98"
      >
        <Upload className="w-4 h-4 text-cyan-200" />
        <span>{t.uploadCsv}</span>
      </button>

      {/* Main Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-950/80 text-blue-300 shadow-md border-l-4 border-blue-500 border-y border-r border-blue-900/40 shadow-blue-950/60 font-bold'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="truncate flex-1">{item.label}</span>
              {(item as any).badge && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-cyan-800/60 shadow-xs">
                  {(item as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Campus Facility Tag */}
      <div className="pt-4 border-t border-blue-900/30 text-center">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Presidency Campus IoT Hub
        </p>
        <p className="text-xs text-blue-400 font-bold mt-0.5 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Live Sensor Stream: Active
        </p>
      </div>
    </aside>
  );
};
