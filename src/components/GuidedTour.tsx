import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, Shield, Zap, Bell, Upload, MessageSquare } from 'lucide-react';
import { CampusStorage } from '../services/storage';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'kn' | 'hi';
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, language }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Ecotria Presidency!',
      subtitle: 'Smart Campus Resource & Sustainability Management',
      description:
        'This dashboard monitors electricity, water, and solid waste across all 10 campus blocks at Presidency University, Bengaluru (Itgalpura, Yelahanka).',
      icon: Zap,
      badge: 'Step 1 of 5',
    },
    {
      title: 'Top 3 Problems & One-Click Alerts',
      subtitle: 'Immediate Wastage Prevention',
      description:
        'Whenever rooms are empty with active loads or night water leaks occur, the system highlights them with estimated ₹ losses and lets you alert block supervisors with 1 click.',
      icon: Bell,
      badge: 'Step 2 of 5',
    },
    {
      title: 'Traffic-Light Campus Block Grid',
      subtitle: 'Green, Amber & Red Visual Map',
      description:
        'Blocks are classified visually: Green is efficient, Amber needs attention, and Red has severe wastage. Click any block to view its 24-hr hourly charts and recommendations.',
      icon: Shield,
      badge: 'Step 3 of 5',
    },
    {
      title: 'Easy CSV Ingestion & Validation',
      subtitle: 'Direct Manual Log Merge',
      description:
        'Facility teams can drop or upload CSV meter logs. Our built-in validator highlights errors row-by-row and instantly recalculates all campus charts and losses.',
      icon: Upload,
      badge: 'Step 4 of 5',
    },
    {
      title: 'Presidency Eco AI Assistant',
      subtitle: 'Voice & Multilingual Intelligence',
      description:
        'Click the floating AI button anytime or speak into your mic to ask questions in English, Kannada, or Hindi, e.g., "Which block wasted the most water this week?".',
      icon: MessageSquare,
      badge: 'Step 5 of 5',
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      CampusStorage.setTourCompleted(true);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    CampusStorage.setTourCompleted(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-950 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/60 relative text-slate-100">
        {/* Close / Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300">
            {step.badge}
          </span>
          <div className="flex gap-1 ml-auto">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-blue-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Icon & Content */}
        <div className="flex items-center gap-4 my-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <StepIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white leading-tight">
              {step.title}
            </h3>
            <p className="text-xs font-semibold text-cyan-400 mt-0.5">
              {step.subtitle}
            </p>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mt-2 bg-slate-900/90 p-4 rounded-2xl border border-blue-900/40">
          {step.description}
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-blue-900/40">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-blue-900/40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
