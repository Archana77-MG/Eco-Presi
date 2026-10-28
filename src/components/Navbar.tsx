import React from 'react';
import { Leaf, LogOut, Compass, Shield, User as UserIcon, Globe, MapPin, Gamepad2, Palette } from 'lucide-react';
import { User, Language } from '../types';
import { translations } from '../config/translations';

export type UiTheme = 'midnight' | 'cyber' | 'sapphire' | 'abyss';

interface NavbarProps {
  currentUser: User | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartTour: () => void;
  onLogout: () => void;
  currentTheme: UiTheme;
  onThemeChange: (theme: UiTheme) => void;
  onOpenGame: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  language,
  onLanguageChange,
  onStartTour,
  onLogout,
  currentTheme,
  onThemeChange,
  onOpenGame,
}) => {
  const t = translations[language] || translations.en;

  const themeColors: { id: UiTheme; bg: string; ring: string; label: string }[] = [
    { id: 'midnight', bg: 'bg-blue-900', ring: 'ring-blue-500', label: 'Midnight Blue & Black' },
    { id: 'cyber', bg: 'bg-cyan-600', ring: 'ring-cyan-400', label: 'Cyber Electric Blue' },
    { id: 'sapphire', bg: 'bg-indigo-600', ring: 'ring-indigo-400', label: 'Sapphire Obsidian' },
    { id: 'abyss', bg: 'bg-sky-700', ring: 'ring-sky-400', label: 'Deep Abyss' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-blue-900/40 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & University Identity */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
              currentTheme === 'cyber'
                ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-900/40'
                : currentTheme === 'sapphire'
                ? 'bg-gradient-to-tr from-indigo-700 to-blue-600 shadow-indigo-900/40'
                : currentTheme === 'abyss'
                ? 'bg-gradient-to-tr from-sky-800 to-blue-700 shadow-sky-900/40'
                : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 shadow-blue-900/50'
            }`}>
              <Leaf className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  ECOTRIA
                </span>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md tracking-wider bg-blue-950/90 text-blue-300 border border-blue-800/60 shadow-xs">
                  PRESIDENCY
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate max-w-[190px] sm:max-w-none">
                  Presidency University, Bengaluru (Itgalpura, Yelahanka)
                </span>
              </div>
            </div>
          </div>

          {/* Right actions: Theme Selector, 3D Game CTA, Language, Tour, User profile, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Blue & Black Theme Palette Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-blue-900/50 shadow-inner" title="Theme Palette: Dark Blue & Black variations">
              <Palette className="w-3.5 h-3.5 text-blue-400 ml-0.5 mr-0.5" />
              {themeColors.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onThemeChange(c.id)}
                  title={`Switch to ${c.label}`}
                  className={`w-4.5 h-4.5 rounded-md ${c.bg} transition-all cursor-pointer border border-blue-400/30 ${
                    currentTheme === c.id ? `ring-2 ring-offset-1 ring-offset-slate-950 ${c.ring} scale-110 shadow-sm shadow-blue-500/50` : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Quick 3D Patrol Launch Button */}
            <button
              type="button"
              onClick={onOpenGame}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer active:scale-95 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-900/40 border border-blue-400/40"
            >
              <Gamepad2 className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">3D Patrol</span>
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-900/90 p-1 rounded-xl border border-blue-900/50">
              <Globe className="w-4 h-4 text-blue-400 ml-1.5 mr-1 hidden sm:inline" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('kn')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'kn'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Guided Tour Trigger */}
            <button
              id="tour-btn"
              type="button"
              onClick={onStartTour}
              title={t.tourStart}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-blue-900/60 rounded-xl hover:bg-blue-950 hover:text-white hover:border-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>{t.tourStart}</span>
            </button>

            {/* User Profile & Role */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-blue-900/40">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-700/60 shadow-inner">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        currentUser.role === 'Admin'
                          ? 'bg-blue-950/90 text-cyan-300 border-cyan-800/60'
                          : 'bg-blue-950/90 text-blue-300 border-blue-800/60'
                      }`}
                    >
                      {currentUser.role === 'Admin' ? t.roleAdmin : t.roleFacility}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
