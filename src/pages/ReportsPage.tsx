import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  Sparkles,
  Zap,
  Droplets,
  Trash2,
  TrendingDown,
  Building2,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { CampusBlock, TariffSettings, WastageAnomaly, Language } from '../types';
import { AnalyticsEngine } from '../services/analytics';
import { GeminiService } from '../services/geminiService';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface ReportsPageProps {
  blocks: CampusBlock[];
  tariffs: TariffSettings;
  anomalies: WastageAnomaly[];
  language: Language;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  blocks,
  tariffs,
  anomalies,
  language,
}) => {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Annual'>('Daily');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const t = translations[language] || translations.en;

  const metrics = AnalyticsEngine.getDashboardMetrics(
    blocks,
    tariffs,
    anomalies,
    period.toLowerCase() as any
  );

  // Generate AI Summary whenever period or language changes
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setIsGeneratingAi(true);
      try {
        const summary = await GeminiService.generateReportSummary(period, language);
        if (isMounted) setAiSummary(summary);
      } catch (err) {
        console.error('Error generating summary:', err);
      } finally {
        if (isMounted) setIsGeneratingAi(false);
      }
    };
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [period, language]);

  // Ranked blocks: Best and Worst
  const sortedBlocks = [...blocks].sort((a, b) => a.wastageRupees - b.wastageRupees);
  const bestBlocks = sortedBlocks.slice(0, 2);
  const worstBlocks = sortedBlocks.slice(-2).reverse();

  // Print formatted report
  const handlePrint = () => {
    window.print();
  };

  // Download Report CSV
  const handleDownloadCsv = () => {
    const csvContent =
      `Presidency University ${period} Resource Performance Report\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `Metric,Value,Unit\n` +
      `Electricity Consumption,${metrics.totalElectricityKwh},kWh\n` +
      `Water Consumption,${metrics.totalWaterLitres},Litres\n` +
      `Solid Waste Generated,${metrics.totalWasteKg},kg\n` +
      `Total Wastage Loss,${metrics.totalWastageRupees},INR\n` +
      `CO2 Avoided,${metrics.co2SavedKg},kg\n` +
      `Campus Eco Score,${metrics.campusEcoScore},/100\n\n` +
      `Block Name,Electricity (kWh),Water (L),Waste (kg),Wastage (INR),Status\n` +
      blocks
        .map(
          b =>
            `"${b.name}",${b.electricityKwh},${b.waterLitres},${b.wasteKg},${b.wastageRupees},"${b.status}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Presidency_Resource_Report_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share via WhatsApp / Email
  const handleShare = (channel: 'whatsapp' | 'email') => {
    const text =
      `*PRESIDENCY UNIVERSITY ${period.toUpperCase()} SUSTAINABILITY REPORT*\n\n` +
      `📊 Electricity: ${metrics.totalElectricityKwh.toLocaleString()} kWh\n` +
      `💧 Water: ${metrics.totalWaterLitres.toLocaleString()} L\n` +
      `🗑️ Waste: ${metrics.totalWasteKg.toLocaleString()} kg\n` +
      `💸 Preventable Loss: ₹${metrics.totalWastageRupees.toLocaleString()}\n` +
      `🌿 Campus Eco Score: ${metrics.campusEcoScore}/100\n\n` +
      `AI Summary: ${aiSummary}\n\n` +
      `View live dashboard: ${window.location.origin}`;

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(
        `mailto:?subject=${encodeURIComponent(
          `Presidency University ${period} Resource Report`
        )}&body=${encodeURIComponent(text)}`,
        '_blank'
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Action Card */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoReports}
        buttonLabel="Print / Save PDF"
        onActionClick={handlePrint}
        accentColor="blue"
      />

      {/* Report Controls & Period Selector */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Campus Performance Reports & Export
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Executive summaries powered by Gemini AI with exportable audit formats
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-blue-900/50 self-start sm:self-auto shadow-inner">
          {(['Daily', 'Weekly', 'Monthly', 'Annual'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60 space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Report Official University Header */}
        <div className="border-b-2 border-blue-600 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block">
              PRESIDENCY UNIVERSITY • BENGALURU
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {period} Campus Resource & Sustainability Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Campus Facility Cell • Itgalpura, Rajanukunte, Yelahanka 560064 • Generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </p>
          </div>

          {/* Action buttons (Hidden on Print) */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-blue-900/50 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-blue-900/50 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleShare('whatsapp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleShare('email')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md border border-blue-400/30"
            >
              <Mail className="w-4 h-4 text-cyan-200" />
              <span>Share Email</span>
            </button>
          </div>
        </div>

        {/* Gemini AI Plain-Language Executive Summary */}
        <div className="bg-slate-950/90 p-5 rounded-2xl border border-blue-800/60 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Gemini AI Executive Summary & Action Guidance</span>
          </div>
          {isGeneratingAi ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Generating real-time executive summary with campus metrics...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-medium">
              {aiSummary}
            </p>
          )}
        </div>

        {/* 4 Core Report Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Electricity Consumed
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {metrics.totalElectricityKwh.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kWh</span>
            </span>
            <span className="text-[11px] text-slate-500">Total institutional draw</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Water Consumed
            </span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">
              {metrics.totalWaterLitres.toLocaleString()} <span className="text-xs font-semibold text-slate-400">L</span>
            </span>
            <span className="text-[11px] text-slate-500">Borewell & tankers</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Solid Waste
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {metrics.totalWasteKg.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
            </span>
            <span className="text-[11px] text-slate-500">Wet & dry combined</span>
          </div>

          <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-800/60">
            <span className="text-[11px] font-bold text-rose-300 uppercase block">
              Preventable Wastage
            </span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">
              ₹{metrics.totalWastageRupees.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-300">Calculated financial loss</span>
          </div>
        </div>

        {/* Best and Worst Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Top Efficient Facilities (Green Benchmarks)</span>
            </div>
            <div className="space-y-2">
              {bestBlocks.map(b => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-900 rounded-xl border border-emerald-900/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{b.name}</span>
                    <span className="text-slate-400">{b.electricityKwh} kWh • {b.waterLitres} L</span>
                  </div>
                  <span className="font-black text-emerald-400">₹{b.wastageRupees} loss/day</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>High Wastage Hotspots (Immediate Remediation)</span>
            </div>
            <div className="space-y-2">
              {worstBlocks.map(b => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-900 rounded-xl border border-rose-900/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{b.name}</span>
                    <span className="text-slate-400">{b.electricityKwh} kWh • {b.waterLitres} L</span>
                  </div>
                  <span className="font-black text-rose-400">₹{b.wastageRupees} loss/day</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next-Step Action Plan */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-blue-900/40">
          <h4 className="text-sm font-bold text-white mb-2">
            Recommended Immediate Next-Steps for Campus Operations:
          </h4>
          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed font-medium">
            <li>Dispatch hostel plumbing squad to service float valves in Hostel Boys Wing C cisterns.</li>
            <li>Enforce 7:00 PM master lighting cut-off in Academic Block B lecture halls.</li>
            <li>Verify motion sensors in Academic Block C CAD laboratories prior to weekend closure.</li>
            <li>Redirect Canteen excess organic scraps to the university bio-digester plant.</li>
          </ol>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-8 border-t border-blue-900/30 grid grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <p className="font-bold text-white">Suresh Kumar</p>
            <p>Chief Facility Officer, Presidency University</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-white">Dr. Ramesh Rao</p>
            <p>Registrar & Campus Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};
