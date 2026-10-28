import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Upload,
  Building2,
  Bell,
  Star,
  Send,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import { CampusStorage } from '../services/storage';
import { ActionCard } from '../components/ActionCard';
import { CAMPUS_DETAILS } from '../config/allowedUsers';
import { Language, User } from '../types';
import { translations } from '../config/translations';

interface HelpCenterPageProps {
  currentUser: User | null;
  language: Language;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ currentUser, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'energy' | 'water' | 'waste' | 'ui' | 'general'>('energy');
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Contact form state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const t = translations[language] || translations.en;

  const faqs = [
    {
      q: 'How does Ecotria detect if a classroom is empty but consuming electricity?',
      a: 'The system links with the university central class timetable matrix. If a room schedule states "Vacant / No Lecture Scheduled", but the CT clamp sub-meter records an active electrical draw greater than 2.0 kW, it flags an "Empty Room Wastage" anomaly and notifies facility staff.',
    },
    {
      q: 'How is a water pipe leak detected between 2 AM and 5 AM?',
      a: 'In student hostels, water usage normally drops to zero or near-zero between 02:00 and 05:00 AM while occupants sleep. If the ultrasonic flow meter records a continuous uninterrupted flow exceeding 150 L/hr, the leak rule triggers a critical alert.',
    },
    {
      q: 'How do I upload custom meter readings via CSV?',
      a: 'Click "Upload CSV" in the sidebar or top banner. Select your CSV file containing timestamp, location, resource, value, and unit columns. You can download the pre-formatted template with sample rows if needed.',
    },
    {
      q: 'Can non-technical facility guards and cleaners use this app?',
      a: 'Yes! The entire interface is optimized for non-technical users with large touch buttons, green/amber/red traffic-light status cards, plain language explanations, and full Kannada (ಕನ್ನಡ) & Hindi (हिन्दी) translation.',
    },
    {
      q: 'What are Eco Points and how are they redeemed?',
      a: 'Staff and students earn points for reporting leaks (+50 pts), turning off unused fixtures, or maintaining a 7-day reduction streak. Points can be redeemed for Presidency Canteen vouchers, sustainability certificates, or campus tree plantings.',
    },
  ];

  const filteredFaqs = faqs.filter(
    f =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    CampusStorage.addFeedback({
      userName: currentUser?.name || 'Anonymous Staff',
      userEmail: currentUser?.email || 'facility@presidencyuniversity.in',
      rating,
      category,
      comment,
    });

    setFeedbackSent(true);
    setComment('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactSubject('');
    setContactMsg('');
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoHelp}
        buttonLabel="Browse Step Guides"
        onActionClick={() => {
          const el = document.getElementById('step-guides');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        accentColor="blue"
      />

      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-900/30">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Presidency Help Center & User Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Instructions for campus staff, sensor troubleshooting, and feedback submission
            </p>
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search help topics & FAQs..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/60 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Step Cards with Icons ("How to use") */}
        <div id="step-guides" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-900/40 shadow-lg shadow-black/40">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-950">
              <Upload className="w-5 h-5 text-cyan-200" />
            </div>
            <h4 className="font-bold text-sm text-white">Guide 1: Uploading CSV Data</h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 mt-2 leading-relaxed font-medium">
              <li>Download the official template via the CSV upload button.</li>
              <li>Paste your hourly or daily meter readings into Excel/Sheets.</li>
              <li>Save as CSV and drag into the upload window.</li>
              <li>Click "Merge" to instantly update all campus charts.</li>
            </ol>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-900/40 shadow-lg shadow-black/40">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-3 shadow-md shadow-cyan-950">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-sm text-white">Guide 2: Adding a Campus Block</h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 mt-2 leading-relaxed font-medium">
              <li>Navigate to "Campus Blocks" in the sidebar.</li>
              <li>Click "+ Add Campus Block" at top right.</li>
              <li>Fill in facility name, floor count, rooms, area, and meter ID.</li>
              <li>Save block to persist in your university profile.</li>
            </ol>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-900/40 shadow-lg shadow-black/40">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md shadow-rose-950">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-sm text-white">Guide 3: Reading & Sending Alerts</h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 mt-2 leading-relaxed font-medium">
              <li>Look for red cards on your dashboard or alerts tab.</li>
              <li>Inspect the "Estimated Loss ₹/hour" and location.</li>
              <li>Click "Send Alert" to trigger WhatsApp and Email.</li>
              <li>Mark resolved once physical cut-off is confirmed.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Accordion FAQs */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-cyan-400" />
          <span>Frequently Asked Questions ({filteredFaqs.length})</span>
        </h3>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-blue-900/40 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-white bg-slate-950 hover:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-slate-900/80 text-xs sm:text-sm text-slate-200 leading-relaxed border-t border-blue-900/30 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Column: Feedback Rating Form + Campus Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Rating + Feedback Form (Section 11) */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="pb-4 border-b border-blue-900/30">
            <h3 className="text-lg font-bold text-white">{t.feedbackTitle}</h3>
            <p className="text-xs text-slate-400">
              Rate your experience with Ecotria Presidency resource tracking
            </p>
          </div>

          {feedbackSent ? (
            <div className="p-5 bg-blue-950/80 border border-blue-700/60 rounded-2xl text-center my-6 space-y-2">
              <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">
                {t.thankYouFeedback}
              </h4>
              <p className="text-xs text-cyan-200">
                You earned +25 bonus Eco Points for submitting feedback.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 mt-5">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setRating(starNum)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          starNum <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-300 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-900/60 bg-slate-950 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="energy">Electricity & AC Controls</option>
                  <option value="water">Water Leak Detection & Tankers</option>
                  <option value="waste">Solid Waste & Composting</option>
                  <option value="ui">App Interface & Accessibility</option>
                  <option value="general">General Campus Facility Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Comments & Suggestions
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve university resource efficiency..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/60 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950 border border-blue-400/30 transition-all cursor-pointer"
              >
                {t.submitFeedback} (+25 pts)
              </button>
            </form>
          )}
        </div>

        {/* Contact Facility Desk */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
          <div className="pb-4 border-b border-blue-900/30">
            <h3 className="text-lg font-bold text-white">Campus Facility Desk</h3>
            <p className="text-xs text-slate-400">
              Presidency University Maintenance Cell Directory
            </p>
          </div>

          <div className="my-4 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-blue-900/40">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{CAMPUS_DETAILS.campus}</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-blue-900/40">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Facility Helpdesk: +91 80 4925 5555 / Ext 204</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-blue-900/40">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>facility@presidencyuniversity.in</span>
            </div>
          </div>

          {contactSent ? (
            <div className="p-4 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center text-xs font-bold text-cyan-200">
              Message received! Campus facility squad will follow up shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={e => setContactSubject(e.target.value)}
                  placeholder="Subject: e.g. Meter calibration inquiry"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-900/60 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={2}
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  placeholder="Describe your request..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-900/60 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white border border-blue-900/50 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Send Request to Facility Team
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
