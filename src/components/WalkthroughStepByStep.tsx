import React, { useState } from 'react';
import {
  Clock,
  Zap,
  Cpu,
  TrendingDown,
  Bell,
  CheckCircle,
  Trophy,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';

export const WalkthroughStepByStep: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '1',
      title: '7:00 PM - Classes End, Room 204 Vacant',
      desc: 'Students and faculty leave Academic Block B Room 204. Presidency University central timetable marks the room as "Unoccupied" at 17:30.',
      icon: Clock,
      badge: 'Sense & Schedule',
      state: '8 Fans & 12 Lights still left ON',
      color: 'amber',
    },
    {
      num: '2',
      title: '7:15 PM - CT Sensor Detects 3.2 kW Current',
      desc: 'The ESP32 sub-meter CT clamp attached to Block B Phase 2 distribution panel records an active draw of 3.2 kW on a theoretically dark circuit.',
      icon: Zap,
      badge: 'IoT Data Collection',
      state: 'MQTT message sent to FastAPI endpoint',
      color: 'amber',
    },
    {
      num: '3',
      title: '7:18 PM - Rule Engine Triggers Anomaly',
      desc: 'Analytics Engine checks Timetable Matrix: (Occupancy == False) AND (Load > 2.0 kW) = Empty Room Wastage Flag. Calculates loss at ₹45/hr.',
      icon: Cpu,
      badge: 'Detection & Rupee Loss',
      state: 'Flagged: High Severity (Cost: ₹45/hr)',
      color: 'rose',
    },
    {
      num: '4',
      title: '7:20 PM - Alert Sent to Facility Runner',
      desc: 'System sends automated WhatsApp alert to Suresh Kumar (Facility Manager): "ALERT: Block B Room 204 is empty but using 3.2 kW since 7 PM. Estimated loss ₹45/hour. Please switch off."',
      icon: Bell,
      badge: 'Dispatch & Notification',
      state: 'WhatsApp delivered & acknowledged',
      color: 'blue',
    },
    {
      num: '5',
      title: '7:28 PM - Guard Switches Off Sub-Panel',
      desc: 'Floor security guard receives dispatch and physically toggles the master isolator for Room 204 in Academic Block B.',
      icon: CheckCircle,
      badge: 'Physical Intervention',
      state: 'Load drops from 3.2 kW to 0.1 kW baseline',
      color: 'emerald',
    },
    {
      num: '6',
      title: '7:30 PM - Verification & Reward Logged',
      desc: 'Ecotria verifies current returned to baseline. Automatically logs ₹360 saved for the evening, adds +50 points to Block B score, and awards canteen coupon.',
      icon: Trophy,
      badge: 'Verification & Gamification',
      state: 'Case closed, ₹360 loss averted!',
      color: 'emerald',
    },
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-900/30">
        <div>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-inner">
            Animated Scenario Walkthrough
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            Case Study: "Classroom Empty at 7:00 PM"
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow a single incident from sensor detection to WhatsApp alert and verified ₹ savings
          </p>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-950 p-1.5 rounded-2xl border border-blue-900/50">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                activeStep === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950 scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {s.num}
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Showcase */}
      <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-blue-900/50 shadow-inner">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
              current.color === 'rose'
                ? 'bg-rose-600 shadow-rose-950 border border-rose-400/40'
                : current.color === 'amber'
                ? 'bg-amber-600 shadow-amber-950 border border-amber-400/40'
                : 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-950 border border-blue-400/40'
            }`}
          >
            <StepIcon className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
                Step {current.num} • {current.badge}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mt-1">{current.title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed mt-1 font-medium">{current.desc}</p>
            <div className="inline-block mt-3 px-3 py-1 rounded-xl bg-slate-900 border border-blue-900/50 text-xs font-mono font-bold text-cyan-300">
              Status: {current.state}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveStep(0)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Walkthrough</span>
        </button>

        <button
          onClick={() => setActiveStep((activeStep + 1) % steps.length)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer"
        >
          <span>{activeStep === steps.length - 1 ? 'Start Again' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4 text-cyan-200" />
        </button>
      </div>
    </div>
  );
};
