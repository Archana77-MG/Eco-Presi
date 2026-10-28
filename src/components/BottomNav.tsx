import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  TrendingDown,
  Sparkles,
  MoreHorizontal,
  Trophy,
  Bell,
  FileSpreadsheet,
  ShieldCheck,
  HelpCircle,
  Cpu,
  Upload,
  X,
  Gamepad2,
  Wand2,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { Language, User } from '../types';
import { translations } from '../config/translations';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  language: Language;
  onOpenCsvModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  language,
  onOpenCsvModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const t = translations[language] || translations.en;
  const isAdmin = currentUser?.role === 'Admin';

  const primaryTabs: { id: NavTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: t.navDashboard.split(' ')[0], icon: LayoutDashboard },
    { id: 'blocks', label: t.navBlocks.split(' ')[0], icon: Building2 },
    { id: 'wastage', label: 'Wastage', icon: TrendingDown },
    { id: 'predictions', label: 'Predict', icon: Sparkles },
  ];

  const secondaryTabs = [
    { id: 'game' as NavTab, label: '3D Campus Patrol', icon: Gamepad2 },
    { id: 'studio' as NavTab, label: 'Campus AI Studio', icon: Wand2 },
    { id: 'rewards' as NavTab, label: t.navRewards, icon: Trophy },
    { id: 'alerts' as NavTab, label: t.navAlerts, icon: Bell },
    { id: 'reports' as NavTab, label: t.navReports, icon: FileSpreadsheet },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: t.navAdmin, icon: ShieldCheck }] : []),
    { id: 'architecture' as NavTab, label: t.navArchitecture, icon: Cpu },
    { id: 'help' as NavTab, label: t.navHelp, icon: HelpCircle },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile More Sheet */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-slate-950 border-t border-blue-900/50 rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
              <h3 className="font-bold text-white text-lg">More Campus Navigation</h3>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="my-4">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenCsvModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-950/60 border border-blue-400/30 cursor-pointer"
              >
                <Upload className="w-5 h-5 text-cyan-200" />
                <span>{t.uploadCsv}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-6">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-950/90 border-blue-500 text-blue-300 font-bold shadow-md shadow-blue-950'
                        : 'bg-slate-900/80 border-blue-900/30 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-blue-900/40 md:hidden pb-safe shadow-2xl shadow-black">
        <div className="grid grid-cols-5 h-16 items-center px-2">
          {primaryTabs.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 h-full py-1 cursor-pointer transition-colors ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
                <span className="text-[10px] leading-tight truncate">{item.label}</span>
              </button>
            );
          })}

          {/* More trigger */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 cursor-pointer transition-colors ${
              secondaryTabs.some(t => t.id === currentTab)
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] leading-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
