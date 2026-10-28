import React from 'react';
import { HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { translations } from '../config/translations';

interface ActionCardProps {
  language: 'en' | 'kn' | 'hi';
  actionText: string;
  buttonLabel?: string;
  onActionClick?: () => void;
  accentColor?: 'emerald' | 'amber' | 'blue' | 'rose';
}

export const ActionCard: React.FC<ActionCardProps> = ({
  language,
  actionText,
  buttonLabel,
  onActionClick,
  accentColor = 'blue',
}) => {
  const t = translations[language] || translations.en;

  const colorStyles = {
    emerald: 'bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-black/90 border-blue-800/40 text-slate-100',
    amber: 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-black/90 border-amber-800/40 text-slate-100',
    blue: 'bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-black/90 border-blue-700/50 text-slate-100',
    rose: 'bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-black/90 border-rose-800/40 text-slate-100',
  }[accentColor];

  const buttonStyles = {
    emerald: 'bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white shadow-lg shadow-blue-950/60 border border-blue-400/30',
    amber: 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white shadow-lg shadow-amber-950/60 border border-amber-400/30',
    blue: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-950/60 border border-blue-400/40',
    rose: 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-lg shadow-rose-950/60 border border-rose-400/30',
  }[accentColor];

  return (
    <aside
      aria-label={t.whatShouldIDoTitle}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xl shadow-black/40 transition-all duration-200 mb-6 backdrop-blur-md ${colorStyles}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-950 text-cyan-400 border border-blue-700/50 shadow-inner shrink-0">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-xs">
                Action Guide
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                {t.whatShouldIDoTitle}
              </h2>
            </div>
            <p className="mt-1 text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
              {actionText}
            </p>
          </div>
        </div>

        {buttonLabel && onActionClick && (
          <button
            onClick={onActionClick}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer active:scale-95 transition-all shrink-0 ${buttonStyles}`}
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
