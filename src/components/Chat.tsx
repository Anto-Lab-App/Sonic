"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Wrench, ChevronLeft, Mic, Image as ImageIcon, Info, ChevronDown, ChevronUp, Cpu, Menu, Plus, Clock, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserDiagnoses, getDiagnosisById } from '@/app/actions/history';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  detailedInfo?: string;
}

interface ChatProps {
  onBack?: () => void;
  diagnosisId?: string | null;
  onSelectDiagnosis?: (id: string) => void;
}

const MessageItem = ({ msg }: { msg: Message, key?: React.Key }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
    >
      {msg.sender === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-foreground/[0.05] backdrop-blur-xl flex items-center justify-center shrink-0 border border-foreground/[0.1] shadow-[0_4px_16px_rgba(0,0,0,0.4)] mt-auto mb-1">
          <Wrench size={14} className="text-gray-200" strokeWidth={2} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div
          className={`
            p-4 text-[15px] leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            ${msg.sender === 'user'
              ? 'bg-gradient-to-br from-[#0A84FF] to-[#005bb5] text-foreground rounded-[24px] rounded-br-sm border border-blue-400/30'
              : 'bg-foreground/[0.05] backdrop-blur-2xl border border-foreground/[0.08] text-gray-100 rounded-[24px] rounded-bl-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
            }
          `}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {msg.text}

          {msg.detailedInfo && (
            <div className="mt-3 pt-3 border-t border-foreground/10">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-blue-300 transition-colors"
              >
                {isExpanded ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
                {isExpanded ? t.chat.lessInfo : t.chat.moreInfo}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 text-[13px] text-gray-300 leading-relaxed">
                      {msg.detailedInfo}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <span className={`text-[10px] text-gray-400 font-medium px-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
          {msg.time}
        </span>
      </div>
    </motion.div>
  );
};

const defaultMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    text: 'Dzień dobry. Jestem Twoim wirtualnym asystentem serwisowym. W czym mogę dzisiaj pomóc? Proszę opisać problem z pojazdem.',
    time: '11:00'
  },
  {
    id: 2,
    sender: 'user',
    text: 'Gdy hamuję, słyszę dziwne piszczenie z przodu samochodu. Co to może być?',
    time: '11:02'
  },
  {
    id: 3,
    sender: 'ai',
    text: 'Piszczenie przy hamowaniu to najczęściej objaw zużytych klocków hamulcowych. Wiele z nich posiada czujniki akustyczne, które celowo emitują taki dźwięk, gdy kończy się okładzina cierna.\n\nCzy odczuwasz również drżenie kierownicy podczas hamowania?',
    time: '11:03',
    detailedInfo: 'Potencjalne przyczyny:\n• Zużyte klocki hamulcowe (najczęstsza przyczyna).\n• Zanieczyszczenia (piasek, kamyki) między klockiem a tarczą.\n• Zeszklenie powierzchni klocka z powodu przegrzania.\n• Brak smarowania na prowadnicach zacisku.\n\nRekomendowane działanie:\nWeryfikacja grubości okładzin ciernych, czyszczenie jarzma i smarowanie prowadnic.'
  }
];

export function Chat({ onBack, diagnosisId, onSelectDiagnosis }: ChatProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mechanik-ai-messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse messages from local storage', e);
      }
    }
    return defaultMessages;
  });

  useEffect(() => {
    localStorage.setItem('mechanik-ai-messages', JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isObdMode, setIsObdMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    getUserDiagnoses().then(setHistoryItems);
  }, []);

  useEffect(() => {
    if (diagnosisId) {
      // Clear messages immediately while loading
      setMessages([]);

      getDiagnosisById(diagnosisId).then(diag => {
        const title = diag ? getTitle(diag) : "Raportu";
        const greeting: Message = {
          id: Date.now(),
          sender: 'ai',
          text: `Witaj! Przeanalizowałem Twój raport: ${title}. Posiadam pełną wiedzę na temat tej usterki oraz ogólną wiedzę mechaniczną. W czym mogę Ci dzisiaj pomóc?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([greeting]);
        localStorage.setItem('mechanik-ai-messages', JSON.stringify([greeting]));
      });
    } else {
      // Restore default or saved messages if no specific diagnosis is selected
      const saved = localStorage.getItem('mechanik-ai-messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) setMessages(parsed);
          else setMessages(defaultMessages);
        } catch (e) {
          setMessages(defaultMessages);
        }
      } else {
        setMessages(defaultMessages);
      }
    }
  }, [diagnosisId]);

  const getTitle = (item: any) => {
    if (item.aiReport?.final_diagnosis?.title) return item.aiReport.final_diagnosis.title;
    if (item.aiReport?.name) return item.aiReport.name;
    try {
      const parsed = JSON.parse(item.vehicleData);
      return parsed.make || 'Nieznany pojazd';
    } catch {
      return 'Diagnoza';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pl-PL';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setInputValue('');
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(t.chat.micNotSupported);
      }
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    const isObdCode = /^[PCBU]\d{4}$/i.test(userText.trim()) || isObdMode;

    try {
      const chatMessages = [...messages, newUserMsg];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId: diagnosisId || null,
          messages: chatMessages,
        })
      });

      if (!response.ok) throw new Error('API Error');

      const result = await response.json();

      setIsTyping(false);
      setIsObdMode(false);

      const newAiMsg: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.data?.text || 'Przepraszam, nie zrozumiałem.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detailedInfo: result.data?.detailedInfo || undefined
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (error: any) {
      console.error("Chat API error:", error);
      setIsTyping(false);
      setIsObdMode(false);
      const errorMsg: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Błąd asystenta AI: ${error.message || 'Nie udało się uzyskać odpowiedzi'}. Spróbuj ponownie za chwilę.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col relative overflow-hidden bg-background text-gray-100 font-sans selection:bg-[#00D1FF]/30">

      {/* Fluid Glass Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-20%] w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[-20%] w-80 h-80 bg-sky-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, 20, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute top-[40%] left-[20%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* History Sidebar Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-surface-elevated/95 backdrop-blur-3xl border-r border-foreground/5 z-50 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-foreground/[0.03]">
                <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground/[0.05] hover:bg-foreground/10 text-foreground rounded-2xl font-semibold border border-foreground/5 transition-all">
                  <Plus size={18} strokeWidth={2.5} className="text-primary" /> {t.chat.newDiagnosis}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-hide">
                <div>
                  <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-3">Zapisane Diagnozy</h3>
                  <div className="flex flex-col gap-1">
                    {historyItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsHistoryOpen(false);
                          if (onSelectDiagnosis) onSelectDiagnosis(item.id);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors group ${diagnosisId === item.id ? 'bg-primary/10 border-primary/20 relative overflow-hidden' : 'hover:bg-foreground/[0.03] border-transparent'}`}
                      >
                        {diagnosisId === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ml-1 transition-colors ${diagnosisId === item.id ? 'bg-primary/20' : 'bg-foreground/[0.05] group-hover:bg-foreground/[0.1]'}`}>
                          <Hash size={14} className={diagnosisId === item.id ? 'text-primary' : 'text-gray-400'} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-sm font-medium truncate transition-colors ${diagnosisId === item.id ? 'text-gray-100' : 'text-gray-300 group-hover:text-gray-100'}`}>{getTitle(item)}</span>
                          <span className={`text-xs ${diagnosisId === item.id ? 'text-primary/80' : 'text-gray-500'}`}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                    {historyItems.length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-500">Brak historii</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-8 pb-32 px-5 flex flex-col gap-6 z-10 scrollbar-hide relative">
        {/* Welcome State */}
        <div className="flex flex-col items-center justify-center py-8 relative">

          {/* Top Left Menu / Back Controls */}
          <div className="absolute left-0 top-6 flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-foreground bg-foreground/[0.03] hover:bg-foreground/10 rounded-xl border border-foreground/[0.05] transition-colors"
                title="Wróć"
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
            )}

            {/* Hamburger Button to open Drawer */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-400 hover:text-foreground bg-foreground/[0.03] hover:bg-foreground/10 rounded-xl border border-foreground/[0.05] transition-colors"
              title="Historia czatów"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>

          <div className="w-20 h-20 rounded-full bg-foreground/[0.03] backdrop-blur-2xl border border-foreground/[0.08] flex items-center justify-center mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            <Wrench size={32} className="text-gray-200 relative z-10 drop-shadow-lg" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em] drop-shadow-md">{t.chat.title}</p>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">11:00</p>
        </div>

        {messages.map((msg) => (
          <MessageItem key={msg.id} msg={msg} />
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[88%] self-start"
          >
            <div className="w-8 h-8 rounded-full bg-foreground/[0.05] backdrop-blur-xl flex items-center justify-center shrink-0 border border-foreground/[0.1] shadow-[0_4px_16px_rgba(0,0,0,0.4)] mt-auto mb-1">
              <Wrench size={14} className="text-gray-200" strokeWidth={2} />
            </div>
            <div className="bg-foreground/[0.05] backdrop-blur-2xl border border-foreground/[0.08] rounded-[24px] rounded-bl-sm p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center gap-1.5 h-[52px]">
              <motion.div animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
              <motion.div animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
              <motion.div animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-[#06080F] via-[#06080F]/95 to-transparent z-20">
        <div className={`bg-foreground/[0.05] backdrop-blur-3xl border rounded-full p-1.5 pl-4 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-300 ${isRecording ? 'border-red-500/30 bg-red-500/5' : isObdMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-foreground/[0.08]'}`}>
          <button
            onClick={() => setIsObdMode(!isObdMode)}
            className={`p-1.5 rounded-full transition-colors ${isObdMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-400 hover:text-gray-100 hover:bg-foreground/10'}`}
            title={t.chat.scanObd}
          >
            <Cpu size={22} strokeWidth={1.5} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? t.chat.listening : isObdMode ? t.chat.obdPrompt : t.chat.msgPrompt}
            className={`flex-1 bg-transparent border-none outline-none text-[15px] font-medium transition-colors ${isRecording ? 'text-red-200 placeholder:text-red-400/50' : isObdMode ? 'text-emerald-100 placeholder:text-emerald-500/50' : 'text-gray-100 placeholder:text-gray-500'}`}
            disabled={isRecording}
          />
          {inputValue.trim() && !isRecording ? (
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#005bb5] flex items-center justify-center text-foreground hover:opacity-90 transition-opacity shadow-[0_2px_10px_rgba(10,132,255,0.5)] shrink-0 border border-blue-400/30"
            >
              <Send size={16} className="ml-0.5" strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 border shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${isRecording
                ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-foreground/[0.05] text-gray-300 hover:bg-foreground/10 border-foreground/[0.08]'
                }`}
            >
              <Mic size={18} strokeWidth={1.5} className={isRecording ? "animate-pulse" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

