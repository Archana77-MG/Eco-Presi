import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { Language } from '../types';
import { GeminiService, ChatMessage } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { translations } from '../config/translations';

interface AiChatWidgetProps {
  language: Language;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations.en;

  // Suggested questions based on language
  const suggestedQuestions = {
    en: [
      'Which block wasted the most water this week?',
      'How can the hostel save ₹10,000 this month?',
      'Why is Block B consuming energy at night?',
      'What is Presidency University eco score today?',
    ],
    kn: [
      'ಈ ವಾರ ಹೆಚ್ಚು ನೀರು ವ್ಯರ್ಥ ಮಾಡಿದ ಬ್ಲಾಕ್ ಯಾವುದು?',
      'ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ತಿಂಗಳಿಗೆ ₹10,000 ಹೇಗೆ ಉಳಿಸಬಹುದು?',
      'ಬ್ಲಾಕ್ B ನಲ್ಲಿ ರಾತ್ರಿ ವಿದ್ಯುತ್ ಏಕೆ ಖರ್ಚಾಗುತ್ತಿದೆ?',
      'ಇಂದಿನ ಪ್ರೆಸಿಡೆನ್ಸಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಇಕೋ ಸ್ಕೋರ್ ಎಷ್ಟು?',
    ],
    hi: [
      'इस सप्ताह किस ब्लॉक में सबसे अधिक पानी बर्बाद हुआ?',
      'हॉस्टल इस महीने ₹10,000 कैसे बचा सकता है?',
      'रात में ब्लॉक B में बिजली क्यों खर्च हो रही है?',
      'आज प्रेसीडेंसी यूनिवर्सिटी का इको स्कोर क्या है?',
    ],
  }[language];

  // Initialize greeting message on first load or language switch
  useEffect(() => {
    const greetingText = {
      en: 'Hello! I am Presidency Eco AI. Ask me anything about electricity, water leaks, or waste savings across our Itgalpura campus.',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ಪ್ರೆಸಿಡೆನ್ಸಿ ಇಕೋ AI. ನಮ್ಮ ಇಟ್ಗಾಲಪುರ ಕ್ಯಾಂಪಸ್‌ನ ವಿದ್ಯುತ್, ನೀರಿನ ಸೋರಿಕೆ ಅಥವಾ ತ್ಯಾಜ್ಯ ಉಳಿತಾಯದ ಬಗ್ಗೆ ಸರಳವಾಗಿ ಕೇಳಿ.',
      hi: 'नमस्ते! मैं प्रेसीडेंसी इको AI हूँ। हमारे इतगालपुरा परिसर में बिजली, पानी के रिसाव या अपव्यय बचत के बारे में कोई भी प्रश्न पूछें।',
    }[language];

    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language]);

  // Voice speech hook
  const { isListening, isSupported, toggleListening } = useSpeechRecognition(
    recognizedText => {
      setInput(recognizedText);
      handleSendMessage(recognizedText);
    },
    language
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await GeminiService.askEcoAssistant(query, messages, language);
      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue accessing campus telemetry. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="tour-ai-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t.aiAssistant}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white rounded-2xl shadow-xl shadow-blue-950/80 border border-blue-400/40 cursor-pointer active:scale-95 transition-all"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
        </div>
        <span className="text-xs sm:text-sm font-black hidden sm:inline tracking-wide">
          {t.aiAssistant}
        </span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] h-[540px] max-h-[85vh] bg-slate-950 rounded-3xl shadow-2xl border border-blue-800/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 shadow-black text-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-black text-white p-4 flex items-center justify-between shrink-0 border-b border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center backdrop-blur-xs">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">{t.aiAssistant}</h4>
                <p className="text-[11px] text-cyan-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                  Grounded on live campus sensor stream
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/95">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-cyan-300 border border-blue-700/60 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-xs shadow-md shadow-blue-950/80 font-medium'
                      : 'bg-slate-900 text-slate-100 border border-blue-900/50 rounded-bl-xs shadow-md shadow-black'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-cyan-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 bg-slate-900 p-3 rounded-2xl border border-blue-900/60 w-fit">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Presidency Eco AI is calculating answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Chips */}
          <div className="p-2.5 bg-slate-950 border-t border-blue-900/40 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-900 text-cyan-300 hover:bg-blue-950 border border-blue-800/50 transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-slate-950 border-t border-blue-900/40 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Speech Button */}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop Listening' : 'Tap to speak'}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-blue-900/60'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isListening ? t.speaking : t.askAiPlaceholder}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-blue-900/60 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-600/30 bg-slate-900 text-white placeholder-slate-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-950 transition-all cursor-pointer border border-blue-400/40"
              >
                <Send className="w-4 h-4 text-cyan-200" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
