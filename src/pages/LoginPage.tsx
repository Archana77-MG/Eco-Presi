import React, { useState } from 'react';
import { Leaf, Shield, Lock, AlertCircle, CheckCircle, ArrowRight, UserCheck, MapPin } from 'lucide-react';
import { ALLOWED_USERS } from '../config/allowedUsers';
import { User, Language } from '../types';
import { CampusStorage } from '../services/storage';
import { translations } from '../config/translations';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  language: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, language }) => {
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[language] || translations.en;

  const attemptLogin = (emailToVerify: string) => {
    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const cleanEmail = emailToVerify.trim().toLowerCase();
      const match = ALLOWED_USERS.find(u => u.email.toLowerCase() === cleanEmail);

      const deviceStr = `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} • ${
        navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'
      }`;

      if (match) {
        const loggedInUser: User = {
          id: 'usr-' + Date.now(),
          email: match.email,
          name: match.name,
          role: match.role,
        };

        // Record successful login in audit log
        CampusStorage.addLoginLog({
          email: match.email,
          name: match.name,
          role: match.role,
          loginTime: new Date().toLocaleString(),
          device: deviceStr,
          status: 'success',
          ipAddress: '172.16.8.44 (Presidency Campus Wi-Fi)',
        });

        CampusStorage.setCurrentUser(loggedInUser);
        onLoginSuccess(loggedInUser);
      } else {
        // Record denied attempt
        CampusStorage.addLoginLog({
          email: cleanEmail || 'unspecified@external.com',
          name: 'Unauthorized User',
          role: 'Facility Manager',
          loginTime: new Date().toLocaleString(),
          device: deviceStr,
          status: 'denied',
          ipAddress: '103.22.41.9',
        });

        setErrorMessage(t.accessDeniedDesc);
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    attemptLogin(emailInput);
  };

  return (
    <div className="min-h-screen bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/60 via-[#030712] to-black flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Decorative campus ambient rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-900/50 relative z-10 shadow-black">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-950/80 mb-3 border border-blue-400/30">
            <Leaf className="w-9 h-9" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 inline-block mb-1 shadow-inner">
            Presidency University, Bengaluru
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Ecotria Presidency
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Itgalpura, Rajanukunte, Yelahanka Campus
          </p>
        </div>

        {/* Access Denied Warning */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs shadow-lg shadow-rose-950/50">
            <div className="flex items-center gap-2 font-bold mb-1 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{t.accessDenied}</span>
            </div>
            <p className="text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Quick Demo Accounts Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t.selectDemoAccount}
          </label>
          <div className="space-y-2">
            {ALLOWED_USERS.map((usr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => attemptLogin(usr.email)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-blue-900/40 bg-slate-950/70 hover:border-blue-500/80 hover:bg-blue-950/50 transition-all text-left group cursor-pointer shadow-md shadow-black/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 group-hover:bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-xs transition-colors border border-blue-800/50">
                    {usr.role === 'Admin' ? 'AD' : 'FM'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {usr.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {usr.email}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    usr.role === 'Admin'
                      ? 'bg-blue-950/90 text-cyan-300 border-cyan-800/60'
                      : 'bg-blue-950/90 text-blue-300 border-blue-800/60'
                  }`}
                >
                  {usr.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-900/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-400 font-semibold">Or enter authorized email</span>
          </div>
        </div>

        {/* Manual Email Input Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3.5">
          <div>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="e.g. facility@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-600/30 text-sm font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !emailInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/80 border border-blue-400/30 transition-all cursor-pointer active:scale-98"
          >
            <span>{isSubmitting ? 'Authenticating...' : t.signInWithGoogle}</span>
            <ArrowRight className="w-4 h-4 text-cyan-200" />
          </button>
        </form>

        {/* Security & Footer Info */}
        <div className="mt-6 pt-4 border-t border-blue-900/30 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400 inline" />
            Secured by Presidency University IT & Facility Management Cell
          </p>
        </div>
      </div>
    </div>
  );
};
